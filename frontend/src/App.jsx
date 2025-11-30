import { useState } from "react";
import { fetchWeather } from "./api/weatherService";
import "./App.css";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("C"); // C or F

  const convertTemp = (t) => {
    return unit === "C" ? t : Math.round((t * 9) / 5 + 32);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError("");

    try {
      const data = await fetchWeather(city);
      setWeather(data);
    } catch (err) {
      setError("City not found or server error");
      setWeather(null);
    }

    setLoading(false);
  };

  return (
    <div className="app">

      <h1 className="title">THE WEATHER FORECASTING</h1>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city..."
        />
        <button>Search</button>

        {/* °C / °F Toggle */}
        <div className="unit-toggle">
          <button
            type="button"
            className={unit === "C" ? "active" : ""}
            onClick={() => setUnit("C")}
          >
            °C
          </button>
          <button
            type="button"
            className={unit === "F" ? "active" : ""}
            onClick={() => setUnit("F")}
          >
            °F
          </button>
        </div>
      </form>

      {error && <div className="error-box">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {weather && (
        <div className="container">

          {/* LEFT PANEL */}
          <div className="left">
            <h2>
              {weather.location.city}, {weather.location.country}
            </h2>
            <p>Today {weather.location.date}</p>

            <div className="current">
              <img src={weather.current.icon} alt="icon" />
              <h1>{convertTemp(weather.current.temp)}°{unit}</h1>
              <p>{weather.current.description}</p>
            </div>

            <div className="sun-times">
              <p>🌅 Sunrise: {weather.current.sunrise}</p>
              <p>🌇 Sunset: {weather.current.sunset}</p>
            </div>

            <h3>Air Conditions</h3>
            <div className="grid">
              <div>Real Feel: {convertTemp(weather.current.real_feel)}°{unit}</div>
              <div>Wind: {weather.current.wind} m/s</div>
              <div>Clouds: {weather.current.clouds}%</div>
              <div>Humidity: {weather.current.humidity}%</div>
            </div>

            <h3>Next Hours</h3>
            <div className="hourly">
              {weather.hourly.map((h, i) => (
                <div key={i} className="hour">
                  <p>{h.hour}</p>
                  <img src={h.icon} alt="icon" />
                  <p>{convertTemp(h.temp)}°{unit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="right">
            <h3>7-Day Forecast</h3>

            {weather.daily.map((d, i) => (
              <div className="day-row" key={i}>
                <div className="day-left">
                  <strong>{d.day}</strong>
                  <p>{d.description}</p>
                </div>

                <div className="day-right">
                  <span>{convertTemp(d.temp)}°{unit}</span>
                  <span>{d.wind} m/s</span>
                  <span>{d.clouds}% clouds</span>
                  <span>{d.humidity}% humidity</span>
                  <img src={d.icon} alt="icon" />
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
