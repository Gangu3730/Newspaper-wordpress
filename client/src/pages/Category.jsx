import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import wpService from '../services/wpService';
import NewsCard from '../components/news/NewsCard';
import SEO from '../components/common/SEO';
import './Category.css';

const Category = () => {
  const { slug } = useParams();
  const [news, setNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]); // Fallback latest feed if category is empty
  const [categoryName, setCategoryName] = useState('');
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setCurrentPage(1); // Reset page on category change
    setLatestNews([]);
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Fetch Category list to resolve display name
    wpService.getCategories()
      .then(list => {
        const cat = list.find(c => c.slug === slug);
        setCategory(cat || null);
        setCategoryName(cat ? cat.name : slug.toUpperCase());
      })
      .catch(err => console.error("Error fetching category list:", err));

    // Fetch News with Category filter & Pagination via WordPress
    wpService.getPosts({ categorySlug: slug, page: currentPage, perPage: 12 })
      .then(payload => {
        setNews(payload.data || []);
        setTotalPages(payload.totalPages || 1);
        setLoading(false);

        // If this category is empty, fetch general latest posts as a fallback recommendation feed
        if (!payload.data || payload.data.length === 0) {
          setFallbackLoading(true);
          wpService.getPosts({ perPage: 6 })
            .then(fallbackRes => {
              setLatestNews(fallbackRes.data || []);
              setFallbackLoading(false);
            })
            .catch(err => {
              console.warn("Failed fetching fallback news:", err);
              setFallbackLoading(false);
            });
        }
      })
      .catch(err => {
        console.error("Error fetching category news:", err);
        setError("इस श्रेणी की खबरें लोड करने में असमर्थ।");
        setLoading(false);
      });
  }, [slug, currentPage]);

  return (
    <div className="category-page container">
      <SEO 
        yoastHeadJson={category?.yoast_head_json} 
        title={categoryName} 
        description={`प्रभात खबर - ${categoryName} के बारे में ताजातरीन खबरें और मुख्य समाचार`}
      />
      <div className="category-page__header">
        <h1 className="category-page__title">{categoryName}</h1>
        <div className="category-page__breadcrumb">
          <Link to="/">होम</Link> &raquo; <span>{categoryName}</span>
        </div>
      </div>

      {loading ? (
        <div className="skeleton-grid">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : news.length === 0 ? (
        <div className="empty-category-container">
          {/* Beautiful Minimalist Empty State Box */}
          <div className="empty-category-box">
            <div className="empty-category-box__icon">📰</div>
            <h3 className="empty-category-box__title">इस श्रेणी में अभी कोई खबर उपलब्ध नहीं है</h3>
            <p className="empty-category-box__desc">हम जल्द ही इस सेक्शन में नई खबरें जोड़ेंगे। तब तक आप हमारे मुख्य पृष्ठ की ताजा खबरें पढ़ सकते हैं।</p>
            <Link to="/" className="empty-category-box__btn">मुख्य पृष्ठ पर जाएं</Link>
          </div>

          {/* Fallback Recommendation Feed */}
          {latestNews.length > 0 && (
            <div className="empty-category-fallback">
              <div className="empty-category-fallback__heading-wrapper">
                <h2 className="empty-category-fallback__heading">ताजातरीन और मुख्य खबरें</h2>
                <div className="empty-category-fallback__line"></div>
              </div>
              
              {fallbackLoading ? (
                <div className="skeleton-grid">
                  <div className="skeleton-card"></div>
                  <div className="skeleton-card"></div>
                  <div className="skeleton-card"></div>
                </div>
              ) : (
                <div className="category-posts-grid">
                  {latestNews.map(article => (
                    <NewsCard key={article.id} article={article} variant="standard" />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="category-posts-grid">
            {news.map(article => (
              <NewsCard key={article.id} article={article} variant="standard" />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination__btn"
              >
                &laquo; पिछला
              </button>
              <span className="pagination__info">पेज {currentPage} / {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination__btn"
              >
                अगला &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Category;
