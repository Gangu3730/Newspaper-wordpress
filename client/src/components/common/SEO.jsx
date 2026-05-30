import React, { useEffect } from 'react';

/**
 * SEO Component
 * Dynamically updates document title and metadata tags in document.head.
 * Integrates seamlessly with Yoast SEO API data and supports robust custom fallbacks.
 * 
 * @param {Object} props
 * @param {Object} props.yoastHeadJson - The yoast_head_json object returned from WordPress REST API.
 * @param {string} props.title - Fallback title.
 * @param {string} props.description - Fallback meta description.
 * @param {string} props.image - Fallback featured image URL.
 * @param {string} props.url - Fallback canonical/og URL.
 * @param {string} props.type - Fallback OG type (e.g. 'website', 'article').
 * @param {string} props.robots - Fallback robots value (e.g. 'index, follow').
 */
const SEO = ({
  yoastHeadJson,
  title: fallbackTitle,
  description: fallbackDescription,
  image: fallbackImage,
  url: fallbackUrl,
  type = 'website',
  robots = 'index, follow'
}) => {
  useEffect(() => {
    // 1. Resolve SEO fields (Yoast data takes priority, fallbacks as backups)
    let seoTitle = '';
    let seoDescription = '';
    let seoCanonical = '';
    let seoRobots = '';
    let ogTitle = '';
    let ogDescription = '';
    let ogUrl = '';
    let ogType = type;
    let ogImage = '';
    let ogSiteName = 'Political Eye';
    let twitterCard = 'summary_large_image';
    let twitterTitle = '';
    let twitterDescription = '';
    let twitterImage = '';

    if (yoastHeadJson) {
      // Title & Description
      seoTitle = yoastHeadJson.title || fallbackTitle || 'Political Eye - सच के साथ निडर';
      seoDescription = yoastHeadJson.description || fallbackDescription || '';
      
      // Robots
      if (yoastHeadJson.robots) {
        if (typeof yoastHeadJson.robots === 'object') {
          const robotsParts = [];
          if (yoastHeadJson.robots.index) robotsParts.push(yoastHeadJson.robots.index);
          if (yoastHeadJson.robots.follow) robotsParts.push(yoastHeadJson.robots.follow);
          if (yoastHeadJson.robots['max-snippet']) robotsParts.push(yoastHeadJson.robots['max-snippet']);
          if (yoastHeadJson.robots['max-image-preview']) robotsParts.push(yoastHeadJson.robots['max-image-preview']);
          if (yoastHeadJson.robots['max-video-preview']) robotsParts.push(yoastHeadJson.robots['max-video-preview']);
          seoRobots = robotsParts.join(', ');
        } else {
          seoRobots = yoastHeadJson.robots;
        }
      } else {
        seoRobots = robots;
      }

      // Canonical Link
      seoCanonical = yoastHeadJson.canonical || fallbackUrl || window.location.href;

      // Open Graph (Facebook)
      ogTitle = yoastHeadJson.og_title || seoTitle;
      ogDescription = yoastHeadJson.og_description || seoDescription;
      ogUrl = yoastHeadJson.og_url || seoCanonical;
      ogType = yoastHeadJson.og_type || type;
      ogSiteName = yoastHeadJson.og_site_name || ogSiteName;
      
      if (yoastHeadJson.og_image && Array.isArray(yoastHeadJson.og_image) && yoastHeadJson.og_image.length > 0) {
        ogImage = yoastHeadJson.og_image[0].url || fallbackImage || '';
      } else if (typeof yoastHeadJson.og_image === 'string') {
        ogImage = yoastHeadJson.og_image || fallbackImage || '';
      } else {
        ogImage = fallbackImage || '';
      }

      // Twitter Cards
      twitterCard = yoastHeadJson.twitter_card || 'summary_large_image';
      twitterTitle = yoastHeadJson.twitter_title || ogTitle;
      twitterDescription = yoastHeadJson.twitter_description || ogDescription;
      twitterImage = yoastHeadJson.twitter_image || ogImage;
    } else {
      // Fallback mappings if Yoast JSON is absent
      const defaultTitleSuffix = ' - Political Eye';
      let titleVal = fallbackTitle || 'Political Eye - सच के साथ निडर';
      if (fallbackTitle && !fallbackTitle.includes(defaultTitleSuffix)) {
        titleVal = `${fallbackTitle}${defaultTitleSuffix}`;
      }
      
      seoTitle = titleVal;
      seoDescription = fallbackDescription || 'Political Eye brings you the latest political analysis, news reports, local insights and international briefings from across India.';
      seoCanonical = fallbackUrl || window.location.href;
      seoRobots = robots;

      ogTitle = seoTitle;
      ogDescription = seoDescription;
      ogUrl = seoCanonical;
      ogType = type;
      ogImage = fallbackImage || '';
      
      twitterCard = 'summary_large_image';
      twitterTitle = seoTitle;
      twitterDescription = seoDescription;
      twitterImage = ogImage;
    }

    // 2. Perform DOM head updates
    // Update document.title
    document.title = seoTitle;

    // Helper function to update or create a meta tag
    const updateMetaTag = (name, property, content) => {
      if (content === undefined || content === null) return;
      let selector = '';
      if (name) selector = `meta[name="${name}"]`;
      else if (property) selector = `meta[property="${property}"]`;

      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (name) element.setAttribute('name', name);
        if (property) element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper function to update or create a link tag
    const updateLinkTag = (rel, href) => {
      if (!href) return;
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Update standard search tags
    updateMetaTag('description', null, seoDescription);
    updateMetaTag('robots', null, seoRobots);
    updateLinkTag('canonical', seoCanonical);

    // Update Open Graph (Facebook) Tags
    updateMetaTag(null, 'og:locale', yoastHeadJson?.og_locale || 'hi_IN');
    updateMetaTag(null, 'og:type', ogType);
    updateMetaTag(null, 'og:title', ogTitle);
    updateMetaTag(null, 'og:description', ogDescription);
    updateMetaTag(null, 'og:url', ogUrl);
    updateMetaTag(null, 'og:site_name', ogSiteName);
    updateMetaTag(null, 'og:image', ogImage);
    
    if (yoastHeadJson?.article_published_time) {
      updateMetaTag(null, 'article:published_time', yoastHeadJson.article_published_time);
    }

    // Update Twitter Cards Tags
    updateMetaTag('twitter:card', null, twitterCard);
    updateMetaTag('twitter:title', null, twitterTitle);
    updateMetaTag('twitter:description', null, twitterDescription);
    updateMetaTag('twitter:image', null, twitterImage);

    // 3. Dynamic Schema.org LD+JSON Injection & Fallbacks
    let activeSchema = yoastHeadJson?.schema || null;

    // Generate fallbacks for news articles if schema is completely absent
    if (!activeSchema && type === 'article') {
      activeSchema = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": seoTitle,
        "description": seoDescription,
        "image": ogImage ? [ogImage] : [],
        "datePublished": yoastHeadJson?.article_published_time || new Date().toISOString(),
        "author": {
          "@type": "Person",
          "name": ogSiteName
        },
        "publisher": {
          "@type": "Organization",
          "name": ogSiteName,
          "logo": {
            "@type": "ImageObject",
            "url": "https://backend.politicaleye.in/wp-content/uploads/2026/05/ChatGPT-Image-May-21-2026-05_01_07-PM.png"
          }
        }
      };
    }

    if (activeSchema) {
      let schemaElement = document.querySelector('script[type="application/ld+json"]');
      if (!schemaElement) {
        schemaElement = document.createElement('script');
        schemaElement.setAttribute('type', 'application/ld+json');
        document.head.appendChild(schemaElement);
      }
      schemaElement.textContent = JSON.stringify(activeSchema);
    } else {
      const schemaElement = document.querySelector('script[type="application/ld+json"]');
      if (schemaElement) {
        schemaElement.remove();
      }
    }

    // Cleanup: Clear schema tag when page changes to prevent leak
    return () => {
      const schemaElement = document.querySelector('script[type="application/ld+json"]');
      if (schemaElement) {
        schemaElement.remove();
      }
    };
  }, [yoastHeadJson, fallbackTitle, fallbackDescription, fallbackImage, fallbackUrl, type, robots]);

  // The SEO component is a utility head manager and renders no visible UI elements
  return null;
};

export default SEO;
