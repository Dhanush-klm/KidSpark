import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

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
    const base64Video = videoBuffer.toString('base64');
    const mimeType = 'video/mp4';

    return NextResponse.json({
      success: true,
      videoUrl: `data:${mimeType};base64,${base64Video}`,
    });

  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}
