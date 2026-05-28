import React, { useState, useEffect, useRef } from 'react';
import { 
  TwitterTweetEmbed, 
  TwitterFollowButton, 
  TwitterShareButton, 
  TwitterMentionButton, 
  TwitterHashtagButton 
} from 'react-twitter-embed';
import './TweetEmbedCard.css';

/**
 * Custom Twitter/X Embed Card Component
 * Uses official react-twitter-embed library components for dynamic live rendering.
 * Incorporates lazy loading using IntersectionObserver for maximum client performance.
 *
 * @param {string} tweetId - The numerical ID of the tweet
 * @param {string} url - The original Tweet URL (used for sharing)
 * @param {string} defaultText - Fallback text
 * @param {string} defaultAuthor - Fallback author
 */
const TweetEmbedCard = ({ tweetId, url, defaultText = '', defaultAuthor = '' }) => {
  const [isIntersected, setIsIntersected] = useState(false);
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const cardRef = useRef(null);

  const cleanTweetId = tweetId ? tweetId.trim() : null;
  const fallbackUrl = url || (cleanTweetId ? `https://x.com/x/status/${cleanTweetId}` : 'https://x.com');

  // Setup IntersectionObserver for Lazy Loading
  useEffect(() => {
    if (!cleanTweetId) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersected(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' } // Load when 300px close to entering viewport
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [cleanTweetId]);

  if (!cleanTweetId) {
    return (
      <div className="tweet-card-error" style={{ padding: '16px', border: '1px solid #ff4d4f', borderRadius: '8px', color: '#ff4d4f', margin: '1rem 0' }}>
        अमान्य ट्विटर लिंक (Invalid Twitter Embed ID)
      </div>
    );
  }

  // Loading skeleton placeholder
  const skeletonPlaceholder = (
    <div className="tweet-card tweet-card--skeleton">
      <div className="tweet-card__header">
        <div className="tweet-card__author">
          <div className="skeleton-circle shimmer"></div>
          <div className="tweet-card__author-info">
            <div className="skeleton-line skeleton-line--name shimmer"></div>
            <div className="skeleton-line skeleton-line--handle shimmer"></div>
          </div>
        </div>
        <div className="skeleton-circle shimmer" style={{ width: '20px', height: '20px' }}></div>
      </div>
      <div className="tweet-card__body">
        <div className="skeleton-line skeleton-line--text-1 shimmer"></div>
        <div className="skeleton-line skeleton-line--text-2 shimmer"></div>
        <div className="skeleton-box skeleton-box--media shimmer"></div>
      </div>
    </div>
  );

  return (
    <div className="tweet-embed-library-container" ref={cardRef} style={{ margin: '1.5rem auto', maxWidth: '550px', width: '100%' }}>
      {!isIntersected ? (
        skeletonPlaceholder
      ) : (
        <div className="tweet-embed-frame" style={{ minHeight: '150px' }}>
          <TwitterTweetEmbed
            tweetId={cleanTweetId}
            placeholder={skeletonPlaceholder}
            onLoad={() => setEmbedLoaded(true)}
          />
        </div>
      )}
    </div>
  );
};

export default TweetEmbedCard;
