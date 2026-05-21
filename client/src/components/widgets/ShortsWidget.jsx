import React from 'react';
import { Play } from 'lucide-react';
import './ShortsWidget.css';

const fallbackShorts = [
  { id: 'f1', title: 'Cockroach Janta Party : इंटेरनेट पर शोर, Instagram पर BJP से आगे CJP', featured_image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80', views: '2.5M' },
  { id: 'f2', title: 'Rahul Gandhi के बयान पर भड़कीं CM Rekha Gupta', featured_image: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=500&q=80', views: '1.1M' },
  { id: 'f3', title: 'सेलेब्रिटीज जैसी ग्लोइंग स्किन का राज', featured_image: 'https://images.unsplash.com/photo-1522337360788-8b13fee7a3af?w=500&q=80', views: '800K' },
  { id: 'f4', title: 'क्या Under Eye Rejuvenation Safe है?', featured_image: 'https://images.unsplash.com/photo-1512496015851-a1c848fe717c?w=500&q=80', views: '500K' },
  { id: 'f5', title: 'PM Modi पर बयान देकर बुरे फंसे नेता', featured_image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=500&q=80', views: '3.2M' },
  { id: 'f6', title: 'Share Market: आज के टॉप गेनर्स', featured_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&q=80', views: '1.8M' }
];

const ShortsWidget = ({ shorts = [] }) => {
  const displayShorts = shorts && shorts.length > 0 ? shorts : fallbackShorts;

  return (
    <div className="shorts-widget">
      <div className="shorts-widget__header">
        <h2 className="shorts-widget__title">Shorts</h2>
        <a href="#more-shorts" className="shorts-widget__more">और देखें</a>
      </div>
      <div className="shorts-widget__scroll-container">
        {displayShorts.map((short) => (
          <div key={short.id} className="shorts-card">
            <div className="shorts-card__thumbnail">
              <img src={short.featured_image || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80'} alt={short.title} />
              <div className="shorts-card__overlay">
                <Play className="shorts-card__play-icon" size={24} fill="white" />
                <span className="shorts-card__views">{short.views || '1.2M'} views</span>
              </div>
            </div>
            <h4 className="shorts-card__title">{short.title}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShortsWidget;
