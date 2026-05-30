import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import wpService from '../services/wpService';
import BreakingTicker from '../components/news/BreakingTicker';
import NewsCard from '../components/news/NewsCard';
import ShortsWidget from '../components/widgets/ShortsWidget';
import SidebarWeatherWidget from '../components/widgets/SidebarWeatherWidget';
import HoroscopeWidget from '../components/widgets/HoroscopeWidget';
import CalculatorsWidget from '../components/widgets/CalculatorsWidget';
import PollWidget from '../components/widgets/PollWidget';
import NewsSnapWidget from '../components/widgets/NewsSnapWidget';
import CityNewsFilter from '../components/widgets/CityNewsFilter';
import EmotionNewsletterWidget from '../components/widgets/EmotionNewsletterWidget';
import SEO from '../components/common/SEO';
import './Home.css';

const politicalEyeShowVideos = [
  {
    id: 'pev1',
    title: 'क्या EVM सच में हैक हो सकती है? पूरा राजनीतिक विश्लेषण - Political Eye',
    youtube_id: '8v9GqEszZ-E',
    thumbnail: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80',
    views: '480K views',
    duration: '10:45'
  },
  {
    id: 'pev2',
    title: 'कांग्रेस की नई रणनीति: क्या Rahul Gandhi बनेंगे 2029 के चेहरे? विशेष रिपोर्ट',
    youtube_id: 't-e5K0wQ-tE',
    thumbnail: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80',
    views: '1.2M views',
    duration: '14:20'
  },
  {
    id: 'pev3',
    title: 'बजट 2026: क्या आपका टैक्स घटेगा या बढ़ेगा? सरल शब्दों में समझें',
    youtube_id: 'mU_G2_K7yQY',
    thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
    views: '850K views',
    duration: '08:35'
  },
  {
    id: 'pev4',
    title: 'बिहार और झारखंड की राजनीति में बड़ा भूचाल! जानिए अंदर की खबर',
    youtube_id: 'xJ8D_9o2L9E',
    thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&q=80',
    views: '3.4M views',
    duration: '11:15'
  }
];

