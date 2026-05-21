import React, { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import './NewsSnapWidget.css';

const NewsSnapWidget = ({ articles = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (articles.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % articles.length);
    }, 4000); // Change snap every 4 seconds
    return () => clearInterval(interval);
  }, [articles.length]);

  if (!articles || articles.length === 0) return null;

  const activeArticle = articles[activeIndex];

  return (
    <div className="news-snap-container">
      <div className="phone-frame">
        <div className="phone-notch"></div>
        <div className="phone-screen">
          <div className="news-snap-header">
            <span className="logo-text">News Snap</span>
          </div>
          
          <div className="snap-card">
            <img src={activeArticle.featured_image || 'https://images.unsplash.com/photo-1541815343621-1250f2495d0f?w=400&q=80'} alt={activeArticle.title} className="snap-image" />
            <div className="snap-content">
              <h4 className="snap-title">
                <Link to={`/news/${activeArticle.slug}`}>{activeArticle.title}</Link>
              </h4>
            </div>
          </div>
          
          <div className="snap-controls">
            <div className="snap-dots">
              {articles.map((_, i) => (
                <div 
                  key={i} 
                  className={`dot ${i === activeIndex ? 'active' : ''}`}
                  onClick={() => setActiveIndex(i)}
                  style={{ cursor: 'pointer' }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsSnapWidget;
