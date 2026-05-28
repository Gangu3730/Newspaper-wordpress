import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import wpService from '../../services/wpService';
import './CityNewsFilter.css';

const CityNewsFilter = () => {
  const [activeTag, setActiveTag] = useState({ id: 'all', name: 'सभी' });
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([
    { id: 'all', name: 'सभी' },
    { id: 71, name: 'Viral News', slug: 'viral-news' },
    { id: 78, name: 'Breaking News', slug: 'breaking-news' },
    { id: 87, name: 'Bollywood News', slug: 'bollywood-news' },
    { id: 101, name: 'Karnataka Politics', slug: 'karnataka-politics' },
    { id: 116, name: 'UP Politics', slug: 'up-politics' },
    { id: 77, name: 'Political News', slug: 'political-news' }
  ]); // Initial fallback while loading to prevent layout shifts

  useEffect(() => {
    let mounted = true;
    
    // Fetch dynamic tags from backend
    wpService.getTags().then(data => {
      if (mounted && data.length > 0) {
        setTags([{ id: 'all', name: 'सभी' }, ...data]);
      }
    });

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const fetchTagNews = async () => {
      try {
        const res = await wpService.getPosts({ 
          tagSlug: activeTag.id === 'all' ? null : activeTag.slug, 
          perPage: 6 
        });
        
        if (mounted) {
          setNewsData(res.data || []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch tag news:", error);
        if (mounted) setLoading(false);
      }
    };

    fetchTagNews();
    
    return () => { mounted = false; };
  }, [activeTag]);

  return (
    <div className="city-news-section">
      <div className="city-news__header">
        <h2 className="city-news__title">चर्चित विषय</h2>
        
        <div className="tag-filter-container">
          <select 
            className="tag-filter-select"
            value={activeTag.id}
            onChange={(e) => {
              const selected = tags.find(t => String(t.id) === e.target.value);
              if (selected) setActiveTag(selected);
            }}
          >
            <option value="all">Filter by Tags</option>
            {tags.filter(t => t.id !== 'all').map(tag => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>लोड हो रहा है...</div>
      ) : newsData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>इस विषय से संबंधित खबरें अभी उपलब्ध नहीं हैं।</div>
      ) : (
        <div className="tag-news-grid">
          {newsData.map(post => (
            <div key={post.id} className="tag-news-grid__card">
              <div className="tag-news-grid__img-wrapper">
                <img 
                  src={post.featured_image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&q=80'} 
                  alt={post.title} 
                  className="tag-news-grid__img" 
                />
                <span className="tag-news-grid__badge">
                  {activeTag.id === 'all' ? (post.category?.name || 'समाचार') : activeTag.name}
                </span>
              </div>
              
              <div className="tag-news-grid__body">
                <span className="tag-news-grid__date">
                  {new Date(post.published_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                
                <h3 className="tag-news-grid__title">
                  <Link to={`/news/${post.slug}`}>{post.title}</Link>
                </h3>
                
                <p className="tag-news-grid__excerpt">
                  {post.summary}
                </p>
                
                <div className="tag-news-grid__footer">
                  <span className="tag-news-grid__views">
                    {post.views.toLocaleString()} बार देखा गया
                  </span>
                  
                  <Link to={`/news/${post.slug}`} className="tag-news-grid__read-more">
                    पूरी खबर पढ़ें <span className="arrow">&gt;</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityNewsFilter;
