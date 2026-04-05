import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const layer = searchParams.get('layer') || 'precipitation_new';
  const z = searchParams.get('z') || '5';
  const x = searchParams.get('x') || '10';
  const y = searchParams.get('y') || '10';

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
    return new NextResponse(Buffer.from(buffer), {
      headers: { 
        'Content-Type': 'image/png',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300'
      },
    });
  } catch (error) {
    return new NextResponse('Error fetching tile', { status: 500 });
  }
}
