import axios from 'axios';

// WordPress Remote Backend API
const WP_API_URL = import.meta.env.VITE_WP_API_URL || 'https://backend.politicaleye.in/wp-json';

// Dynamic Database Slug Translation Map (Bridges the WordPress encoding slugs to React paths)
const DB_SLUG_MAP = {
  'home': 'cat-78738',
  'bihar': 'cat-98493',
  'jharkhand': 'cat-15860',
  'sports': 'cat-53515',
  'career': 'cat-62666',
  'entertainment': 'cat-75813',
  'religion': 'cat-12952',
  'national': 'cat-58595',
  'international': 'cat-25523'
};

const SLUG_REVERSE_MAP = {
  'cat-78738': 'home',
  'cat-98493': 'bihar',
  'cat-15860': 'jharkhand',
  'cat-53515': 'sports',
  'cat-62666': 'career',
  'cat-75813': 'entertainment',
  'cat-12952': 'religion',
  'cat-58595': 'national',
  'cat-25523': 'international'
};

// Category translations map (English/bridge slugs -> Beautiful Hindi labels)
const CATEGORY_HINDI_MAP = {
  'home': 'होम',
  'bihar': 'बिहार समाचार',
  'jharkhand': 'झारखंड',
  'national': 'देश',
  'international': 'विदेश',
  'entertainment': 'मनोरंजन',
  'religion': 'धर्म और आस्था',
  'sports': 'खेल',
  'career': 'करियर',
  'lifestyle': 'लाइफस्टाइल',
  'video': 'वीडियो'
};

/**
 * Fallback default image in case a WordPress post has no featured image attached
 */
const getDefaultImage = () => {
  return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';
};

/**
 * Strips HTML tags from a string. Helpful for clean excerpts/summaries.
 */
const stripHtml = (html) => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

/**
 * Parses ISO 8601 duration string (e.g. PT10M15S) to human readable MM:SS format
 */
