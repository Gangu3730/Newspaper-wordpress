import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, Sun, CloudSun, CloudRain, Snowflake, CloudLightning, Cloud, 
  Wind, Droplets, Search, Compass, Loader2, X 
} from 'lucide-react';
import './SidebarWeatherWidget.css';

const DEFAULT_CITY = { name: 'पटना', lat: 25.5948, lon: 85.1376 };

const SidebarWeatherWidget = () => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [locationDetecting, setLocationDetecting] = useState(false);

  // Auto-detect location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  // Fetch weather when selectedCity changes
  useEffect(() => {
    if (!selectedCity) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
        const res = await axios.get(url);
        
        if (res.data && res.data.current) {
          setWeatherData({
            temp: Math.round(res.data.current.temperature_2m),
            desc: getWeatherDesc(res.data.current.weather_code).text,
            high: Math.round(res.data.daily.temperature_2m_max[0]),
            low: Math.round(res.data.daily.temperature_2m_min[0]),
            wind: Math.round(res.data.current.wind_speed_10m),
            humidity: Math.round(res.data.current.relative_humidity_2m),
            code: res.data.current.weather_code
          });
        }
      } catch (err) {
        console.error("Error fetching weather:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [selectedCity]);

  // Geolocation detector
  const detectLocation = () => {
    setLocationDetecting(true);
    
    if (!navigator.geolocation) {
      fallbackToIP();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Let's resolve the city name using geocoding API or simple default name
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=hi,en`);
          const name = res.data?.address?.city || res.data?.address?.town || res.data?.address?.suburb || '📍 मेरा स्थान';
          setSelectedCity({ name, lat: latitude, lon: longitude });
        } catch {
          setSelectedCity({ name: '📍 वर्तमान स्थान', lat: latitude, lon: longitude });
        } finally {
          setLocationDetecting(false);
        }
      },
      (error) => {
        console.warn("Browser Geolocation blocked/failed. Trying IP location...", error);
        fallbackToIP();
      },
      { timeout: 5000 }
    );
  };

  const fallbackToIP = async () => {
    try {
      const res = await axios.get('https://ipapi.co/json/');
      if (res.data && res.data.latitude && res.data.longitude) {
        setSelectedCity({
          name: res.data.city || 'Ghaziabad',
          lat: res.data.latitude,
          lon: res.data.longitude
        });
      } else {
        setSelectedCity(DEFAULT_CITY);
      }
    } catch (err) {
      console.error("IP Geolocator failed:", err);
      setSelectedCity(DEFAULT_CITY);
    } finally {
      setLocationDetecting(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearchError(false);
    try {
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery.trim())}&count=1&language=en&format=json`;
      const res = await axios.get(geocodeUrl);

      if (res.data?.results && res.data.results.length > 0) {
        const result = res.data.results[0];
        setSelectedCity({
          name: result.name,
          lat: result.latitude,
          lon: result.longitude
        });
        setSearchQuery('');
        setIsSearching(false);
      } else {
        setSearchError(true);
        setTimeout(() => setSearchError(false), 3000);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      setSearchError(true);
      setTimeout(() => setSearchError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherDesc = (code) => {
    if (code === 0) return { icon: <Sun size={64} style={{ color: '#fbbf24' }} />, text: 'साफ़ आसमान' };
    if ([1, 2, 3].includes(code)) return { icon: <CloudSun size={64} style={{ color: '#9ca3af' }} />, text: 'आंशिक बादल' };
    if ([45, 48].includes(code)) return { icon: <Cloud size={64} style={{ color: '#9ca3af' }} />, text: 'घना कोहरा' };
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { icon: <CloudRain size={64} style={{ color: '#3b82f6' }} />, text: 'बारिश' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: <Snowflake size={64} style={{ color: '#60a5fa' }} />, text: 'बर्फबारी' };
    if ([95, 96, 99].includes(code)) return { icon: <CloudLightning size={64} style={{ color: '#f59e0b' }} />, text: 'आंधी-तूफान' };
    return { icon: <Cloud size={64} style={{ color: '#9ca3af' }} />, text: 'सुहावना' };
  };

  const weather = weatherData ? getWeatherDesc(weatherData.code) : { icon: <Sun size={64} style={{ color: '#fbbf24' }} />, text: 'साफ़ आसमान' };

  return (
    <div className="sidebar-weather">
      <div className="sidebar-weather__header">
        <div className="sidebar-weather__title">
          <Sun className="weather-icon" size={20} style={{ color: '#fbbf24' }} />
          <span>Weather</span>
        </div>
        
        {/* Dynamic Interactive City Selector / Search */}
        <div className="sidebar-weather__location-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isSearching ? (
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '2px 8px' }}>
              <input 
                type="text" 
                autoFocus
                placeholder={searchError ? "नहीं मिला!" : "शहर खोजें..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.8rem',
                  width: '90px',
                  fontWeight: '500',
                  color: '#374151'
                }}
              />
              <button type="submit" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>
                <Search size={12} style={{ color: '#6b7280' }} />
              </button>
              <button type="button" onClick={() => setIsSearching(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', marginLeft: '2px' }}>
                <X size={12} style={{ color: '#9ca3af' }} />
              </button>
            </form>
          ) : (
            <div 
              className="sidebar-weather__location" 
              onClick={() => setIsSearching(true)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', background: 'white', padding: '4px 10px', borderRadius: '16px', fontSize: '0.82rem', border: '1px solid var(--border-color)', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#fbbf24'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              title="स्थान बदलने के लिए क्लिक करें"
            >
              <MapPin size={12} style={{ color: '#ef4444' }} />
              <span style={{ fontWeight: '600', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedCity ? selectedCity.name : 'खोजें...'}
              </span>
              <Search size={10} style={{ color: '#9ca3af', marginLeft: '2px' }} />
            </div>
          )}

          {/* Compass / Auto Detect Button */}
          <button 
            onClick={detectLocation}
            className={`location-detect-btn ${locationDetecting ? 'animate-spin' : ''}`}
            style={{
              border: 'none',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '50%',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-color)',
              transition: 'all 0.2s ease'
            }}
            title="स्वचालित स्थान खोजें (GPS)"
          >
            {locationDetecting ? (
              <Loader2 size={13} className="animate-spin" style={{ color: '#3b82f6' }} />
            ) : (
              <Compass size={13} style={{ color: '#3b82f6' }} />
            )}
          </button>
        </div>
      </div>
      
      {loading || !weatherData ? (
        <div className="sidebar-weather__main" style={{ display: 'flex', justifyContent: 'center', padding: '30px 16px', color: 'var(--text-muted)' }}>
          <Loader2 className="animate-spin" size={24} style={{ color: '#fbbf24' }} />
          <span style={{ marginLeft: '10px', fontSize: '0.9rem' }}>ताज़ा मौसम लोड हो रहा है...</span>
        </div>
      ) : (
        <div className="sidebar-weather__main">
          <div className="weather-temp-block">
            <span className="temp-value">{weatherData.temp}°C</span>
            <span className="temp-desc">{weatherData.desc}</span>
            <div className="temp-high-low">
              <span className="high">↑{weatherData.high}°</span>
              <span className="low">↓{weatherData.low}°</span>
            </div>
          </div>
          
          <div className="weather-icon-large">
            {weather.icon}
          </div>
          
          <div className="weather-details">
            <div className="detail-item">
              <Wind size={14} style={{ color: '#3b82f6' }} />
              <span>हवा {weatherData.wind} km/h</span>
            </div>
            <div className="detail-item">
              <Droplets size={14} style={{ color: '#10b981' }} />
              <span>आर्द्रता {weatherData.humidity}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarWeatherWidget;
