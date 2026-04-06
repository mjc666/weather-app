import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const layer = searchParams.get('layer') || 'precipitation_new';
  const z = searchParams.get('z') || '5';
  const x = searchParams.get('x') || '10';
  const y = searchParams.get('y') || '10';

  // Check Cache
  const cacheKey = `radar:${layer}:${z}:${x}:${y}`;
  const cachedData = (await getCache(cacheKey)) as Buffer | undefined;
  if (cachedData) {
    return new NextResponse(Uint8Array.from(cachedData), {
      headers: { 
        'Content-Type': 'image/png',
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=600'
      },
    });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
  }

  const url = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new NextResponse('Failed to fetch tile', { status: response.status });
    }
    const buffer = await response.arrayBuffer();
    const data = Buffer.from(buffer);

    // Store in cache (600 seconds = 10 minutes)
    await setCache(cacheKey, data, 600);

    return new NextResponse(data, {
      headers: { 
        'Content-Type': 'image/png',
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=600'
      },
    });
  } catch (error) {
    return new NextResponse('Error fetching tile', { status: 500 });
  }
}