const parseISO8601Duration = (duration) => {
  if (!duration) return '0:00';
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const hours = (parseInt(match[1]) || 0);
  const minutes = (parseInt(match[2]) || 0);
  const seconds = (parseInt(match[3]) || 0);
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Formats numeric views count into a cleaner format like K or M
 */
const formatViews = (views) => {
  const count = parseInt(views) || 0;
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
};

/**
 * Extracts and maps featured image from the embedded media array in WP REST response.
 */
const getFeaturedImage = (post) => {
  const media = post._embedded?.['wp:featuredmedia']?.[0] || post._embedded?.['wp:featuredmedia'];
  if (!media) {
    return getDefaultImage();
  }

  const sizes = media.media_details?.sizes || {};
  const preferredKeys = ['large', 'medium_large', 'full', 'medium', 'post-thumbnail'];
  for (const key of preferredKeys) {
    if (sizes[key] && sizes[key].source_url) return sizes[key].source_url;
  }

  if (media.source_url) return media.source_url;
  const anySize = Object.values(sizes).find(s => s.source_url);
  if (anySize && anySize.source_url) return anySize.source_url;

  return getDefaultImage();
};

const buildSrcset = (post) => {
  const media = post._embedded?.['wp:featuredmedia']?.[0] || post._embedded?.['wp:featuredmedia'];
  if (!media) return null;
  const sizes = media.media_details?.sizes || {};
  const entries = [];
  Object.keys(sizes).forEach(key => {
    const s = sizes[key];
    if (s && s.source_url && s.width) entries.push({ url: s.source_url, w: s.width });
  });
  if (entries.length === 0 && media.source_url) {
    entries.push({ url: media.source_url, w: media.media_details?.width || 800 });
  }
  entries.sort((a, b) => a.w - b.w);
  if (entries.length === 0) return null;
  return entries.map(e => `${e.url} ${e.w}w`).join(', ');
};

/**
 * Extracts the first category term from embedded taxonomies and maps custom slugs.
 */
const getCategory = (post) => {
  const terms = post._embedded?.['wp:term']?.[0] || [];
  const categoryTerm = terms.find(term => term.taxonomy === 'category');
  if (categoryTerm) {
    const cleanSlug = SLUG_REVERSE_MAP[categoryTerm.slug] || categoryTerm.slug;
    return {
      id: categoryTerm.id,
      name: CATEGORY_HINDI_MAP[cleanSlug] || categoryTerm.name,
      slug: cleanSlug
    };
  }
  return { id: 1, name: 'समाचार', slug: 'uncategorized' };
};

/**
 * Extracts the author name from embedded authors.
 */
const getAuthor = (post) => {
  const author = post._embedded?.['author']?.[0];
  return {
    id: author?.id || 1,
    name: author?.name || 'प्रभात खबर ब्यूरो'
  };
};

/**
 * Maps a raw WordPress API post object into the clean data structure used by our React components.
 */
export const mapWordPressPost = (post) => {
  const category = getCategory(post);
  const author = getAuthor(post);
  const featuredImage = getFeaturedImage(post);
  const media = post._embedded?.['wp:featuredmedia']?.[0] || post._embedded?.['wp:featuredmedia'];
  const featuredAlt = media?.alt_text || '';
  const featuredCaption = stripHtml(media?.caption?.rendered || '');
  const featuredSrcset = buildSrcset(post);
  
  const terms = post._embedded?.['wp:term']?.[1] || []; 
  const isBreaking = post.sticky || terms.some(t => t.slug === 'breaking' || t.name === 'breaking');
  const isTrending = terms.some(t => t.slug === 'trending' || t.name === 'trending') || (post.id % 3 === 0);
  const mockViews = ((post.id * 83) % 4500) + 240;

  return {
    id: post.id,
    title: post.title?.rendered || 'शीर्षक उपलब्ध नहीं है',
    summary: stripHtml(post.excerpt?.rendered || '').substring(0, 150) + '...',
    content: post.content?.rendered || '',
    featured_image: featuredImage,
    featured_image_alt: featuredAlt,
    featured_image_caption: featuredCaption,
    featured_image_srcset: featuredSrcset,
    category: category,
    category_id: category.id,
    author: author,
    published_at: post.date,
    views: mockViews,
    is_breaking: isBreaking,
    is_trending: isTrending,
    is_sticky: post.sticky || false,
    slug: post.slug,
    yoast_head: post.yoast_head || '',
    yoast_head_json: post.yoast_head_json || null
  };
};

// High-Performance In-Memory Query Resolvers
const categorySlugIdMap = {};
const tagSlugIdMap = {};
const citySlugIdMap = {};

// SWR Session Caching Wrapper
const swrCache = {
  get(key) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  },
  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }
};

