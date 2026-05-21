import React from 'react';
import { Link } from 'react-router-dom';
import './NewsCard.css';

const NewsCard = ({ article, variant = 'standard' }) => {
  const { title, summary, featured_image, featured_image_alt, featured_image_srcset, category, author, published_at, views } = article;
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <article className={`news-card news-card--${variant}`}>
      {featured_image && (
        <div className="news-card__image-wrapper">
          <img 
            src={featured_image} 
            srcSet={featured_image_srcset || undefined}
            sizes={featured_image_srcset ? '(max-width: 600px) 100vw, 33vw' : undefined}
            alt={featured_image_alt || title} 
            className="news-card__image" 
            loading="lazy" 
          />
          {category && (
            <span className="news-card__category">{category.name}</span>
          )}
        </div>
      )}
      
      <div className="news-card__content">
        <div className="news-card__meta">
          <span className="news-card__date">{formatDate(published_at)}</span>
        </div>
        
        <h3 className="news-card__title">
          <Link to={`/news/${article.slug}`}>{title}</Link>
        </h3>
        
        {variant !== 'compact' && summary && (
          <p className="news-card__summary">{summary}</p>
        )}
        
        <div className="news-card__footer">
          <span className="news-card__views">{views.toLocaleString()} बार देखा गया</span>
          <Link to={`/news/${article.slug}`} className="news-card__more">
            पूरी खबर पढ़ें
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 9L7.5 6L4.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
