import React from 'react';
import { Link } from 'react-router-dom';
import './BreakingTicker.css';

const BreakingTicker = ({ news = [] }) => {
  if (news.length === 0) return null;

  return (
    <div className="breaking-ticker">
      <div className="container breaking-ticker__container">
        <div className="breaking-ticker__label">
          <span className="breaking-ticker__icon"></span>
          बड़ी खबर
        </div>
        <div className="breaking-ticker__scroll-wrapper">
          <div className="breaking-ticker__scroll">
            {news.map((item, idx) => (
              <span key={item.id} className="breaking-ticker__item">
                <Link to={`/news/${item.slug}`}>{item.title}</Link>
                {idx < news.length - 1 && <span className="breaking-ticker__separator">&bull;</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingTicker;