const wpService = {
  /**
   * Fetches all categories directly from the WordPress REST API and maps encoding slugs.
   */
  async getCategories() {
    const cacheKey = 'wp_categories';
    const cached = swrCache.get(cacheKey);
    if (cached) {
      // Revalidate in the background
      setTimeout(() => {
        this.fetchAndCacheCategories(cacheKey).catch(() => {});
      }, 50);
      return cached;
    }
    return this.fetchAndCacheCategories(cacheKey);
  },

  async fetchAndCacheCategories(cacheKey) {
    try {
      const response = await axios.get(`${WP_API_URL}/wp/v2/categories?per_page=100&_cb=${Date.now()}`, { timeout: 8000 });
      let cats = response.data.map(cat => {
        const cleanSlug = SLUG_REVERSE_MAP[cat.slug] || cat.slug;
        return {
          id: cat.id,
          name: CATEGORY_HINDI_MAP[cleanSlug] || cat.name,
          slug: cleanSlug,
          count: cat.count,
          yoast_head: cat.yoast_head || '',
          yoast_head_json: cat.yoast_head_json || null
        };
      });
      
      if (cats.length > 0) {
        cats = cats.filter(c => c.slug !== 'uncategorized');
      }

      swrCache.set(cacheKey, cats);
      return cats;
    } catch (error) {
      console.error('Error fetching WordPress categories:', error.message);
      return [];
    }
  },

  /**
   * Fetches tags directly from the WordPress REST API ordered by count.
   */
  async getTags() {
    const cacheKey = 'wp_tags';
    const cached = swrCache.get(cacheKey);
    if (cached) {
      setTimeout(() => {
        this.fetchAndCacheTags(cacheKey).catch(() => {});
      }, 50);
      return cached;
    }
    return this.fetchAndCacheTags(cacheKey);
  },

  async fetchAndCacheTags(cacheKey) {
    try {
      const response = await axios.get(`${WP_API_URL}/wp/v2/tags?per_page=12&orderby=count&order=desc&_cb=${Date.now()}`, { timeout: 8000 });
      if (response.data && response.data.length > 0) {
        let tagsList = response.data.map(t => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          count: t.count
        }));
        swrCache.set(cacheKey, tagsList);
        return tagsList;
      }
    } catch (e) {
      console.warn('Could not fetch tags from WP, using fallback');
    }
    const defaultTags = [
      { id: 71, name: 'Viral News', slug: 'viral-news', count: 2 },
      { id: 78, name: 'Breaking News', slug: 'breaking-news', count: 1 },
      { id: 87, name: 'Bollywood News', slug: 'bollywood-news', count: 1 },
      { id: 101, name: 'Karnataka Politics', slug: 'karnataka-politics', count: 1 },
      { id: 116, name: 'UP Politics', slug: 'up-politics', count: 1 },
      { id: 77, name: 'Political News', slug: 'political-news', count: 1 }
    ];
    swrCache.set(cacheKey, defaultTags);
    return defaultTags;
  },

  /**
   * Fetches cities from custom taxonomy from WP REST API.
   */
  async getCities() {
    const cacheKey = 'wp_cities';
    const cached = swrCache.get(cacheKey);
    if (cached) {
      setTimeout(() => {
        this.fetchAndCacheCities(cacheKey).catch(() => {});
      }, 50);
      return cached;
    }
    return this.fetchAndCacheCities(cacheKey);
  },

  async fetchAndCacheCities(cacheKey) {
    try {
      const response = await axios.get(`${WP_API_URL}/wp/v2/cities?per_page=20&_cb=${Date.now()}`, { timeout: 5000 });
      if (response.data && response.data.length > 0) {
        const citiesList = ['All', ...response.data.map(c => c.name)];
        swrCache.set(cacheKey, citiesList);
        return citiesList;
      }
    } catch (e) {
      console.warn('Could not fetch cities taxonomy from WP, using fallback');
    }
    const defaultCities = ['All', 'रांची', 'पटना', 'दिल्ली', 'जमशेदपुर', 'कोलकाता', 'मुजफ्फरपुर', 'भागलपुर', 'धनबाद', 'देवघर'];
    swrCache.set(cacheKey, defaultCities);
    return defaultCities;
  },

  /**
   * Fetches posts directly from the WordPress REST API with dynamic slug translation.
   */
  async getPosts(options = {}) {
    const { categorySlug, tagSlug, city, page = 1, perPage = 10, search = '' } = options;
    const cacheKey = `wp_posts_${categorySlug || ''}_${tagSlug || ''}_${city || ''}_${page}_${perPage}_${search}`;

    const cached = swrCache.get(cacheKey);
    if (cached) {
      // Revalidate in the background silently
      setTimeout(() => {
        this.fetchAndCachePosts(options, cacheKey).catch(() => {});
      }, 50);
      return cached;
    }
    return this.fetchAndCachePosts(options, cacheKey);
  },

  async fetchAndCachePosts(options, cacheKey) {
    const { categorySlug, tagSlug, city, page = 1, perPage = 10, search = '' } = options;
    
    try {
      let params = {
        _embed: true,
        page,
        per_page: perPage,
        status: 'publish',
        _cb: Date.now() // Prevent browser caching so edits show instantly
      };

      if (search) {
        params.search = search;
      }

      // Handle Tag Filtering (using in-memory slug lookup cache)
      if (tagSlug) {
        if (tagSlugIdMap[tagSlug]) {
          params.tags = tagSlugIdMap[tagSlug];
        } else {
          try {
            const tagsResponse = await axios.get(`${WP_API_URL}/wp/v2/tags?slug=${tagSlug}&_cb=${Date.now()}`);
            if (tagsResponse.data && tagsResponse.data.length > 0) {
              const tagId = tagsResponse.data[0].id;
              tagSlugIdMap[tagSlug] = tagId;
              params.tags = tagId;
            }
          } catch (e) {
            console.warn(`Could not resolve tag slug: ${tagSlug}`);
          }
        }
      }

      // Handle Custom Taxonomy Filtering (Cities) (using in-memory lookup cache)
      if (city && city !== 'All') {
        if (citySlugIdMap[city]) {
          params.cities = citySlugIdMap[city];
        } else {
          try {
            const citiesResponse = await axios.get(`${WP_API_URL}/wp/v2/cities?slug=${encodeURIComponent(city)}&_cb=${Date.now()}`);
            if (citiesResponse.data && citiesResponse.data.length > 0) {
              const cityId = citiesResponse.data[0].id;
              citySlugIdMap[city] = cityId;
              params.cities = cityId;
            } else {
              // Fallback 1: Try searching for a tag matching the city name
              const tagsResponse = await axios.get(`${WP_API_URL}/wp/v2/tags?search=${encodeURIComponent(city)}&_cb=${Date.now()}`);
              if (tagsResponse.data && tagsResponse.data.length > 0) {
                const exactTag = tagsResponse.data.find(t => t.name === city || t.name.includes(city));
                if (exactTag) {
                  params.tags = exactTag.id;
                } else {
                  // Fallback 2: Search term query fallback if no exact tag
                  params.search = city;
                }
              } else {
                // Fallback 2: Search term query fallback
                params.search = city;
              }
            }
          } catch (e) {
            console.warn(`Could not resolve city taxonomy or tag for: ${city}, using search fallback`);
            params.search = city;
          }
        }
      }

      if (categorySlug && categorySlug !== 'home') {
        if (categorySlugIdMap[categorySlug]) {
          params.categories = categorySlugIdMap[categorySlug];
        } else {
          const targetSlug = DB_SLUG_MAP[categorySlug] || categorySlug;
          const catsResponse = await axios.get(`${WP_API_URL}/wp/v2/categories?slug=${targetSlug}&_cb=${Date.now()}`);
          
          if (catsResponse.data && catsResponse.data.length > 0) {
            const catId = catsResponse.data[0].id;
            categorySlugIdMap[categorySlug] = catId;
            params.categories = catId;
          } else {
            const backupResponse = await axios.get(`${WP_API_URL}/wp/v2/categories?slug=${categorySlug}&_cb=${Date.now()}`);
            if (backupResponse.data && backupResponse.data.length > 0) {
              const catId = backupResponse.data[0].id;
              categorySlugIdMap[categorySlug] = catId;
              params.categories = catId;
            } else {
              return { data: [], totalPages: 1 };
            }
          }
        }
      }

      const response = await axios.get(`${WP_API_URL}/wp/v2/posts`, { params, timeout: 8000 });
      if (response.data) {
        const posts = response.data.map(mapWordPressPost);
        const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1', 10);
        const result = { data: posts, totalPages };
        swrCache.set(cacheKey, result);
        return result;
      }
      return { data: [], totalPages: 1 };
    } catch (error) {
      console.error('Error fetching WordPress posts:', error.message);
      return { data: [], totalPages: 1 };
    }
  },

  async getShorts(options = {}) {
    const { perPage = 10 } = options;
    try {
      const response = await axios.get(`${WP_API_URL}/wp/v2/shorts`, {
        params: { _embed: true, per_page: perPage, _cb: Date.now() },
        timeout: 5000
      });
      
      if (response.data && response.data.length > 0) {
        const wpShorts = response.data.map(post => {
          const featuredImage = getFeaturedImage(post);
          return {
            id: post.id,
            title: post.title?.rendered || '',
            youtube_id: post.acf?.youtube_id || post.acf?.youtube_video_id || '',
            url: post.acf?.youtube_url || `https://www.youtube.com/watch?v=${post.acf?.youtube_id}`,
            featured_image: featuredImage,
            views: ((post.id * 83) % 4500) + 240 + 'K'
          };
        });
        return wpShorts;
      }
    } catch (error) {
      console.warn('Error fetching WordPress shorts:', error.message);
    }
    return [];
  },

  /**
   * Fetches a single article/post detail by slug from WordPress.
   */
  async getPostBySlug(slug) {
    try {
      const response = await axios.get(`${WP_API_URL}/wp/v2/posts`, {
        params: { slug, _embed: true, _cb: Date.now() },
        timeout: 8000
      });
      
      if (response.data && response.data.length > 0) {
        return mapWordPressPost(response.data[0]);
      }
      throw new Error("Article not found in WordPress");
    } catch (error) {
      console.error(`Error fetching single WordPress post for slug "${slug}":`, error.message);
      throw new Error("आलेख नहीं मिला।");
    }
  },

  /**
   * Fetches comments for a specific post from WordPress.
   */
  async getComments(postId) {
    try {
      const response = await axios.get(`${WP_API_URL}/wp/v2/comments`, {
        params: { post: postId, status: 'approve', _cb: Date.now() },
        timeout: 8000
      });
      return response.data.map(comment => ({
        id: comment.id,
        author_name: comment.author_name,
        comment: stripHtml(comment.content?.rendered || ''),
        created_at: comment.date
      }));
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error.message);
      return [];
    }
  },

  /**
   * Submits a guest comment to the WordPress comment REST endpoint.
   */
  async submitComment(postId, authorName, authorEmail = 'guest@newspaper.com', commentText) {
    try {
      const response = await axios.post(`${WP_API_URL}/wp/v2/comments`, {
        post: postId,
        author_name: authorName,
        author_email: authorEmail,
        content: commentText
      }, { timeout: 8000 });

      return {
        id: response.data.id,
        author_name: response.data.author_name,
        comment: stripHtml(response.data.content?.rendered || ''),
        created_at: response.data.date
      };
    } catch (error) {
      console.error('Error submitting comment to WordPress:', error);
      throw new Error('प्रतिक्रिया भेजने में विफलता। कृपया बाद में प्रयास करें।');
    }
  },

  async fetchAds() {
    return fetchAds();
  },

  async fetchAdsByPlacement(placement) {
    const list = await fetchAdsByPlacement(placement);
    return list.length > 0 ? list[0] : null;
  },

  async getAdvertisements() {
    return fetchAds();
  },

  async fetchMainMenu() {
    return fetchMainMenu();
  },

  /**
   * Fetches real YouTube videos and shorts from the YouTube Data API v3
   */
  async getYoutubeData() {
    const CHANNEL_ID = 'UCNS1bVuTNLG2s8uAVHSJTqA';
    const API_KEY = 'AIzaSyDcZHILOK39GVrN8IOvLSUXNBCZIJUeNlo';
    const UPLOADS_PLAYLIST_ID = 'UUNS1bVuTNLG2s8uAVHSJTqA';
    
    const cachedData = sessionStorage.getItem('political_eye_youtube_data');
    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (e) {
        // Silent fallback
      }
    }

    try {
      // Step 1: Fetch playlist items (uploads) - 1 quota unit
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=30&key=${API_KEY}`;
      const playlistRes = await axios.get(playlistUrl, { timeout: 8000 });
      
      if (playlistRes.data && playlistRes.data.items) {
        const items = playlistRes.data.items;
        const videoIds = items.map(item => item.snippet.resourceId?.videoId).filter(Boolean);
        
        let videoDetailsMap = {};
        
        // Step 2: Fetch detailed statistics/durations for all retrieved video IDs in one go - 1 quota unit
        if (videoIds.length > 0) {
          try {
            const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds.join(',')}&key=${API_KEY}`;
            const detailsRes = await axios.get(detailsUrl, { timeout: 5000 });
            if (detailsRes.data && detailsRes.data.items) {
              detailsRes.data.items.forEach(v => {
                videoDetailsMap[v.id] = {
                  viewsCount: v.statistics?.viewCount || '0',
                  durationRaw: v.contentDetails?.duration || ''
                };
              });
            }
          } catch (detailsErr) {
            // Silent fallback
          }
        }

        // Step 3: Map items with real views and duration
        const mappedItems = items.map(item => {
          const snippet = item.snippet;
          const videoId = snippet.resourceId?.videoId;
          const title = snippet.title || '';
          const description = snippet.description || '';
          
          const details = videoDetailsMap[videoId] || {};
          const viewsCount = details.viewsCount ? formatViews(details.viewsCount) : '150K';
          const duration = details.durationRaw ? parseISO8601Duration(details.durationRaw) : '10:00';
          
          const thumbnail = snippet.thumbnails?.maxres?.url || 
                            snippet.thumbnails?.high?.url || 
                            snippet.thumbnails?.medium?.url || 
                            snippet.thumbnails?.default?.url || 
                            'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80';

          const isShort = title.toLowerCase().includes('#shorts') || 
                          title.toLowerCase().includes('#short') ||
                          description.toLowerCase().includes('#shorts') || 
                          description.toLowerCase().includes('#short') ||
                          (details.durationRaw && details.durationRaw.includes('S') && !details.durationRaw.includes('M') && !details.durationRaw.includes('H')); // under 60 seconds

          return {
            id: videoId,
            youtube_id: videoId,
            title: title.replace(/#shorts|#short/gi, '').trim(),
            thumbnail: thumbnail,
            featured_image: thumbnail,
            url: isShort ? `https://www.youtube.com/shorts/${videoId}` : `https://www.youtube.com/watch?v=${videoId}`,
            views: viewsCount + ' views',
            duration: duration,
            isShort: isShort
          };
        });

        const shorts = mappedItems.filter(item => item.isShort);
        const videos = mappedItems.filter(item => !item.isShort);

        const result = { shorts, videos };
        sessionStorage.setItem('political_eye_youtube_data', JSON.stringify(result));
        return result;
      }
    } catch (error) {
      // Silent fallback
    }

    return { shorts: [], videos: [] };
  },

  /**
   * Fetches Yoast SEO data for a specific URL using the Yoast SEO REST API.
   */
  async getSeoByUrl(url) {
    try {
      const response = await axios.get(`${WP_API_URL}/yoast/v1/get_head`, {
        params: { url },
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }
};

/**
 * Clean helper function to fetch all ads from WordPress Ads CPT
 */
export async function fetchAds() {
  try {
    const response = await axios.get(`${WP_API_URL}/wp/v2/ads?_embed=true&_cb=${Date.now()}&per_page=100`, { timeout: 5000 });
    const ads = response.data || [];
    
    const mappedAds = ads.map((ad) => {
      const featuredImage = ad._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
      const targetUrl = ad.acf?.target_url || "#";
      
      // Read placement from ACF
      let placement = ad.acf?.placement || "";

      // Smart title-based fallback if ACF placement is empty (acf: [])
      if (!placement && ad.title?.rendered) {
        const titleLower = String(ad.title.rendered).toLowerCase();
        if (titleLower.includes('navbar') || titleLower.includes('header')) {
          placement = "Navbar (Next to Top Logo)";
        } else if (titleLower.includes('hero')) {
          placement = "Hero Banner (Home Page Middle)";
        } else if (titleLower.includes('footer')) {
          placement = "Footer Banner";
        } else if (titleLower.includes('left')) {
          placement = "Left Sidebar (Article Pages)";
        } else if (titleLower.includes('right')) {
          placement = "Right Sidebar (Home & Article Pages)";
        }
      }

      return {
        id: ad.id,
        title: ad.title?.rendered || "",
        image: featuredImage,
        image_url: featuredImage,
        targetUrl: targetUrl,
        target_url: targetUrl,
        placement: placement,
        is_active: true
      };
    }).filter((ad) => ad.image && ad.placement);

    if (mappedAds.length === 0) {
      console.warn("No valid CPT ads found, attempting legacy category fallback...");
      return await getLegacyAds();
    }

    return mappedAds;
  } catch (error) {
    console.error("Error fetching ads, trying legacy fallback:", error);
    return await getLegacyAds();
  }
}

/**
 * Clean helper function to filter ads strictly by their exact placement
 */
export async function fetchAdsByPlacement(placement) {
  const ads = await fetchAds();
  return ads.filter((ad) => {
    if (Array.isArray(ad.placement)) {
      return ad.placement.includes(placement);
    }
    return ad.placement === placement;
  });
}

/**
 * Legacy category ads fallback helper
 */
async function getLegacyAds() {
  try {
    let categoryId = null;
    try {
      const catRes = await axios.get(`${WP_API_URL}/wp/v2/categories?slug=advertisements&_cb=${Date.now()}`);
      if (catRes.data && catRes.data.length > 0) {
        categoryId = catRes.data[0].id;
      } else {
        const catAdsRes = await axios.get(`${WP_API_URL}/wp/v2/categories?slug=cat-ads&_cb=${Date.now()}`);
        if (catAdsRes.data && catAdsRes.data.length > 0) {
          categoryId = catAdsRes.data[0].id;
        }
      }
    } catch (e) {
      console.warn("Failed resolving legacy advertisements category");
    }

    if (categoryId) {
      const response = await axios.get(`${WP_API_URL}/wp/v2/posts?categories=${categoryId}&_embed=true&_cb=${Date.now()}&per_page=12`, { timeout: 8000 });
      if (response.data && response.data.length > 0) {
        return response.data.map(post => {
          const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
          const targetUrl = post.acf?.target_url || "#";
          
          const terms = post._embedded?.['wp:term']?.[1] || [];
          let placement = 'Right Sidebar (Home & Article Pages)';
          
          if (terms.some(t => t.slug === 'right' || t.name === 'right' || t.name === 'Right Sidebar')) {
            placement = 'Right Sidebar (Home & Article Pages)';
          } else if (terms.some(t => t.slug === 'header' || t.name === 'header' || t.slug === 'navbar' || t.name === 'Navbar')) {
            placement = 'Navbar (Next to Top Logo)';
          } else if (terms.some(t => t.slug === 'hero' || t.name === 'hero' || t.name === 'Hero banner')) {
            placement = 'Hero Banner (Home Page Middle)';
          } else if (terms.some(t => t.slug === 'footer' || t.name === 'footer' || t.name === 'Footer Banner')) {
            placement = 'Footer Banner';
          } else if (terms.some(t => t.slug === 'left' || t.name === 'left' || t.name === 'Left Sidebar')) {
            placement = 'Left Sidebar (Article Pages)';
          }

          return {
            id: post.id,
            title: post.title?.rendered || "",
            image: featuredImage,
            image_url: featuredImage,
            targetUrl: targetUrl,
            target_url: targetUrl,
            placement: placement,
            is_active: true
          };
        }).filter(ad => ad.image && ad.placement);
      }
    }
  } catch (e) {
    console.warn("Failed loading legacy ads fallback:", e.message);
  }
  return [];
}

/**
 * Clean helper function to fetch menu items from WordPress Appearance -> Menus -> Main Menu
 */
export async function fetchMainMenu() {
  // First Priority: Try the user's working custom main-menu endpoint
  try {
    const response = await axios.get(`${WP_API_URL}/custom/v1/main-menu?_cb=${Date.now()}`, { timeout: 5000 });
    if (response.data && response.data.success && Array.isArray(response.data.items)) {
      const items = response.data.items;
      // Sort menu items by order ascending
      const sortedItems = items.sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));
      return sortedItems.map(item => {
        return {
          id: item.id,
          title: item.title,
          url: item.url,
          type: item.type || "custom",
          parent: parseInt(item.parent) || 0,
          order: parseInt(item.order) || 0
        };
      });
    }
  } catch (error) {
    console.warn("Custom WordPress main-menu fetch failed, trying standard locations:", error.message);
  }

  // Backup Endpoints
  const endpoints = [
    `${WP_API_URL}/custom/v1/menu`,
    `${WP_API_URL}/wp-api-menus/v2/menu-locations/main-menu`,
    `${WP_API_URL}/wp-api-menus/v2/menus`,
    `${WP_API_URL}/menus/v1/menus/main-menu`,
    `${WP_API_URL}/menus/v1/menus`,
    `${WP_API_URL}/wp/v2/menus`,
    `${WP_API_URL}/wp/v2/menu-items`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint, { timeout: 3000 });
      let items = [];

      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (response.data?.items) {
        items = response.data.items;
      } else if (response.data?.[0]?.items) {
        items = response.data[0].items;
      }

      if (items.length > 0) {
        const sortedItems = items.sort((a, b) => (parseInt(a.menu_order || a.order) || 0) - (parseInt(b.menu_order || b.order) || 0));
        return sortedItems.map((item, idx) => {
          let slug = item.slug || "";
          if (!slug && item.url) {
            const parts = item.url.split('/').filter(Boolean);
            slug = parts[parts.length - 1] || "custom";
          }
          
          return {
            id: item.ID || item.id || idx,
            title: item.title || item.name || "",
            url: item.url || "#",
            slug: slug,
            type: item.type || "custom",
            parent: parseInt(item.menu_item_parent || item.parent) || 0,
            order: parseInt(item.menu_order || item.order) || idx + 1
          };
        });
      }
    } catch (e) {
      // Continue to next endpoint if failed
    }
  }

  console.warn("No active WordPress Menu REST API plugin detected. Falling back to structured main menu items.");
  return await getFallbackMenu();
}

