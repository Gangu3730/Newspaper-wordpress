import React, { useState, useEffect, useRef } from 'react';
import TweetEmbedCard from './TweetEmbedCard';
import './SocialEmbedCard.css';

/**
 * Unified Social Embed Card Component
 * Routes, loads, and hydates embeds for Twitter/X, Instagram, and Facebook.
 *
 * @param {string} type - 'twitter' | 'instagram' | 'facebook'
 * @param {string} url - The full pasted social media URL
 * @param {string} tweetId - The Twitter status numerical ID (extracted)
 * @param {string} defaultText - Fallback text captured from editor oEmbed
 * @param {string} defaultAuthor - Fallback author captured from editor oEmbed
 */
const SocialEmbedCard = ({ type, url, tweetId = '', defaultText = '', defaultAuthor = '' }) => {
  const containerRef = useRef(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [showInteractive, setShowInteractive] = useState(false);

  // 1. Standardize URLs to prevent layout issues
  const cleanUrl = url ? url.trim() : '';

  // 2. Manage Dynamic Script Injection for Meta SDKs (Instagram / Facebook)
  useEffect(() => {
    if (type === 'twitter') return; // Handled internally by TweetEmbedCard

    let scriptId = '';
    let scriptSrc = '';

    if (type === 'instagram') {
      scriptId = 'instagram-embed-script';
      scriptSrc = 'https://www.instagram.com/embed.js';
    } else if (type === 'facebook') {
      scriptId = 'facebook-jssdk';
      scriptSrc = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
    }

    if (!scriptId) return;

    // Check if script is already present in document
    const existingScript = document.getElementById(scriptId);
    
    const initializeSDK = () => {
      setSdkLoaded(true);
      setShowInteractive(true);
      triggerHydration();
    };

    if (existingScript) {
      initializeSDK();
    } else {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = scriptSrc;
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.onload = initializeSDK;
      script.onerror = () => {
        console.warn(`Failed to load ${type} SDK script, rendering styled card fallback.`);
        setSdkLoaded(false);
        setShowInteractive(false);
      };
      document.body.appendChild(script);
    }
  }, [type, cleanUrl]);

  // 3. Hydrate or process dynamic oEmbed markup after routes or DOM updates
  const triggerHydration = () => {
    setTimeout(() => {
      if (!containerRef.current) return;

      if (type === 'instagram' && window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process(containerRef.current);
      } else if (type === 'facebook' && window.FB) {
        window.FB.XFBML.parse(containerRef.current);
      }
    }, 150);
  };

  // Re-run hydration on route change or when interactive state updates
  useEffect(() => {
    if (sdkLoaded && showInteractive) {
      triggerHydration();
    }
  }, [sdkLoaded, showInteractive, cleanUrl]);

  // If Twitter link, defer to the optimized native Tweet Card
  if (type === 'twitter') {
    return (
      <TweetEmbedCard 
        tweetId={tweetId} 
        url={cleanUrl} 
        defaultText={defaultText} 
        defaultAuthor={defaultAuthor} 
      />
    );
  }

  const handleCardClick = () => {
    window.open(cleanUrl, '_blank', 'noopener,noreferrer');
  };

  // Render Live Interactive Widget (SDK parsed oEmbed standard blockquote/iframe)
  if (showInteractive) {
    return (
      <div className="social-embed-interactive" ref={containerRef}>
        {type === 'instagram' && (
          <blockquote 
            className="instagram-media" 
            data-instgrm-permalink={cleanUrl} 
            data-instgrm-version="14"
            style={{ width: '100%', margin: '0 auto', maxWidth: '540px' }}
          >
            <div style={{ padding: '16px' }}>
              <a href={cleanUrl} target="_blank" rel="noopener noreferrer">
                Instagram पोस्ट लोड हो रहा है (Loading Instagram Post...)
              </a>
            </div>
          </blockquote>
        )}

        {type === 'facebook' && (
          <div 
            className="fb-post" 
            data-href={cleanUrl} 
            data-width="auto" 
            data-show-text="true"
            style={{ width: '100%', margin: '0 auto', maxWidth: '500px' }}
          >
            <blockquote cite={cleanUrl} className="fb-xfbml-parse-ignore">
              <a href={cleanUrl} target="_blank" rel="noopener noreferrer">
                फेसबुक पोस्ट लोड हो रहा है (Loading Facebook Post...)
              </a>
            </blockquote>
          </div>
        )}
      </div>
    );
  }

  // Beautiful styled fallback/offline cards if scripts are blocked by Adblockers/Do-Not-Track
  return (
    <div className={`social-card social-card--${type}`} onClick={handleCardClick}>
      {/* Card Header */}
      <div className="social-card__header">
        <div className="social-card__author">
          <div className="social-card__avatar-placeholder">
            {type === 'instagram' ? 'IG' : 'FB'}
          </div>
          <div className="social-card__author-info">
            <span className="social-card__name">{defaultAuthor || `${type.charAt(0).toUpperCase() + type.slice(1)} Social Post`}</span>
            <span className="social-card__platform">{type === 'instagram' ? 'Instagram' : 'Facebook'}</span>
          </div>
        </div>
        <div className="social-card__logo">
          {type === 'instagram' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="social-card__body">
        <p className="social-card__text">
          {defaultText ? defaultText.replace(/<\/?[^>]+(>|$)/g, "") : 'सोशल पोस्ट देखने के लिए और उस पर जवाब देने के लिए नीचे क्लिक करें।'}
        </p>

        {/* Dynamic decorative placeholder to represent content grid */}
        <div className="social-card__media-placeholder">
          {type === 'instagram' ? (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>View photos & videos on Instagram</span>
            </>
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>View interaction on Facebook</span>
            </>
          )}
        </div>
      </div>

      {/* Card Footer Action */}
      <div className="social-card__footer">
        <span className="social-card__platform" style={{ fontSize: '11px' }}>
          Opens in a new browser tab
        </span>
        <button className="social-card__action-btn">
          {type === 'instagram' ? 'Instagram पर देखें' : 'Facebook पर देखें'}
        </button>
      </div>
    </div>
  );
};

export default SocialEmbedCard;
