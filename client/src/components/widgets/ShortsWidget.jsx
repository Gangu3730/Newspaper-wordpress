import React, { useRef, useState, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import './ShortsWidget.css';

const ShortsWidget = ({ shorts = [], onPlay }) => {
  const scrollContainerRef = useRef(null);
  const [isScrollable, setIsScrollable] = useState(false);

  const checkScrollable = () => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      setIsScrollable(scrollWidth > clientWidth);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollable();
    const timer = setTimeout(checkScrollable, 250);
    window.addEventListener('resize', checkScrollable);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [shorts]);

  return (
    <div className="shorts-widget">
      <div className="shorts-widget__header">
        <h2 className="shorts-widget__title">Shorts</h2>
        <a href="https://www.youtube.com/@PoliticalEyeIndia/shorts" target="_blank" rel="noopener noreferrer" className="shorts-widget__more">और देखें</a>
      </div>
      
      <div className="shorts-carousel-wrapper" style={{ position: 'relative' }}>
        {isScrollable && (
          <button 
            className="carousel-nav-btn left" 
            onClick={() => scroll('left')}
            aria-label="Scroll Left"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        
        <div className="shorts-widget__scroll-container" ref={scrollContainerRef}>
          {shorts.map((short) => (
            <div 
              key={short.id} 
              className="shorts-card"
              onClick={() => {
                if (onPlay && short.youtube_id) {
                  onPlay(short.youtube_id);
                } else if (short.url) {
                  window.open(short.url, '_blank');
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="shorts-card__thumbnail">
                <img src={short.featured_image || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80'} alt={short.title} />
                <div className="shorts-card__overlay">
                  <Play className="shorts-card__play-icon" size={24} fill="white" />
                  <span className="shorts-card__views">{short.views?.includes('views') ? short.views : `${short.views || '1.2M'} views`}</span>
                </div>
              </div>
              <h4 className="shorts-card__title">{short.title}</h4>
            </div>
          ))}
        </div>
        
        {isScrollable && (
          <button 
            className="carousel-nav-btn right" 
            onClick={() => scroll('right')}
            aria-label="Scroll Right"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ShortsWidget;
