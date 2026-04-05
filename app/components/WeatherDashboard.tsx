'use client';

import { useState, useEffect } from 'react';
import RadarMap from './RadarMap';
import { getConditionClasses } from '@/lib/weather-utils';

export default function WeatherDashboard() {
  const [weather, setWeather] = useState<any>(null);
  const [city, setCity] = useState('New York');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async (cityName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?q=${encodeURIComponent(cityName)}`);
      const data = await res.json();
      if (data.error) setError(data.error);
      else setWeather(data);
    } catch {
      setError('Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedCity = localStorage.getItem('lastCity') || 'New York';
    setCity(savedCity);
    fetchWeatherData(savedCity);
  }, []);

  const handleSearch = () => {
    localStorage.setItem('lastCity', city);
    fetchWeatherData(city);
  };

  if (loading) return <div className="text-center py-20 text-gray-600">Loading dashboard...</div>;
  if (error) return <div className="text-center py-20 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <img src="/icons/favicon.png" alt="Cloud Icon" className="w-10 h-10" />
            The Weather App
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-13">Powered by OpenWeatherMap</p>
        </div>
        <div className="flex gap-2 w-full md:max-w-sm">
          <input 
            type="text" 
            value={city} 
            onChange={(e) => setCity(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            placeholder="Search city..."
          />
          <button 
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition"
          >
            Search
          </button>
        </div>
      </header>

      {weather && (
        <main className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className={`border p-6 rounded-2xl shadow-sm ${getConditionClasses(weather.current.weather[0].description)}`}>
              <h2 className="text-2xl font-bold mb-4">Current Conditions</h2>
              <div className="space-y-2">
                <p className="text-6xl font-black">{Math.round(weather.current.temp)}°F</p>
                <p className="text-lg">Feels like {Math.round(weather.current.feels_like)}°F</p>
                <p className="text-xl capitalize font-medium">{weather.current.weather[0].description}</p>
                <div className="flex gap-6 pt-4 text-sm font-semibold">
                  <p>Wind: {Math.round(weather.current.wind_speed)} mph</p>
                  <p>Humidity: {weather.current.humidity}%</p>
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Radar</h2>
              <RadarMap lat={weather.lat} lon={weather.lon} city={city} />
            </section>
          </div>

          <section>
            <h2 className="text-2xl font-bold mb-4">Hourly Forecast</h2>
            <div className="flex gap-4 overflow-x-auto pb-6">
              {weather.hourly.map((hour: any, index: number) => (
                <div key={index} className="bg-white border border-gray-200 shadow-sm p-4 rounded-xl text-center min-w-[120px]">
                  <p className="font-semibold">{new Date(hour.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                  <p className="text-2xl font-bold py-2">{Math.round(hour.temp)}°F</p>
                  <p className="text-sm text-gray-500 capitalize">{hour.weather[0].main}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8-Day Forecast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {weather.daily.map((day: any, index: number) => (
                <div key={index} className={`border p-4 rounded-xl shadow-sm text-center ${getConditionClasses(day.weather[0].description)}`}>
                  <p className="font-semibold">{new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  <p className="text-sm opacity-70 mb-2">{new Date(day.dt * 1000).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</p>
                  <p className="font-bold">H: {Math.round(day.temp.max)}°F</p>
                  <p className="mb-2">L: {Math.round(day.temp.min)}°F</p>
                  <p className="text-xs italic capitalize">{day.weather[0].description}</p>
                  <p className="text-xs font-semibold text-blue-700 mt-2">{Math.round(day.pop * 100)}% rain</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
