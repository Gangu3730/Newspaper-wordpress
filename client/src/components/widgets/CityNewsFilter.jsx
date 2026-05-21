import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import wpService from '../../services/wpService';
import './CityNewsFilter.css';

const CityNewsFilter = () => {
  const [activeCity, setActiveCity] = useState('All');
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState(['All', 'रांची', 'पटना', 'दिल्ली']); // Initial fallback while loading

  useEffect(() => {
    let mounted = true;
    
    // Fetch dynamic cities from backend
    wpService.getCities().then(data => {
      if (mounted && data.length > 0) {
        setCities(data);
      }
    });

    setLoading(true);

    const fetchCityNews = async () => {
      try {
        const res = await wpService.getPosts({ 
          city: activeCity === 'All' ? null : activeCity, 
          perPage: 5 
        });
        
        if (mounted) {
          setNewsData(res.data || []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch city news:", error);
        if (mounted) setLoading(false);
      }
    };

    fetchCityNews();
    
    return () => { mounted = false; };
  }, [activeCity]);

  return (
    <div className="city-news-section">
      <h2 className="city-news__title">आपके शहर से</h2>
      
      <div className="city-filter-scroll">
        {cities.map(city => (
          <button 
            key={city}
            className={`city-pill ${activeCity === city ? 'active' : ''}`}
            onClick={() => setActiveCity(city)}
          >
            {city}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>लोड हो रहा है...</div>
      ) : newsData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>इस शहर की खबरें अभी उपलब्ध नहीं हैं।</div>
      ) : (
        <div className="city-news__grid">
          {/* Large Feature Item */}
          <div className="city-news__feature">
            <img src={newsData[0].featured_image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&q=80'} alt={newsData[0].title} className="feature-img" />
            <h3 className="feature-title">
              <Link to={`/news/${newsData[0].slug}`} style={{ color: 'inherit' }}>{newsData[0].title}</Link>
            </h3>
          </div>
          
          {/* Small Items Grid */}
          <div className="city-news__list">
            {newsData.slice(1).map(news => (
              <div key={news.id} className="city-news-card">
                <div className="city-news-card__content">
                  <h4 className="city-news-card__title">
                    <Link to={`/news/${news.slug}`}>{news.title}</Link>
                  </h4>
                  <div className="city-news-card__meta">
                    <span className="city-name">{activeCity === 'All' ? 'Local' : activeCity} &gt;</span>
                  </div>
                </div>
                <img src={news.featured_image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80'} alt={news.title} className="city-news-card__img" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CityNewsFilter;
