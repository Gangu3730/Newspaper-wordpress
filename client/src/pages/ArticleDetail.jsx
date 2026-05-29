import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import wpService from '../services/wpService';
import NewsCard from '../components/news/NewsCard';
import PostContentRenderer from '../components/common/PostContentRenderer';
import { Eye } from 'lucide-react';
import './ArticleDetail.css';

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Side Ads State
  const [leftAd, setLeftAd] = useState(null);
  const [rightAd, setRightAd] = useState(null);
  const [recentNews, setRecentNews] = useState([]);
  
  useEffect(() => {
    setLoading(true);
    
    // Fetch article details
    wpService.getPostBySlug(slug)
      .then(post => {
        setArticle(post);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching article details:", err);
        setError("खबर लोड करने में असमर्थ। कृपया बाद में प्रयास करें।");
        setLoading(false);
      });

    // Fetch advertisements from WordPress backend
    wpService.getAdvertisements()
      .then(ads => {
        const left = ads.find(a => {
          const placements = Array.isArray(a.placement) ? a.placement : [a.placement];
          return placements.includes("Left Sidebar (Article Pages)");
        });
        const right = ads.find(a => {
          const placements = Array.isArray(a.placement) ? a.placement : [a.placement];
          return placements.includes("Right Sidebar (Home & Article Pages)");
        });
        setLeftAd(left || null);
        setRightAd(right || null);
      })
      .catch(err => {
        console.warn("Failed loading ads for details page:", err);
      });

    // Fetch recent news
    wpService.getPosts({ perPage: 4 })
      .then(res => {
        if (res.data) {
          setRecentNews(res.data);
        }
      })
      .catch(err => {
        console.warn("Failed loading recent news:", err);
      });
  }, [slug]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const sanitizeHtml = (html) => {
    if (!html) return '';
    return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  };

  if (loading) {
    return (
      <div className="article-detail container article-detail--loading">
        <div className="skeleton-line skeleton-line--title"></div>
        <div className="skeleton-line skeleton-line--meta"></div>
        <div className="skeleton-box skeleton-box--image"></div>
        <div className="skeleton-line skeleton-line--text"></div>
        <div className="skeleton-line skeleton-line--text"></div>
      </div>
    );
  }

  if (error || !article) {
    return <div className="article-detail container error-message">{error || "खबर नहीं मिली।"}</div>;
  }

  return (
    <div className="article-page-layout">
      {/* Sticky Left Skyscraper Ad Column */}
      {leftAd && (leftAd.image || leftAd.image_url) && (
        <aside className="side-ad side-ad--left">
          <a href={leftAd.targetUrl || leftAd.target_url || "#"} target="_blank" rel="noopener noreferrer" className="side-ad__link">
            <img src={leftAd.image || leftAd.image_url} alt={leftAd.title} className="side-ad__img" />
            <span className="side-ad__label">विज्ञापन</span>
          </a>
        </aside>
      )}

      {/* Main Center Column Container */}
      <div className="article-main-container">
        {/* Main Center Article Card Box */}
        <article className="article-detail">
          {/* Category Tag */}
          {article.category && (
            <div className="article-detail__category">
              <Link to={`/category/${article.category.slug}`}>{article.category.name}</Link>
            </div>
          )}

          {/* Main Title */}
          <h1 className="article-detail__title">{article.title}</h1>

          {/* Article Metadata */}
          <div className="article-detail__meta">
            <div className="article-detail__author-box">
              <img 
                src="https://backend.politicaleye.in/wp-content/uploads/2026/05/WhatsApp-Image-2026-05-27-at-14.56.54.jpeg" 
                alt={article.author?.name || 'Author'} 
                className="article-detail__author-avatar" 
              />
              <span className="article-detail__author">{article.author?.name || 'प्रभात खबर ब्यूरो'}</span>
              <span className="article-detail__sep">|</span>
              <span className="article-detail__date">{formatDate(article.published_at)}</span>
            </div>
            <div className="article-detail__stats">
              <span 
                className="article-detail__views"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <Eye size={14} />
                <span>{article.views.toLocaleString()} बार देखा गया</span>
              </span>
            </div>
          </div>

          {/* Main Featured Image */}
          {article.featured_image && (
            <div className="article-detail__image-wrapper">
              <img src={article.featured_image} alt={article.featured_image_alt || article.title} className="article-detail__image" />
            </div>
          )}

          {/* Article Summary */}
          {article.summary && (
            <div className="article-detail__summary">
              <p>{article.summary}</p>
            </div>
          )}

          {/* Article Full Content */}
          <div className="article-detail__content">
            <PostContentRenderer htmlContent={article.content} />
          </div>
        </article>

        {/* Recent News Section */}
        {recentNews.filter(p => p.id !== article.id).slice(0, 3).length > 0 && (
          <div className="article-detail__recent-section">
            <h3 className="recent-section__title">ताज़ा ख़बरें (Recent News)</h3>
            <div className="recent-section__grid">
              {recentNews.filter(p => p.id !== article.id).slice(0, 3).map(item => (
                <NewsCard article={item} key={item.id} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Right Skyscraper Ad Column */}
      {rightAd && (rightAd.image || rightAd.image_url) && (
        <aside className="side-ad side-ad--right">
          <a href={rightAd.targetUrl || rightAd.target_url || "#"} target="_blank" rel="noopener noreferrer" className="side-ad__link">
            <img src={rightAd.image || rightAd.image_url} alt={rightAd.title} className="side-ad__img" />
            <span className="side-ad__label">विज्ञापन</span>
          </a>
        </aside>
      )}
    </div>
  );
};

export default ArticleDetail;
