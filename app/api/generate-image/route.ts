import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, sampleCount = 1 } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Enhanced prompt for black sketch style with minimal, integrated dotted areas for children to sketch
    const enhancedPrompt = `${prompt}. Black and white line art sketch only, no colors, no shading, no grayscale, just pure black lines on white background. Simple, clean line drawing perfect for children to color. Include ONLY 4-6 strategically placed black filled circles that serve as natural focal points within the sketch design - like eyes on characters, centers of flowers, or key decorative elements. These dots should be perfectly integrated into the line art and positioned sparingly to create clean, intentional coloring opportunities. Avoid scattered or random dots. Minimalist sketch style, like a coloring book page with just a few purposeful black circular elements that invite creative coloring.`;

    // Use the direct API call instead of the SDK for Imagen
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: enhancedPrompt
          }
        ],
        parameters: {
          sampleCount: sampleCount
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Imagen API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // Extract image data from Imagen API response
    if (!result.predictions || result.predictions.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate image - no image data received' },
        { status: 500 }
      );
    }

    // Handle multiple samples - return the first one for now
    // In a more advanced implementation, you could return all variations
    const firstPrediction = result.predictions[0];
    if (!firstPrediction.bytesBase64Encoded) {
      return NextResponse.json(
        { error: 'Failed to generate image - invalid image data format' },
        { status: 500 }
      );
    }

    // Convert base64 to data URL
    const base64Data = firstPrediction.bytesBase64Encoded;
    const imageUrl = `data:image/png;base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      prompt: enhancedPrompt,
      sampleCount: sampleCount,
      totalSamples: result.predictions.length
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
