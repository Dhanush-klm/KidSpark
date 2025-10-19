import { GoogleGenAI } from "@google/genai";
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
// ffmpeg-based helpers removed in single-clip mode

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// Note: Supabase removed for direct preview flow

// Helper function to poll operation until complete
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// Stitch/extract helpers removed in single-clip mode

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt } = await request.json();

    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: 'Image URL and prompt are required' },
        { status: 400 }
      );
    }

    console.log('🎬 Starting 8-second video generation...');

    // Fetch the image from the URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBytes = Buffer.from(imageBuffer);

    // STEP 1: Generate first 8-second clip (coloring the dotted areas in black)
    console.log('📹 Generating first 8-second clip (coloring)...');
    const coloringPrompt = `Generate a two-phase, kid-friendly animation.

Coloring Phase: First, animate the input sketch's dotted regions by filling them with solid, flat, black color.

Crucial Style: The fill must be a perfectly clean, solid black fill (like a silhouette).

Do NOT show any scribbling, marker strokes, crayon effects, or any animation of a tool (like a pen or brush) doing the coloring.

The solid black color should just gradually and smoothly appear inside the lines until all dotted areas are full.

Animation Phase: Only after all dotted regions are completely filled with solid black, make these newly filled objects come to life and animate the scene based on the following prompt: ${prompt}.`;
    const operation1 = await ai.models.generateVideos({
      model: "veo-2.0-generate-001",
      prompt: coloringPrompt,
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
    console.log('✅ First clip generated (single-clip mode). Returning base64 for preview...');

    // Return only the first 8s clip as base64 data URL (ephemeral)
    const dataUrl = `data:video/mp4;base64,${videoBuffer1.toString('base64')}`;

    return NextResponse.json({
      success: true,
      dataUrl,
      duration: '~8 seconds'
    });

  } catch (error) {
    console.error('❌ Error generating video:', error);
    return NextResponse.json(
      { error: 'Failed to generate video', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
