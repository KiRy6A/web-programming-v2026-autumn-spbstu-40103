import React, {useState, useEffect, StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';

import {getWeatherInfo} from './wmo.js';

async function getWeatherForCity(rawName, interval) {
  const normalized = rawName.trim().toLowerCase();
  const urlGeocode = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(normalized)}&count=1&language=ru`;

  const responseCity = await fetch(urlGeocode);
  if (!responseCity.ok) {
    throw new Error('City response not ok');
  }

  const geoData = await responseCity.json();
  if (!geoData.results || geoData.results.length === 0) {
    throw new Error(`City not found: ${normalized}`);
  }

  const {latitude, longitude} = geoData.results[0];
  const urlWeather = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=${interval}`;

  const responseWeather = await fetch(urlWeather);
  if (!responseWeather.ok) {
    throw new Error('City response not ok');
  }

  const data = await responseWeather.json();
  return data;
}

function App() {
  const [cityInput, setCityInput] = useState('');

  const [selectedCity, setSelectedCity] = useState(
    () => localStorage.getItem('city') || 'Санкт-Петербург',
  );
  const [daysInterval, setDaysInterval] = useState(
    () => Number(localStorage.getItem('days')) || 3,
  );

  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError('');
      setWeatherData(null);

      try {
        const data = await getWeatherForCity(selectedCity, daysInterval);
        const info = getWeatherInfo(data.current.weather_code);

        setWeatherData({
          city: selectedCity,
          current: {
            temp: Math.round(data.current.temperature_2m),
            feelsLike: Math.round(data.current.apparent_temperature),
            description: info.desc,
            humidity: data.current.relative_humidity_2m,
            wind: data.current.wind_speed_10m,
            pressure: Math.round(data.current.surface_pressure * 0.750062),
            icon: info.icon,
          },
          forecast: data.daily.time.map((dateStr, index) => {
            const dateObj = new Date(dateStr);
            const isToday = index === 0;
            const wmo = getWeatherInfo(data.daily.weather_code[index]);

            return {
              day: isToday
                ? 'Сегодня'
                : dateObj.toLocaleDateString('ru-RU', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  }),
              tempDay: Math.round(data.daily.temperature_2m_max[index]),
              tempNight: Math.round(data.daily.temperature_2m_min[index]),
              condition: wmo.desc,
              icon: wmo.icon,
            };
          }),
        });
      } catch (err) {
        setError('Fetch weather data error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    localStorage.setItem('city', selectedCity);
    localStorage.setItem('days', daysInterval);
  }, [selectedCity, daysInterval]);

  const handleCitySubmit = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      setSelectedCity(cityInput.trim());
      setCityInput('');
    }
  };

  return (
    <main data-testid="app" className="weather-app">
      <header className="app-header">
        <h1>Прогноз погоды</h1>
      </header>

      {/* Форма поиска */}
      <form className="search-form" onSubmit={handleCitySubmit}>
        <input
          type="text"
          data-testid="weather-city"
          className="city-input"
          placeholder="Найти город..."
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
        />
        <button
          type="submit"
          data-testid="weather-submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Поиск...' : 'Показать'}
        </button>
      </form>

      {error && (
        <div
          className="error-message"
          style={{color: 'red', marginBottom: '16px'}}
        >
          {error}
        </div>
      )}

      {weatherData && !error && (
        <>
          <section
            data-testid="weather-current"
            className="current-weather-card"
          >
            <div className="current-main">
              <div>
                <h2 className="city-title">{weatherData.city}</h2>
                <p className="weather-desc">
                  {weatherData.current.icon} {weatherData.current.description}
                </p>
              </div>
              <div className="temp-badge">
                {weatherData.current.temp > 0
                  ? `+${weatherData.current.temp}`
                  : weatherData.current.temp}
                °C
              </div>
            </div>

            <div className="weather-metrics">
              <div className="metric-item">
                <span className="metric-label">Ощущается как</span>
                <span className="metric-value">
                  {weatherData.current.feelsLike}°C
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Влажность</span>
                <span className="metric-value">
                  {weatherData.current.humidity}%
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Ветер</span>
                <span className="metric-value">
                  {weatherData.current.wind} км/ч
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Давление</span>
                <span className="metric-value">
                  {weatherData.current.pressure} мм рт. ст.
                </span>
              </div>
            </div>
          </section>

          <div className="interval-controls">
            <h2>Прогноз:</h2>
            <div className="interval-buttons">
              {[1, 3, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  data-testid={`interval-${days}`}
                  className={`interval-btn ${daysInterval === days ? 'active' : ''}`}
                  onClick={() => setDaysInterval(days)}
                >
                  {days} {days === 1 ? 'день' : 'дня/дней'}
                </button>
              ))}
            </div>
          </div>

          <section data-testid="weather-forecast" className="forecast-grid">
            {weatherData.forecast.map((item, index) => (
              <article key={index} className="forecast-card">
                <div className="forecast-day">{item.day}</div>
                <div className="forecast-icon">{item.icon}</div>
                <div className="forecast-condition">{item.condition}</div>
                <div className="forecast-temps">
                  <div className="temp-day">
                    Днём: {item.tempDay > 0 ? `+${item.tempDay}` : item.tempDay}
                    °C
                  </div>
                  <div className="temp-night">
                    Ночью:{' '}
                    {item.tempNight > 0 ? `+${item.tempNight}` : item.tempNight}
                    °C
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
