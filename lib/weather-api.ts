export const fetchWeather = async (city: string) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
  if (!res.ok) throw new Error('Failed to fetch current weather');
  return res.json();
};

export const fetchForecast = async (city: string) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
  if (!res.ok) throw new Error('Failed to fetch forecast');
  return res.json();
};
