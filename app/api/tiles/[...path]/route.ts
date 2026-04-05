import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const z = searchParams.get('z');
  const x = searchParams.get('x');
  const y = searchParams.get('y');

  if (!z || !x || !y) {
    return new NextResponse('Missing tile coordinates', { status: 400 });
  }

  // Check Cache (Cache longer: 24 hours)
  const cacheKey = `osm:${z}:${x}:${y}`;
  const cachedData = (await getCache(cacheKey)) as Buffer | undefined;
  if (cachedData) {
    return new NextResponse(Uint8Array.from(cachedData), {
      headers: { 
        'Content-Type': 'image/png',
        'X-Cache': 'HIT',
      },
    });
  }

  const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'WeatherApp/1.0' } // OSM requires a descriptive UA
    });
    if (!response.ok) {
      return new NextResponse('Failed to fetch tile', { status: response.status });
    }
    const buffer = await response.arrayBuffer();
    const data = Buffer.from(buffer);

    // Store in cache (86400 seconds = 24 hours)
    await setCache(cacheKey, data, 86400);

    return new NextResponse(data, {
      headers: { 
        'Content-Type': 'image/png',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    return new NextResponse('Error fetching tile', { status: 500 });
  }
}
