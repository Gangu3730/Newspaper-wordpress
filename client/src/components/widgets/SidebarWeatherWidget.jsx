import React from 'react';
import { MapPin, Sun, Wind, Droplets } from 'lucide-react';
import './SidebarWeatherWidget.css';

const SidebarWeatherWidget = () => {
  return (
    <div className="sidebar-weather">
      <div className="sidebar-weather__header">
        <div className="sidebar-weather__title">
          <Sun className="weather-icon" size={20} />
          <span>Weather</span>
        </div>
        <div className="sidebar-weather__location">
          <MapPin size={14} />
          <select className="location-select">
            <option>New Delhi</option>
            <option>Ranchi</option>
            <option>Patna</option>
          </select>
        </div>
      </div>
      
      <div className="sidebar-weather__main">
        <div className="weather-temp-block">
          <span className="temp-value">33°C</span>
          <span className="temp-desc">Clear sky</span>
          <div className="temp-high-low">
            <span className="high">↑44°</span>
            <span className="low">↓33°</span>
          </div>
        </div>
        
        <div className="weather-icon-large">
          <Sun size={64} style={{ color: '#fbbf24' }} />
        </div>
        
        <div className="weather-details">
          <div className="detail-item">
            <Wind size={14} />
            <span>हवा 10 km/h</span>
          </div>
          <div className="detail-item">
            <Droplets size={14} />
            <span>आर्द्रता 31%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarWeatherWidget;
