import React from 'react';
import { Star } from 'lucide-react';
import './HoroscopeWidget.css';

const zodiacSigns = [
  { id: 1, name: 'मेष', icon: '♈' },
  { id: 2, name: 'वृषभ', icon: '♉' },
  { id: 3, name: 'मिथुन', icon: '♊' },
  { id: 4, name: 'कर्क', icon: '♋' },
  { id: 5, name: 'सिंह', icon: '♌' },
  { id: 6, name: 'कन्या', icon: '♍' },
];

const HoroscopeWidget = () => {
  return (
    <div className="horoscope-widget">
      <div className="horoscope-widget__header">
        <div className="horoscope-widget__title-group">
          <Star className="horoscope-icon" fill="#f97316" color="#f97316" size={20} />
          <h3 className="horoscope-widget__title">आज का राशिफल</h3>
        </div>
        <span className="horoscope-badge">Daily</span>
      </div>
      
      <div className="horoscope-widget__grid">
        {zodiacSigns.map(sign => (
          <div key={sign.id} className="zodiac-item">
            <div className="zodiac-icon">{sign.icon}</div>
            <span className="zodiac-name">{sign.name}</span>
          </div>
        ))}
      </div>
      <div className="horoscope-widget__footer">
        <a href="#all-signs" className="horoscope-link">सभी राशियाँ देखें</a>
      </div>
    </div>
  );
};

export default HoroscopeWidget;
