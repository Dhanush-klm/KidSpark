import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use Whisper API to transcribe
    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], audioFile.name, { type: audioFile.type }),
      model: 'whisper-1',
    });

    return NextResponse.json({
      text: transcription.text,
      success: true
    });

  } catch (error) {
    console.error('Whisper API error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