const fallbackPremiumNews = [
  {
    id: 'p1',
    title: 'बिहार में जल संकट: क्या इस बार मानसून बचा पाएगा पटना को सूखने से?',
    slug: 'bihar-water-crisis-monsoon-patna',
    category: 'Opinion'
  },
  {
    id: 'p2',
    title: 'चुनावी समीकरण और सोशल मीडिया का असर: कितना बदला भारतीय राजनीति का चेहरा?',
    slug: 'election-equations-social-media-indian-politics',
    category: 'Analysis'
  },
  {
    id: 'p3',
    title: 'आर्थिक विकास की हकीकत: जमीनी स्तर पर कितनी मजबूत है देश की जीडीपी ग्रोथ?',
    slug: 'economic-growth-reality-gdp-india',
    category: 'Editorial'
  },
  {
    id: 'p4',
    title: 'अध्यात्म और विज्ञान: जब प्राचीन वैदिक परंपराओं से मिले आधुनिक वैज्ञानिक तथ्य',
    slug: 'spirituality-science-ancient-vedic-traditions',
    category: 'Religion & Science'
  }
];

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [seoData, setSeoData] = useState(null);
  const videoScrollContainerRef = useRef(null);
  const [videosScrollable, setVideosScrollable] = useState(false);

  const scrollVideos = (direction) => {
    if (videoScrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      videoScrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const [selectedCategory, setSelectedCategory] = useState(null);

  // Section states
  const [breakingNews, setBreakingNews] = useState([]);
  const [heroArticle, setHeroArticle] = useState(null);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [regularArticles, setRegularArticles] = useState([]);

  // Regional news
  const [biharNews, setBiharNews] = useState([]);
  const [jharkhandNews, setJharkhandNews] = useState([]);
  
  // National & World
  const [nationalNews, setNationalNews] = useState([]);
  const [internationalNews, setInternationalNews] = useState([]);
  
  // Other specialized streams
  const [entertainmentNews, setEntertainmentNews] = useState([]);
  const [religionNews, setReligionNews] = useState([]);
  const [sportsNews, setSportsNews] = useState([]);
  const [careerNews, setCareerNews] = useState([]);
  const [lifestyleNews, setLifestyleNews] = useState([]);
  const [videoNews, setVideoNews] = useState([]);
  
  // Additional requested categories (will use mock data if API fails or returns empty)
  const [techNews, setTechNews] = useState([]);
  const [autoNews, setAutoNews] = useState([]);
  const [businessNews, setBusinessNews] = useState([]);
  const [astrologyNews, setAstrologyNews] = useState([]);
  const [premiumNews, setPremiumNews] = useState([]);
  const [govtSchemes, setGovtSchemes] = useState([]);

  const [shortsData, setShortsData] = useState([]);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [newsSnapData, setNewsSnapData] = useState([]);
  const [ads, setAds] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState(null);

  useEffect(() => {
    wpService.getCategories()
      .then(data => setCategories(data))
      .catch(err => { /* Silent fallback */ });

    // Fetch homepage SEO via Yoast SEO REST API
    wpService.getSeoByUrl('https://backend.politicaleye.in/')
      .then(seo => {
        if (seo && seo.json) {
          setSeoData(seo.json);
        }
      })
      .catch(() => {});
      
    // Fetch ads
    const cachedAds = sessionStorage.getItem('news_ads');
    if (cachedAds) setAds(JSON.parse(cachedAds));
    wpService.getAdvertisements()
      .then(data => {
        setAds(data);
        sessionStorage.setItem('news_ads', JSON.stringify(data));
      })
      .catch(err => { /* Silent fallback */ });

    // Fetch live YouTube videos & shorts
    wpService.getYoutubeData()
      .then(data => {
        if (data.shorts && data.shorts.length > 0) {
          setShortsData(data.shorts);
        }
        if (data.videos && data.videos.length > 0) {
          setYoutubeVideos(data.videos);
        }
      })
      .catch(err => { /* Silent fallback */ });
  }, []);

  useEffect(() => {
    // If a category is selected in the header, we show only that category view
    if (selectedCategory) return;

    let mounted = true;
    setError(null);

    // Fetch main news streams in parallel, updating state individually the millisecond they resolve
    wpService.getPosts({ perPage: 15 }).then(res => {
      if (!mounted || !res.data) return;
      const all = res.data;
      setBreakingNews(all.filter(p => p.is_breaking));
      setHeroArticle(all.find(p => p.is_sticky) || all[0] || null);
      setTrendingArticles(all.filter(p => p.is_trending));
      setRegularArticles(all.filter(p => p.id !== (all.find(p => p.is_sticky) || all[0])?.id));
    }).catch(err => {
      if (mounted) setError('मुख्य खबरें लोड करने में त्रुटि हुई।');
    });

    wpService.getPosts({ categorySlug: 'bihar', perPage: 4 }).then(res => {
      if (mounted) setBiharNews(res.data || []);
    }).catch(() => {});

    wpService.getPosts({ categorySlug: 'jharkhand', perPage: 4 }).then(res => {
      if (mounted) setJharkhandNews(res.data || []);
    }).catch(() => {});

    wpService.getPosts({ categorySlug: 'national', perPage: 4 }).then(res => {
      if (mounted) setNationalNews(res.data || []);
    }).catch(() => {});

    wpService.getPosts({ categorySlug: 'international', perPage: 4 }).then(res => {
      if (mounted) setInternationalNews(res.data || []);
    }).catch(() => {});

    wpService.getPosts({ categorySlug: 'entertainment', perPage: 4 }).then(res => {
      if (mounted) setEntertainmentNews(res.data || []);
    }).catch(() => {});

    wpService.getPosts({ categorySlug: 'religion', perPage: 4 }).then(res => {
      if (mounted) setReligionNews(res.data || []);
    }).catch(() => {});

    wpService.getPosts({ categorySlug: 'sports', perPage: 4 }).then(res => {
      if (mounted) setSportsNews(res.data || []);
    }).catch(() => {});

    wpService.getPosts({ categorySlug: 'career', perPage: 4 }).then(res => {
      if (mounted) setCareerNews(res.data || []);
    }).catch(() => {});

    wpService.getPosts({ categorySlug: 'lifestyle', perPage: 4 }).then(res => {
      if (mounted) setLifestyleNews(res.data || []);
    }).catch(() => {});

    wpService.getPosts({ categorySlug: 'video', perPage: 4 }).then(res => {
      if (mounted) setVideoNews(res.data || []);
    }).catch(() => {});

    wpService.getPosts({ categorySlug: 'technology', perPage: 4 }).then(res => {
      if (mounted) setTechNews(res.data || []);
    }).catch(() => {});

    wpService.getPosts({ categorySlug: 'automobile', perPage: 4 }).then(res => {
      if (mounted) setAutoNews(res.data || []);
    }).catch(() => {});

    wpService.getPosts({ categorySlug: 'business', perPage: 4 }).then(res => {
      if (mounted) setBusinessNews(res.data || []);
    }).catch(() => {});

    wpService.getPosts({ categorySlug: 'astrology', perPage: 4 }).then(res => {
      if (mounted) setAstrologyNews(res.data || []);
    }).catch(() => {});

    wpService.getPosts({ categorySlug: 'premium', perPage: 4 }).then(res => {
      if (mounted) setPremiumNews(res.data || []);
    }).catch(() => {});

    wpService.getPosts({ categorySlug: 'schemes', perPage: 4 }).then(res => {
      if (mounted) setGovtSchemes(res.data || []);
    }).catch(() => {});

    wpService.getShorts({ perPage: 6 }).then(res => {
      if (mounted) setShortsData(prev => prev && prev.length > 0 ? prev : (res || []));
    }).catch(() => {});

    wpService.getPosts({ tagSlug: 'news-snap', perPage: 3 }).then(res => {
      if (mounted) setNewsSnapData(res.data || []);
    }).catch(() => {});

    return () => { mounted = false; };
  }, [selectedCategory]);

  // When a category is selected, fetch only that category posts
  const [categoryNews, setCategoryNews] = useState([]);
  useEffect(() => {
    if (!selectedCategory) return;
    setLoading(true);
    setError(null);
    wpService.getPosts({ categorySlug: selectedCategory, perPage: 12 })
      .then(res => setCategoryNews(res.data || []))
      .catch(err => {
        // Silent fallback
        setError('इस श्रेणी की खबरें लोड करने में असमर्थ।');
      })
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const displayVideos = youtubeVideos && youtubeVideos.length > 0 
    ? youtubeVideos 
    : (videoNews && videoNews.length > 0 
        ? videoNews.map(item => ({
            id: item.id,
            title: item.title,
            youtube_id: item.acf?.youtube_id || item.acf?.youtube_video_id || '8v9GqEszZ-E',
            thumbnail: item.featured_image || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80',
            views: item.views ? item.views.toLocaleString() + ' views' : '350K views',
            duration: item.acf?.duration || '12:00'
          }))
        : []);

  const getFallbackArticles = (list, startIndex, count) => {
    if (!list || list.length === 0) return [];
    const slice = list.slice(startIndex, startIndex + count);
    return slice.length > 0 ? slice : list.slice(0, count);
  };

  const displayTechNews = techNews && techNews.length > 0 
    ? techNews 
    : getFallbackArticles(regularArticles, 0, 3);

  const displayAutoNews = autoNews && autoNews.length > 0 
    ? autoNews 
    : getFallbackArticles(regularArticles, 1, 3);

  const displayNewsSnap = newsSnapData && newsSnapData.length > 0 
    ? newsSnapData 
    : getFallbackArticles(regularArticles, 2, 3);

  const displayNationalNews = nationalNews && nationalNews.length > 0 
    ? nationalNews 
    : getFallbackArticles(regularArticles, 3, 3);

  const checkVideosScrollable = () => {
    if (videoScrollContainerRef.current) {
      const { scrollWidth, clientWidth } = videoScrollContainerRef.current;
      setVideosScrollable(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkVideosScrollable();
    const timer = setTimeout(checkVideosScrollable, 250);
    window.addEventListener('resize', checkVideosScrollable);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkVideosScrollable);
    };
  }, [displayVideos]);

  return (
    <div className="home-page">
      <SEO 
        yoastHeadJson={seoData} 
        title="Political Eye - सच के साथ निडर" 
        description="Political Eye brings you the latest political analysis, news reports, local insights and international briefings from across India."
      />
      {breakingNews.length > 0 && <BreakingTicker news={breakingNews} />}

      <div className="container home-page__layout">
        {error ? (
          <div className="error-message">{error}</div>
        ) : selectedCategory ? (
          loading ? (
            <div className="skeleton-grid">
              <div className="skeleton-card skeleton-card--hero"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </div>
          ) : (
            <div className="category-view">
              <h2 className="section-title">{categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}</h2>
              <div className="articles-grid">
                {categoryNews.map(article => (
                  <NewsCard key={article.id} article={article} variant="standard" />
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="homepage-sections">
            {/* Hero Ad Banner */}
            {(() => {
              const heroAd = ads.find(ad => {
                const placements = Array.isArray(ad.placement) ? ad.placement : [ad.placement];
                return placements.includes("Hero Banner (Home Page Middle)");
              });
              return heroAd && (heroAd.image || heroAd.image_url) && (
                <div className="middle-ad" style={{ marginTop: 0 }}>
                  <a href={heroAd.targetUrl || heroAd.target_url || "#"} target="_blank" rel="noopener noreferrer">
                    <img src={heroAd.image || heroAd.image_url} alt="Advertisement" className="middle-ad__img" style={{ width: '100%', maxWidth: '970px', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }} />
                  </a>
                </div>
              );
            })()}

            {/* Shorts Section - Always show, widget will handle fallback if empty */}
            <ShortsWidget shorts={shortsData} onPlay={setActiveVideoId} />

            {/* Main 3-Column Layout */}
            <div className="home-grid-layout">
              {/* Left Sidebar */}
              <aside className="home-sidebar-left">
                <SidebarWeatherWidget />
                
                <div className="premium-sidebar">
                  <h3 className="premium-sidebar__title">ताज़ा खबर</h3>
                  <div className="premium-sidebar__list">
                    {regularArticles.length === 0 ? (
                      [1, 2, 3, 4].map(n => (
                        <div key={n} style={{ height: '48px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '6px', marginBottom: '12px', animation: 'pulse 1.5s infinite' }}></div>
                      ))
                    ) : (
                      regularArticles.slice(0, 4).map(article => (
                        <div key={article.id} className="premium-item">
                          <h4 className="premium-item__title">
                            <Link to={`/news/${article.slug}`}>{article.title}</Link>
                          </h4>
                          <span className="premium-item__cat">{(article.category?.name || article.category || 'ताज़ा खबर') + ' >'}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </aside>

              {/* Main Center Column */}
              <main className="home-main-col">
                
                <div className="main-editorial">
                  {!heroArticle ? (
                    <div style={{ height: '365px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
                  ) : (
                    <NewsCard article={heroArticle} variant="hero" />
                  )}
                </div>

                {/* News Snap Block inside main column */}
                <div className="news-snap-wrapper">
                  {displayNewsSnap.length === 0 ? (
                    <div style={{ height: '240px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
                  ) : (
                    <NewsSnapWidget articles={displayNewsSnap} />
                  )}
                  <div className="snap-side-news">
                    {displayNationalNews.length === 0 ? (
                      [1, 2, 3].map(n => (
                        <div key={n} style={{ height: '76px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '6px', marginBottom: '10px', animation: 'pulse 1.5s infinite' }}></div>
                      ))
                    ) : (
                      displayNationalNews.slice(0, 3).map(article => (
                        <NewsCard key={article.id} article={article} variant="standard" />
                      ))
                    )}
                  </div>
                </div>
              </main>

              {/* Right Sidebar */}
              <aside className="home-sidebar-right">
                {ads.filter(ad => {
                  const placements = Array.isArray(ad.placement) ? ad.placement : [ad.placement];
                  return placements.includes("Right Sidebar (Home & Article Pages)");
                }).map(ad => (ad.image || ad.image_url) && (
                  <div key={ad.id} className="right-ad-block" style={{ marginBottom: '2rem' }}>
                    <a href={ad.targetUrl || ad.target_url || "#"} target="_blank" rel="noopener noreferrer">
                      <img src={ad.image || ad.image_url} alt={ad.title} style={{ width: '100%', borderRadius: '8px' }} />
                    </a>
                  </div>
                ))}

                <PollWidget />


                {/* Premium Emotion CSS-in-JS Styled Newsletter Widget */}
                <EmotionNewsletterWidget />
              </aside>
            </div>

            {/* Tech Section (Split and rendered as a full-width row grid) */}
            <section className="news-section" style={{ marginBottom: '2rem' }}>
              <div className="section-header">
                <h2 className="section-header__title">टेक</h2>
              </div>
              <div className="tech-auto-grid">
                {displayTechNews.length === 0 ? (
                  [1, 2, 3].map(n => (
                    <div key={n} style={{ height: '280px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
                  ))
                ) : (
                  displayTechNews.slice(0, 3).map(article => (
                    <NewsCard key={article.id} article={article} variant="standard" />
                  ))
                )}
              </div>
            </section>

            {/* Auto Section (Split and rendered as a full-width row grid) */}
            <section className="news-section" style={{ marginBottom: '2rem' }}>
              <div className="section-header">
                <h2 className="section-header__title">ऑटो</h2>
              </div>
              <div className="tech-auto-grid">
                {displayAutoNews.length === 0 ? (
                  [1, 2, 3].map(n => (
                    <div key={n} style={{ height: '280px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
                  ))
                ) : (
                  displayAutoNews.slice(0, 3).map(article => (
                    <NewsCard key={article.id} article={article} variant="standard" />
                  ))
                )}
              </div>
            </section>

            {/* Political Eye YouTube Video Show Section */}
            <section className="video-section-dark">
              <div className="container">
                <div className="section-header section-header--dark">
                  <h2 className="section-header__title" style={{ fontSize: '1.8rem' }}>
                    Political Eye <span style={{ color: '#f97316' }}>वीडियो शो</span>
                  </h2>
                  <a 
                    href="https://www.youtube.com/@PoliticalEyeIndia/videos" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="section-header__link-btn"
                    style={{ color: '#f97316', fontWeight: 'bold', fontSize: '0.95rem', textDecoration: 'none' }}
                  >
                    YouTube चैनल पर जाएं &gt;
                  </a>
                </div>
                
                <div className="video-carousel-wrapper" style={{ position: 'relative' }}>
                  {videosScrollable && (
                    <button 
                      className="carousel-nav-btn left dark" 
                      onClick={() => scrollVideos('left')}
                      aria-label="Scroll Left"
                    >
                      <ChevronLeft size={24} />
                    </button>
                  )}
                  
                  <div className="video-grid" ref={videoScrollContainerRef}>
                    {displayVideos.length === 0 ? (
                      [1, 2, 3, 4].map(n => (
                        <div key={n} className="video-card skeleton" style={{ minWidth: '280px', height: '220px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
                      ))
                    ) : (
                      displayVideos.map(video => (
                        <div 
                          key={video.id} 
                          className="video-card" 
                          onClick={() => setActiveVideoId(video.youtube_id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="video-card__thumbnail">
                            <img src={video.thumbnail} alt={video.title} />
                            <span className="video-card__duration" style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{video.duration}</span>
                            <div className="video-card__play-btn">
                              <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="video-card__info" style={{ padding: '12px 0 0 0' }}>
                            <h4 className="video-card__title" style={{ fontSize: '1.05rem', color: '#ffffff', lineHeight: '1.45', margin: '0 0 6px 0', fontWeight: '600' }}>
                              {video.title}
                            </h4>
                            <span className="video-card__views" style={{ fontSize: '0.825rem', color: '#a3a3a3' }}>
                              {video.views}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {videosScrollable && (
                    <button 
                      className="carousel-nav-btn right dark" 
                      onClick={() => scrollVideos('right')}
                      aria-label="Scroll Right"
                    >
                      <ChevronRight size={24} />
                    </button>
                  )}
                </div>
              </div>
            </section>

            <CityNewsFilter />

            {/* Additional bottom sections grids */}
            <div className="bottom-sections-grid">
              {businessNews.length > 0 && (
                <section className="news-section" style={{ padding: '20px' }}>
                  <div className="section-header"><h2 className="section-header__title">बिज़नेस</h2></div>
                  <div className="news-section__grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {businessNews.slice(0, 4).map(article => <NewsCard key={article.id} article={article} variant="standard" />)}
                  </div>
                </section>
              )}
              {govtSchemes.length > 0 && (
                <section className="news-section" style={{ padding: '20px' }}>
                  <div className="section-header"><h2 className="section-header__title">महत्त्वपूर्ण सरकारी योजनाएँ</h2></div>
                  <div className="news-section__grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {govtSchemes.slice(0, 4).map(article => <NewsCard key={article.id} article={article} variant="standard" />)}
                  </div>
                </section>
              )}
            </div>

          </div>
        )}
      </div>
      
      {/* Premium Video Player Modal Overlay */}
      {activeVideoId && (
        <div 
          className="video-modal-overlay" 
          onClick={() => setActiveVideoId(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
            backdropFilter: 'blur(8px)',
            transition: 'opacity 0.3s ease'
          }}
        >
          <div 
            className="video-modal-content" 
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '900px',
              backgroundColor: '#000',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <button 
              className="video-modal-close" 
              onClick={() => setActiveVideoId(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                transition: 'background-color 0.2s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.8)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
            >
              &times;
            </button>
            <div 
              className="video-modal-iframe-wrapper"
              style={{
                position: 'relative',
                paddingBottom: '56.25%', /* 16:9 Aspect Ratio */
                height: 0,
                overflow: 'hidden'
              }}
            >
              <iframe 
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`} 
                title="YouTube Video Player"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
