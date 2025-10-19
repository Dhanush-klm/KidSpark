import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

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

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt } = await request.json();

    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: 'Image URL and prompt are required' },
        { status: 400 }
      );
    }

    // Fetch the image from the URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBytes = Buffer.from(imageBuffer);

    // Generate video using Veo 3.1 with the image
    const operation = await ai.models.generateVideos({
      model: "veo-3.1-generate-preview",
      prompt: prompt,
      image: {
        imageBytes: imageBytes.toString('base64'),
        mimeType: "image/png",
      },
    });

    // Poll the operation status until the video is ready
    let currentOperation = operation;
    while (!currentOperation.done) {
      console.log("Waiting for video generation to complete...");
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
      currentOperation = await ai.operations.getVideosOperation({
        operation: currentOperation,
      });
    }

    if (!currentOperation.response?.generatedVideos?.[0]?.video) {
      throw new Error('No video generated');
    }

    // Get the video file
    const videoFile = currentOperation.response.generatedVideos[0].video;

    // Download the video to a temporary location
    await ai.files.download({
      file: videoFile,
      downloadPath: "temp_video.mp4",
    });

    // Read the downloaded file
    const videoBuffer = fs.readFileSync("temp_video.mp4");

    // Upload the video to Supabase Storage
    const fileName = `generated-videos/${Date.now()}.mp4`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('kidspark') // Your Supabase bucket name
      .upload(fileName, videoBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'video/mp4'
      });

    if (uploadError) {
      throw new Error(`Failed to upload video: ${uploadError.message}`);
    }

    // Return the relative path for use with the proxy route
    return NextResponse.json({
      success: true,
      videoPath: fileName,  // e.g., 'generated-videos/1234567890.mp4'
    });

  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}
