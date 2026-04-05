import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'City name (q) is required' }, { status: 400 });
  }

  // Check Cache
  const cacheKey = `weather:${q.toLowerCase()}`;
  const rawCache = await getCache(cacheKey);
  const cachedData = typeof rawCache === 'string' ? JSON.parse(rawCache) : rawCache;
  if (cachedData) {
    return NextResponse.json(cachedData, {
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, s-maxage=600' }
    });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Internal server error: Missing API Key' }, { status: 500 });
  }

  // 1. Geocode the city name to get lat/lon
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${apiKey}`;
  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();

  if (!geoData || geoData.length === 0) {
    return NextResponse.json({ error: 'City not found' }, { status: 404 });
  }

  const { lat, lon } = geoData[0];

  // 2. Fetch weather using lat/lon
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=imperial&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: response.status });
    }
    const data = await response.json();
    
    // Store in cache
    await setCache(cacheKey, data);
    
    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, s-maxage=600' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
