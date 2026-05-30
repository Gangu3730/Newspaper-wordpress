import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import wpService from '../services/wpService';
import NewsCard from '../components/news/NewsCard';
import SEO from '../components/common/SEO';
import './SearchResults.css';

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchResults = () => {
  const query = useQuery();
  const q = query.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    wpService.getPosts({ search: q.trim(), perPage: 20 })
      .then(res => {
        setResults(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Search error:', err);
        setError('खोज परिणाम लोड करने में त्रुटि हुई।');
        setLoading(false);
      });
  }, [q]);

  return (
    <div className="search-results container">
      <SEO 
        title={`खोज परिणाम: "${q}"`} 
        description={`Political Eye पर खोज परिणाम: "${q}" - राजनीतिक विश्लेषण, ताजा समाचार और मुख्य सुर्खियां खोजें।`}
        robots="noindex, follow"
      />
      <div className="search-header">
        <h1>खोज परिणाम: "{q}"</h1>
        <div className="search-actions">
          <Link to="/">होम पर जाएं</Link>
        </div>
      </div>

      {loading ? (
        <div className="skeleton-grid">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : results.length === 0 ? (
        <div className="empty-message">कोई परिणाम नहीं मिला।</div>
      ) : (
        <div className="articles-grid">
          {results.map(article => (
            <NewsCard key={article.id} article={article} variant="standard" />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
