import React from 'react';
import SocialEmbedCard from './SocialEmbedCard';

/**
 * Reusable HTML sanitizer to prevent basic XSS scripts from executing
 * while preserving layout structure from WordPress.
 */
const sanitizeHtmlContent = (html) => {
  if (!html) return '';
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
};

/**
 * PostContentRenderer Component
 * Parses WordPress content HTML dynamically and renders custom native SocialEmbedCard
 * elements for Twitter/X, Instagram, and Facebook.
 *
 * @param {string} htmlContent - The raw HTML content from WordPress REST API
 */
const PostContentRenderer = ({ htmlContent }) => {
  if (!htmlContent) return null;

  // Sanitize content first
  const sanitized = sanitizeHtmlContent(htmlContent);

  const embeds = [];
  let parsedHtml = sanitized;
  let embedCount = 0;

  // -------------------------------------------------------------
  // 1. SCAN AND MATCH TWITTER/X EMBEDS
  // -------------------------------------------------------------
  
  // A. Blockquotes
  const twitterBlockquoteRegex = /<blockquote[^>]*class="[^"]*twitter-tweet[^"]*"[^>]*>([\s\S]*?)<\/blockquote>/gi;
  parsedHtml = parsedHtml.replace(twitterBlockquoteRegex, (fullBlockquote, innerContent) => {
    const urlRegex = /href="(https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[a-zA-Z0-9_]+\/status\/(\d+)[^"]*)"/i;
    const urlMatch = innerContent.match(urlRegex);
    
    const textRegex = /<p[^>]*>([\s\S]*?)<\/p>/i;
    const textMatch = innerContent.match(textRegex);
    const defaultText = textMatch ? textMatch[1] : '';

    const authorRegex = /(?:&mdash;|&ndash;)\s*([a-zA-Z0-9_\s\u0900-\u097F]+)/i;
    const authorMatch = innerContent.match(authorRegex);
    const defaultAuthor = authorMatch ? authorMatch[1].trim() : '';

    if (urlMatch) {
      const token = `__SOCIAL_EMBED_twitter_${embedCount}__`;
      embeds.push({
        token,
        type: 'twitter',
        tweetId: urlMatch[2],
        url: urlMatch[1],
        defaultText,
        defaultAuthor
      });
      embedCount++;
      return token;
    }
    return fullBlockquote;
  });

  // B. Bare Twitter URLs in Paragraphs/Figures
  const twitterUrlRegex = /<(figure|p)[^>]*>(?:[\s\S]*?)(https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[a-zA-Z0-9_]+\/status\/(\d+)(?:\?[a-zA-Z0-9_=&-]+)?)(?:[\s\S]*?)<\/\1>/gi;
  parsedHtml = parsedHtml.replace(twitterUrlRegex, (fullTag, tagName, urlStr, tweetId) => {
    if (parsedHtml.includes(`status/${tweetId}`)) {
      const token = `__SOCIAL_EMBED_twitter_${embedCount}__`;
      embeds.push({
        token,
        type: 'twitter',
        tweetId,
        url: urlStr,
        defaultText: 'ट्वीट देखने के लिए क्लिक करें।',
        defaultAuthor: 'Twitter/X Post'
      });
      embedCount++;
      return token;
    }
    return fullTag;
  });

  // -------------------------------------------------------------
  // 2. SCAN AND MATCH INSTAGRAM EMBEDS
  // -------------------------------------------------------------
  
  // A. Blockquotes
  const instagramBlockquoteRegex = /<blockquote[^>]*class="[^"]*instagram-media[^"]*"[^>]*>([\s\S]*?)<\/blockquote>/gi;
  parsedHtml = parsedHtml.replace(instagramBlockquoteRegex, (fullBlockquote, innerContent) => {
    // Extract permanent link
    const permalinkRegex = /data-instgrm-permalink="(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)[^"]*)"/i;
    const linkMatch = fullBlockquote.match(permalinkRegex) || innerContent.match(/href="(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)[^"]*)"/i);
    
    const textRegex = /<p[^>]*>([\s\S]*?)<\/p>/i;
    const textMatch = innerContent.match(textRegex);
    const defaultText = textMatch ? textMatch[1] : 'View this post on Instagram';

    if (linkMatch) {
      const token = `__SOCIAL_EMBED_instagram_${embedCount}__`;
      embeds.push({
        token,
        type: 'instagram',
        url: linkMatch[1],
        defaultText,
        defaultAuthor: 'Instagram Post'
      });
      embedCount++;
      return token;
    }
    return fullBlockquote;
  });

  // B. Bare Instagram URLs in Paragraphs/Figures
  const instagramUrlRegex = /<(figure|p)[^>]*>(?:[\s\S]*?)(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)(?:\/[?a-zA-Z0-9_=&-]+)?)(?:[\s\S]*?)<\/\1>/gi;
  parsedHtml = parsedHtml.replace(instagramUrlRegex, (fullTag, tagName, urlStr, postId) => {
    if (parsedHtml.includes(`/${postId}`)) {
      const token = `__SOCIAL_EMBED_instagram_${embedCount}__`;
      embeds.push({
        token,
        type: 'instagram',
        url: urlStr,
        defaultText: 'इंस्टाग्राम पोस्ट देखने के लिए क्लिक करें।',
        defaultAuthor: 'Instagram Post'
      });
      embedCount++;
      return token;
    }
    return fullTag;
  });

  // -------------------------------------------------------------
  // 3. SCAN AND MATCH FACEBOOK EMBEDS
  // -------------------------------------------------------------
  
  // A. Dynamic oEmbed Container Wrappers
  const facebookDivRegex = /<div[^>]*class="[^"]*(fb-post|fb-video)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  parsedHtml = parsedHtml.replace(facebookDivRegex, (fullDiv, className, innerContent) => {
    const urlRegex = /data-href="(https?:\/\/(?:www\.)?facebook\.com\/[^"]+)"/i;
    const urlMatch = fullDiv.match(urlRegex) || innerContent.match(/href="(https?:\/\/(?:www\.)?facebook\.com\/[^"]+)"/i);
    
    if (urlMatch) {
      const token = `__SOCIAL_EMBED_facebook_${embedCount}__`;
      embeds.push({
        token,
        type: 'facebook',
        url: urlMatch[1],
        defaultText: 'Facebook post interaction',
        defaultAuthor: 'Facebook Post'
      });
      embedCount++;
      return token;
    }
    return fullDiv;
  });

  // B. Bare Facebook URLs in Paragraphs/Figures
  const facebookUrlRegex = /<(figure|p)[^>]*>(?:[\s\S]*?)(https?:\/\/(?:www\.)?facebook\.com\/(?:[^/]+\/(?:posts|videos)\/[a-zA-Z0-9_.-]+|permalink\.php\?story_fbid=[a-zA-Z0-9_.-]+&id=[a-zA-Z0-9_.-]+|watch\/\?v=\d+|[^/]+\/videos\/[a-zA-Z0-9_.-]+)(?:\?[a-zA-Z0-9_=&-]+)?)(?:[\s\S]*?)<\/\1>/gi;
  parsedHtml = parsedHtml.replace(facebookUrlRegex, (fullTag, tagName, urlStr) => {
    // Escape check to avoid duplicate parser loops
    const cleanUrl = urlStr.replace(/&amp;/g, '&');
    const token = `__SOCIAL_EMBED_facebook_${embedCount}__`;
    embeds.push({
      token,
      type: 'facebook',
      url: cleanUrl,
      defaultText: 'फेसबुक पोस्ट देखने के लिए क्लिक करें।',
      defaultAuthor: 'Facebook Post'
    });
    embedCount++;
    return token;
  });

  // If no embeds were matched, render raw HTML content directly
  if (embeds.length === 0) {
    return (
      <div 
        className="post-rendered-content" 
        dangerouslySetInnerHTML={{ __html: parsedHtml }} 
      />
    );
  }

  // 4. Split parsed HTML systematically by all dynamic tokens
  const tokenNames = embeds.map(e => e.token);
  const tokenPattern = new RegExp(`(${tokenNames.join('|')})`, 'g');
  const contentParts = parsedHtml.split(tokenPattern);

  return (
    <div className="post-rendered-content">
      {contentParts.map((part, idx) => {
        const embedItem = embeds.find(e => e.token === part);
        
        // Render appropriate SocialEmbedCard for matched tokens
        if (embedItem) {
          return (
            <SocialEmbedCard 
              key={`social-${embedItem.type}-${idx}`} 
              type={embedItem.type}
              url={embedItem.url}
              tweetId={embedItem.tweetId}
              defaultText={embedItem.defaultText}
              defaultAuthor={embedItem.defaultAuthor}
            />
          );
        }

        // Render normal HTML block segment
        if (!part.trim()) return null;
        
        return (
          <div 
            key={`html-${idx}`}
            style={{ display: 'inline' }}
            dangerouslySetInnerHTML={{ __html: part }} 
          />
        );
      })}
    </div>
  );
};

export default PostContentRenderer;
