import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import wpService from '../services/wpService';
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
  
  // Comment Form State
  const [name, setName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    setLoading(true);
    setSubmitSuccess(false);
    
    // Fetch article details & comments
    wpService.getPostBySlug(slug)
      .then(post => {
        setArticle(post);
        return wpService.getComments(post.id).then(c => setComments(c || [])).catch(() => setComments(post.comments || []));
      })
      .then(() => setLoading(false))
      .catch(err => {
        console.error("Error fetching article details:", err);
        setError("खबर लोड करने में असमर्थ। कृपया बाद में प्रयास करें।");
        setLoading(false);
      });

    // Fetch advertisements from WordPress backend
    wpService.getAdvertisements()
      .then(ads => {
        const left = ads.find(a => a.placement === 'left');
        const right = ads.find(a => a.placement === 'right');
        setLeftAd(left || null);
        setRightAd(right || null);
      })
      .catch(err => {
        console.warn("Failed loading ads for details page:", err);
      });
  }, [slug]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !commentText.trim()) return;
    if (!article) return;

    wpService.submitComment(article.id, name, 'guest@newspaper.com', commentText)
      .then(saved => {
        setComments(prev => [saved, ...prev]);
        setName('');
        setCommentText('');
        setSubmitSuccess(true);
      })
      .catch(err => {
        const newComment = {
          id: Date.now(),
          author_name: name,
          comment: commentText,
          created_at: new Date().toISOString(),
        };
        setComments(prev => [newComment, ...prev]);
        setName('');
        setCommentText('');
        setSubmitSuccess(true);
      });
  };

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
      <aside className="side-ad side-ad--left">
        {leftAd ? (
          <a href={leftAd.target_url} target="_blank" rel="noopener noreferrer" className="side-ad__link">
            <img src={leftAd.image_url} alt={leftAd.title} className="side-ad__img" />
            <span className="side-ad__label">विज्ञापन</span>
          </a>
        ) : (
          <div className="side-ad__placeholder">
            <span>विज्ञापन (160x600)</span>
          </div>
        )}
      </aside>

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
            <span className="article-detail__author">{article.author?.name || 'प्रभात खबर ब्यूरो'}</span>
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
            {article.featured_image_caption ? (
              <span className="article-detail__image-caption">{article.featured_image_caption}</span>
            ) : (
              <span className="article-detail__image-caption">प्रभात खबर फाइल फोटो</span>
            )}
          </div>
        )}

        {/* Article Summary */}
        {article.summary && (
          <div className="article-detail__summary">
            <p>{article.summary}</p>
          </div>
        )}

        {/* Article Full Content */}
        <div className="article-detail__content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} />

        {/* Interactive Comments Section */}
        <section className="comments-section">
          <h3 className="comments-section__title">प्रतिक्रियाएं ({comments.length})</h3>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <h4 className="comment-form__title">अपनी प्रतिक्रिया दें</h4>
            
            {submitSuccess && (
              <div className="alert alert--success">
                आपकी प्रतिक्रिया सफलतापूर्वक जोड़ दी गई है और जल्द ही लाइव होगी!
              </div>
            )}

            <div className="form-group">
              <label htmlFor="commenter-name">आपका नाम</label>
              <input 
                type="text" 
                id="commenter-name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="यहाँ अपना नाम लिखें" 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="comment-body">टिप्पणी</label>
              <textarea 
                id="comment-body" 
                rows="4" 
                value={commentText} 
                onChange={e => setCommentText(e.target.value)} 
                placeholder="खबर के बारे में अपनी राय यहाँ व्यक्त करें" 
                required
              ></textarea>
            </div>

            <button type="submit" className="comment-form__submit">सबमिट करें</button>
          </form>

          {/* Comment List */}
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="empty-comments">इस खबर पर अभी कोई टिप्पणी नहीं है। पहली टिप्पणी आपकी हो सकती है!</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="comment-item">
                  <div className="comment-item__header">
                    <span className="comment-item__author">{c.author_name}</span>
                    <span className="comment-item__date">{formatDate(c.created_at)}</span>
                  </div>
                  <p className="comment-item__text">{c.comment}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </article>

      {/* Sticky Right Skyscraper Ad Column */}
      <aside className="side-ad side-ad--right">
        {rightAd ? (
          <a href={rightAd.target_url} target="_blank" rel="noopener noreferrer" className="side-ad__link">
            <img src={rightAd.image_url} alt={rightAd.title} className="side-ad__img" />
            <span className="side-ad__label">विज्ञापन</span>
          </a>
        ) : (
          <div className="side-ad__placeholder">
            <span>विज्ञापन (160x600)</span>
          </div>
        )}
      </aside>
    </div>
  );
};

export default ArticleDetail;
