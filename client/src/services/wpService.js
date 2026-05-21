import axios from 'axios';

// WordPress Remote Backend API
const WP_API_URL = import.meta.env.VITE_WP_API_URL || 'https://newspaper.keshav-enterprises.co.in/wp-json';

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
 * Extracts and maps featured image from the embedded media array in WP REST response.
 */
const getFeaturedImage = (post) => {
  const media = post._embedded?.['wp:featuredmedia']?.[0] || post._embedded?.['wp:featuredmedia'];
  if (!media) {
    return getDefaultImage();
  }

  const sizes = media.media_details?.sizes || {};
  const preferredKeys = ['post-thumbnail', 'medium', 'medium_large', 'large', 'full'];
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
    slug: post.slug
  };
};

const wpService = {
  /**
   * Fetches all categories directly from the WordPress REST API and maps encoding slugs.
   */
  async getCategories() {
    try {
      const response = await axios.get(`${WP_API_URL}/wp/v2/categories?per_page=100&_cb=${Date.now()}`, { timeout: 8000 });
      let cats = response.data.map(cat => {
        const cleanSlug = SLUG_REVERSE_MAP[cat.slug] || cat.slug;
        return {
          id: cat.id,
          name: CATEGORY_HINDI_MAP[cleanSlug] || cat.name,
          slug: cleanSlug,
          count: cat.count
        };
      });
      
      if (cats.length > 0) {
        cats = cats.filter(c => c.slug !== 'uncategorized');
      }

      return cats;
    } catch (error) {
      console.error('Error fetching WordPress categories:', error.message);
      return [];
    }
  },

  /**
   * Fetches cities from custom taxonomy from WP REST API.
   */
  async getCities() {
    try {
      const response = await axios.get(`${WP_API_URL}/wp/v2/cities?per_page=20&_cb=${Date.now()}`, { timeout: 5000 });
      if (response.data && response.data.length > 0) {
        return ['All', ...response.data.map(c => c.name)];
      }
    } catch (e) {
      console.warn('Could not fetch cities taxonomy from WP, using fallback');
    }
    return ['All', 'रांची', 'पटना', 'दिल्ली', 'जमशेदपुर', 'कोलकाता', 'मुजफ्फरपुर', 'भागलपुर', 'धनबाद', 'देवघर'];
  },

  /**
   * Fetches posts directly from the WordPress REST API with dynamic slug translation.
   */
  async getPosts(options = {}) {
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

      // Handle Tag Filtering
      if (tagSlug) {
        try {
          const tagsResponse = await axios.get(`${WP_API_URL}/wp/v2/tags?slug=${tagSlug}&_cb=${Date.now()}`);
          if (tagsResponse.data && tagsResponse.data.length > 0) {
            params.tags = tagsResponse.data[0].id;
          }
        } catch (e) {
          console.warn(`Could not resolve tag slug: ${tagSlug}`);
        }
      }

      // Handle Custom Taxonomy Filtering (Cities)
      if (city && city !== 'All') {
        try {
          // Assuming the custom taxonomy rest_base is 'cities'
          const citiesResponse = await axios.get(`${WP_API_URL}/wp/v2/cities?slug=${encodeURIComponent(city)}&_cb=${Date.now()}`);
          if (citiesResponse.data && citiesResponse.data.length > 0) {
            params.cities = citiesResponse.data[0].id;
          }
        } catch (e) {
          console.warn(`Could not resolve city taxonomy: ${city}`);
        }
      }

      if (categorySlug && categorySlug !== 'home') {
        const targetSlug = DB_SLUG_MAP[categorySlug] || categorySlug;
        const catsResponse = await axios.get(`${WP_API_URL}/wp/v2/categories?slug=${targetSlug}&_cb=${Date.now()}`);
        
        if (catsResponse.data && catsResponse.data.length > 0) {
          params.categories = catsResponse.data[0].id;
        } else {
          const backupResponse = await axios.get(`${WP_API_URL}/wp/v2/categories?slug=${categorySlug}&_cb=${Date.now()}`);
          if (backupResponse.data && backupResponse.data.length > 0) {
            params.categories = backupResponse.data[0].id;
          } else {
            return { data: [], totalPages: 1 };
          }
        }
      }

      const response = await axios.get(`${WP_API_URL}/wp/v2/posts`, { params, timeout: 8000 });
      if (response.data) {
        const posts = response.data.map(mapWordPressPost);
        const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1', 10);
        return { data: posts, totalPages };
      }
      return { data: [], totalPages: 1 };
    } catch (error) {
      console.error('Error fetching WordPress posts:', error.message);
      return { data: [], totalPages: 1 };
    }
  },

  /**
   * Fetches Shorts/Videos from the custom post type 'shorts'
   */
  async getShorts(options = {}) {
    const { perPage = 10 } = options;
    try {
      const response = await axios.get(`${WP_API_URL}/wp/v2/shorts`, {
        params: { _embed: true, per_page: perPage, _cb: Date.now() },
        timeout: 8000
      });
      
      if (response.data) {
        return response.data.map(post => {
          const featuredImage = getFeaturedImage(post);
          return {
            id: post.id,
            title: post.title?.rendered || '',
            featured_image: featuredImage,
            views: ((post.id * 83) % 4500) + 240 + 'K' // Mock views
          };
        });
      }
      return [];
    } catch (error) {
      console.error('Error fetching Shorts from WordPress:', error.message);
      return [];
    }
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

  /**
   * Fetches advertisements directly from WordPress posts under the 'advertisements' category.
   * Enables complete client-side ad management straight from the WordPress backend.
   */
  async getAdvertisements() {
    try {
      let categoryId = null;
      try {
        const catRes = await axios.get(`${WP_API_URL}/wp/v2/categories?slug=advertisements&_cb=${Date.now()}`);
        if (catRes.data && catRes.data.length > 0) {
          categoryId = catRes.data[0].id;
        } else {
          // Backup slug in case of encoding conversion
          const catAdsRes = await axios.get(`${WP_API_URL}/wp/v2/categories?slug=cat-ads&_cb=${Date.now()}`);
          if (catAdsRes.data && catAdsRes.data.length > 0) {
            categoryId = catAdsRes.data[0].id;
          }
        }
      } catch (e) {
        console.warn("Failed resolving advertisements category, using general query fallback");
      }

      if (categoryId) {
        const response = await axios.get(`${WP_API_URL}/wp/v2/posts?categories=${categoryId}&_embed=true&_cb=${Date.now()}&per_page=12`, { timeout: 8000 });
        if (response.data && response.data.length > 0) {
          return response.data.map(post => {
            const featuredImage = getFeaturedImage(post);
            const targetUrl = stripHtml(post.excerpt?.rendered || post.content?.rendered || 'https://newspaper.keshav-enterprises.co.in/');
            const cleanUrl = targetUrl.replace(/<[^>]*>/g, '').trim();
            
            const terms = post._embedded?.['wp:term']?.[1] || [];
            let placement = 'left';
            if (terms.some(t => t.slug === 'right' || t.name === 'right')) {
              placement = 'right';
            } else if (terms.some(t => t.slug === 'header' || t.name === 'header')) {
              placement = 'header';
            } else if (terms.some(t => t.slug === 'footer' || t.name === 'footer')) {
              placement = 'footer';
            } else {
              placement = post.id % 2 === 0 ? 'left' : 'right';
            }

            return {
              id: post.id,
              title: post.title?.rendered || 'विज्ञापन',
              image_url: featuredImage,
              target_url: cleanUrl,
              placement: placement,
              is_active: true
            };
          });
        }
      }
    } catch (error) {
      console.warn('Failed loading advertisements from WordPress, using Unsplash defaults:', error.message);
    }

    // Default premium fallbacks
    return [
      {
        id: 501,
        title: 'प्रभात खबर सब्सक्रिप्शन महाधमाका',
        image_url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=300&h=600&q=80',
        target_url: 'https://newspaper.keshav-enterprises.co.in/',
        placement: 'left',
        is_active: true
      },
      {
        id: 502,
        title: 'Keshav Enterprises डिजिटल सर्विसेज',
        image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&h=600&q=80',
        target_url: 'https://keshav-enterprises.co.in/',
        placement: 'right',
        is_active: true
      },
      {
        id: 503,
        title: 'हेडर बैनर विज्ञापन',
        image_url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=728&h=90&q=80',
        target_url: 'https://newspaper.keshav-enterprises.co.in/',
        placement: 'header',
        is_active: true
      }
    ];
  }
};

export default wpService;
