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

  console.log('Serve video request for path:', videoPath);

  if (!videoPath) {
    console.error('No video path provided');
    return new NextResponse('Video path is required', { status: 400 });
  }

  try {
    // Fetch the video file from Supabase Storage
    const { data, error } = await supabase.storage
      .from('kidspark')
      .download(videoPath);

    if (error) {
      console.error('Supabase download error:', error);
      throw new Error(`Failed to download video: ${error.message}`);
    }

    if (!data) {
      console.error('No data returned from Supabase');
      throw new Error('No video data found');
    }

    console.log('Video data size:', data.size, 'bytes');

    // Convert to buffer and return as response
    const buffer = await data.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving video:', error);
    return new NextResponse(`Error serving video: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}
