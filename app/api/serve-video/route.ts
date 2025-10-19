import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoPath = searchParams.get('path');

  if (!videoPath) {
    return new NextResponse('Video path is required', { status: 400 });
  }

  try {
    // Fetch the video file from Supabase Storage
    const { data, error } = await supabase.storage
      .from('kidspark')
      .download(videoPath);

    if (error) {
      throw new Error(`Failed to download video: ${error.message}`);
    }

    // Convert to buffer and return as response
    const buffer = await data.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving video:', error);
    return new NextResponse('Error serving video', { status: 500 });
  }
}
