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
    const enhancedPrompt = `Generate a simple, clean black and white line art sketch based on the user's prompt: ${prompt}.

The style must be a minimalist coloring book page, using only pure black lines on a solid white background. There must be no colors, shading, or grayscale.

The most important feature is the strategic placement of dots to guide coloring:

Selective Areas: You must strategically select only some areas of the image to be colored (e.g., the main subject, a background element like a cloud or hill). Not all shapes should have dots. This selection is crucial for creating a final, high-contrast black and white image when the child colors these parts.

Dot Placement: All dots must be placed inside the outlines of the specific areas you have selected for coloring.

Dot Style & Density: The dots must be solid black circles of a medium, clearly visible size. These dots should partially fill the selected areas in a sparse, scattered pattern. There must be significant white space between the dots.

Avoid: Do not use tiny, fine stippling. Do not fill the area with a dense "chicken pox" pattern.

The final image should be a clean line drawing where specific parts are clearly but sparsely dotted, perfectly indicating to a child which sections to fill in with black.`;

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
