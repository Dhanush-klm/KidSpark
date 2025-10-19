import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import ffmpeg from 'fluent-ffmpeg';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// Set ffmpeg path to system ffmpeg
ffmpeg.setFfmpegPath('/opt/homebrew/bin/ffmpeg');

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to poll operation until complete
async function pollOperation(operation: any) {
  let currentOperation = operation;
  while (!currentOperation.done) {
    console.log("Waiting for video generation to complete...");
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
    currentOperation = await ai.operations.getVideosOperation({
      operation: currentOperation,
    });
  }
  return currentOperation;
}

// Helper function to download video from Google API
async function downloadVideo(videoFile: any): Promise<Buffer> {
  if (!videoFile.uri) {
    throw new Error('Video URI is missing');
  }

  const videoUrl = new URL(videoFile.uri);
  videoUrl.searchParams.set('key', process.env.GOOGLE_API_KEY || '');

  const response = await fetch(videoUrl.toString());

  if (!response.ok) {
    throw new Error(`Failed to fetch video: ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Helper function to stitch two videos together
async function stitchVideos(video1Buffer: Buffer, video2Buffer: Buffer): Promise<Buffer> {
  const tempDir = tmpdir();
  const video1Path = join(tempDir, `clip1-${Date.now()}.mp4`);
  const video2Path = join(tempDir, `clip2-${Date.now()}.mp4`);
  const listPath = join(tempDir, `list-${Date.now()}.txt`);
  const outputPath = join(tempDir, `output-${Date.now()}.mp4`);

  try {
    // Write temporary files
    await writeFile(video1Path, video1Buffer);
    await writeFile(video2Path, video2Buffer);
    
    // Create concat list file for ffmpeg
    const listContent = `file '${video1Path}'\nfile '${video2Path}'`;
    await writeFile(listPath, listContent);

    // Stitch videos using ffmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(listPath)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .outputOptions(['-c', 'copy'])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });

    // Read the stitched video
    const { readFile } = await import('fs/promises');
    const stitchedBuffer = await readFile(outputPath);

    // Clean up temporary files
    await Promise.all([
      unlink(video1Path).catch(() => {}),
      unlink(video2Path).catch(() => {}),
      unlink(listPath).catch(() => {}),
      unlink(outputPath).catch(() => {})
    ]);

    return stitchedBuffer;
  } catch (error) {
    // Clean up on error
    await Promise.all([
      unlink(video1Path).catch(() => {}),
      unlink(video2Path).catch(() => {}),
      unlink(listPath).catch(() => {}),
      unlink(outputPath).catch(() => {})
    ]);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt } = await request.json();

    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: 'Image URL and prompt are required' },
        { status: 400 }
      );
    }

    console.log('🎬 Starting 15-second video generation...');

    // Fetch the image from the URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBytes = Buffer.from(imageBuffer);

    // STEP 1: Generate first 8-second clip
    console.log('📹 Generating first 8-second clip...');
    const operation1 = await ai.models.generateVideos({
      model: "veo-3.0-fast-generate-001",
      prompt: prompt,
      image: {
        imageBytes: imageBytes.toString('base64'),
        mimeType: "image/png",
      },
    });

    const completedOp1 = await pollOperation(operation1);

    if (!completedOp1.response?.generatedVideos?.[0]?.video) {
      throw new Error('No video generated for first clip');
    }

    const videoFile1 = completedOp1.response.generatedVideos[0].video;
    const videoBuffer1 = await downloadVideo(videoFile1);
    console.log('✅ First clip generated successfully');

    // STEP 2: Generate second 7-second clip with continuation prompt
    console.log('📹 Generating second 7-second clip (continuation)...');
    
    // Create a continuation prompt that builds on the first clip
    const continuationPrompt = `${prompt} The scene continues smoothly, maintaining the same visual style and character.`;
    
    const operation2 = await ai.models.generateVideos({
      model: "veo-3.0-fast-generate-001",
      prompt: continuationPrompt,
      image: {
        imageBytes: imageBytes.toString('base64'),
        mimeType: "image/png",
      },
    });

    const completedOp2 = await pollOperation(operation2);

    if (!completedOp2.response?.generatedVideos?.[0]?.video) {
      throw new Error('No video generated for second clip');
    }

    const videoFile2 = completedOp2.response.generatedVideos[0].video;
    const videoBuffer2 = await downloadVideo(videoFile2);
    console.log('✅ Second clip generated successfully');

    // STEP 3: Stitch both videos together
    console.log('🔗 Stitching clips together...');
    const finalVideoBuffer = await stitchVideos(videoBuffer1, videoBuffer2);
    console.log('✅ Videos stitched successfully. Final size:', finalVideoBuffer.length, 'bytes');

    // STEP 4: Upload the final 15-second video to Supabase
    const fileName = `generated-videos/${Date.now()}.mp4`;
    console.log('☁️ Uploading final video to Supabase:', fileName);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('kidspark')
      .upload(fileName, finalVideoBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'video/mp4'
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error(`Failed to upload video: ${uploadError.message}`);
    }

    console.log('🎉 15-second video generation complete!');

    return NextResponse.json({
      success: true,
      videoPath: fileName,
      duration: '~15 seconds'
    });

  } catch (error) {
    console.error('❌ Error generating video:', error);
    return NextResponse.json(
      { error: 'Failed to generate video', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
