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

    // Normalize filename/extension for Whisper expectations (iOS often sends blobs with no extension)
    const originalName = audioFile.name || 'audio';
    const mimeType = (audioFile.type || '').toLowerCase();

    const supportedExtensions = new Set([
      'flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm'
    ]);

    const getExtensionFromMime = (mime: string): string | null => {
      switch (mime) {
        case 'audio/mp4':
        case 'audio/aac':
          return 'm4a';
        case 'video/mp4':
          return 'mp4';
        case 'audio/mpeg':
          return 'mp3';
        case 'audio/wav':
        case 'audio/x-wav':
          return 'wav';
        case 'audio/webm':
        case 'video/webm':
          return 'webm';
        case 'audio/ogg':
          return 'ogg';
        case 'audio/flac':
          return 'flac';
        default:
          return null;
      }
    };

    const hasSupportedExtension = (name: string): boolean => {
      const dotIndex = name.lastIndexOf('.');
      if (dotIndex === -1) return false;
      const ext = name.slice(dotIndex + 1).toLowerCase();
      return supportedExtensions.has(ext);
    };

    // Explicitly reject common unsupported iOS formats that Whisper won't accept
    if (mimeType === 'video/quicktime' || mimeType === 'audio/x-caf') {
      return NextResponse.json(
        { error: 'Unsupported iOS format (mov/caf). Please record audio (m4a/mp3/wav).' },
        { status: 415 }
      );
    }

    const extFromMime = getExtensionFromMime(mimeType);
    const safeName = hasSupportedExtension(originalName) && originalName
      ? originalName
      : (extFromMime ? `audio.${extFromMime}` : originalName);

    // Use Whisper translations endpoint to always return English
    const transcription = await openai.audio.translations.create({
      file: new File([buffer], safeName, { type: mimeType || 'application/octet-stream' }),
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