/**
 * Menu fallback generator using user's required menu list and WordPress categories
 */
async function getFallbackMenu() {
  try {
    const categories = await wpService.getCategories();
    
    const requiredLabels = [
      { title: "होम", slug: "home", url: "/" },
      { title: "राज्य", slug: "jharkhand", url: "/category/jharkhand" },
      { title: "राजनीति", slug: "politics", url: "/category/politics" },
      { title: "लाइफस्टाइल", slug: "lifestyle", url: "/category/lifestyle" },
      { title: "बिजनेस", slug: "business", url: "/category/business" },
      { title: "मनोरंजन", slug: "entertainment", url: "/category/entertainment" },
      { title: "हेल्थ", slug: "health", url: "/category/health" },
      { title: "टेक", slug: "technology", url: "/category/technology" },
      { title: "शिक्षा", slug: "career", url: "/category/career" },
      { title: "ऑटो", slug: "automobile", url: "/category/automobile" },
      { title: "खेल", slug: "sports", url: "/category/sports" },
      { title: "धर्म", slug: "religion", url: "/category/religion" }
    ];

    return requiredLabels.map((item, idx) => {
      const mappedSlug = DB_SLUG_MAP[item.slug] || item.slug;
      const matchedCat = categories.find(c => c.slug === item.slug || c.slug === mappedSlug);
      
      return {
        id: matchedCat ? matchedCat.id : 1000 + idx,
        title: item.title,
        url: item.url,
        slug: matchedCat ? matchedCat.slug : item.slug,
        type: matchedCat ? "category" : "custom",
        parent: 0,
        order: idx + 1
      };
    });
  } catch (error) {
    console.warn("Failed generating category-based fallback menu:", error.message);
    return [];
  }
}

export default wpService;
