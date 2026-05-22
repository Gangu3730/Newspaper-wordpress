import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const Home = () => {
  const [categories, setCategories] = useState([]);
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
  const [newsSnapData, setNewsSnapData] = useState([]);
  const [ads, setAds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState(null);

  useEffect(() => {
    wpService.getCategories()
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));
      
    // Fetch ads
    const cachedAds = sessionStorage.getItem('news_ads');
    if (cachedAds) setAds(JSON.parse(cachedAds));
    wpService.getAdvertisements()
      .then(data => {
        setAds(data);
        sessionStorage.setItem('news_ads', JSON.stringify(data));
      })
      .catch(err => console.error('Error fetching ads:', err));
  }, []);

  useEffect(() => {
    // If a category is selected in the header, we show only that category view
    if (selectedCategory) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    // Fetch main news streams in parallel
    const homePromise = wpService.getPosts({ perPage: 15 });
    const biharPromise = wpService.getPosts({ categorySlug: 'bihar', perPage: 4 });
    const jharkhandPromise = wpService.getPosts({ categorySlug: 'jharkhand', perPage: 4 });
    const nationalPromise = wpService.getPosts({ categorySlug: 'national', perPage: 4 });
    const internationalPromise = wpService.getPosts({ categorySlug: 'international', perPage: 4 });
    const entertainmentPromise = wpService.getPosts({ categorySlug: 'entertainment', perPage: 4 });
    const religionPromise = wpService.getPosts({ categorySlug: 'religion', perPage: 4 });
    const sportsPromise = wpService.getPosts({ categorySlug: 'sports', perPage: 4 });
    const careerPromise = wpService.getPosts({ categorySlug: 'career', perPage: 4 });
    const lifestylePromise = wpService.getPosts({ categorySlug: 'lifestyle', perPage: 4 });
    const videoPromise = wpService.getPosts({ categorySlug: 'video', perPage: 4 });
    const techPromise = wpService.getPosts({ categorySlug: 'technology', perPage: 4 });
    const autoPromise = wpService.getPosts({ categorySlug: 'automobile', perPage: 4 });
    const businessPromise = wpService.getPosts({ categorySlug: 'business', perPage: 4 });
    const astrologyPromise = wpService.getPosts({ categorySlug: 'astrology', perPage: 4 });
    const premiumPromise = wpService.getPosts({ categorySlug: 'premium', perPage: 4 });
    const schemesPromise = wpService.getPosts({ categorySlug: 'schemes', perPage: 4 });
    
    // New specific endpoints for widgets
    const shortsPromise = wpService.getShorts({ perPage: 6 });
    const newsSnapPromise = wpService.getPosts({ tagSlug: 'news-snap', perPage: 3 });

    Promise.allSettled([
      homePromise, biharPromise, jharkhandPromise, nationalPromise, 
      internationalPromise, entertainmentPromise, religionPromise, 
      sportsPromise, careerPromise, lifestylePromise, videoPromise,
      techPromise, autoPromise, businessPromise, astrologyPromise, premiumPromise, schemesPromise,
      shortsPromise, newsSnapPromise
    ])
      .then(results => {
        if (!mounted) return;

        const [
          homeRes, bRes, jhRes, natRes, intRes, eRes, rRes, spRes, carRes, lfRes, vRes,
          techRes, autoRes, busRes, astroRes, premRes, schemeRes,
          shortsRes, snapRes
        ] = results;

        if (homeRes.status === 'fulfilled') {
          const all = homeRes.value.data || [];
          setBreakingNews(all.filter(p => p.is_breaking));
          setHeroArticle(all.find(p => p.is_sticky) || all[0] || null);
          setTrendingArticles(all.filter(p => p.is_trending));
          setRegularArticles(all.filter(p => p.id !== (all.find(p => p.is_sticky) || all[0])?.id));
        } else {
          console.error('Failed to fetch main posts:', homeRes.reason);
          setError('मुख्य खबरें लोड करने में त्रुटि हुई।');
        }

        if (bRes.status === 'fulfilled') setBiharNews(bRes.value.data || []);
        if (jhRes.status === 'fulfilled') setJharkhandNews(jhRes.value.data || []);
        if (natRes.status === 'fulfilled') setNationalNews(natRes.value.data || []);
        if (intRes.status === 'fulfilled') setInternationalNews(intRes.value.data || []);
        if (eRes.status === 'fulfilled') setEntertainmentNews(eRes.value.data || []);
        if (rRes.status === 'fulfilled') setReligionNews(rRes.value.data || []);
        if (spRes.status === 'fulfilled') setSportsNews(spRes.value.data || []);
        if (carRes.status === 'fulfilled') setCareerNews(carRes.value.data || []);
        if (lfRes.status === 'fulfilled') setLifestyleNews(lfRes.value.data || []);
        if (vRes.status === 'fulfilled') setVideoNews(vRes.value.data || []);
        
        // Extended categories, fallback to generic home news if empty to simulate content
        const genericFallback = homeRes.status === 'fulfilled' ? homeRes.value.data || [] : [];
        if (techRes.status === 'fulfilled' && techRes.value.data?.length > 0) setTechNews(techRes.value.data); else setTechNews(genericFallback.slice(0, 4));
        if (autoRes.status === 'fulfilled' && autoRes.value.data?.length > 0) setAutoNews(autoRes.value.data); else setAutoNews(genericFallback.slice(1, 5));
        if (busRes.status === 'fulfilled' && busRes.value.data?.length > 0) setBusinessNews(busRes.value.data); else setBusinessNews(genericFallback.slice(2, 6));
        if (astroRes.status === 'fulfilled' && astroRes.value.data?.length > 0) setAstrologyNews(astroRes.value.data); else setAstrologyNews(genericFallback.slice(3, 7));
        if (premRes.status === 'fulfilled' && premRes.value.data?.length > 0) setPremiumNews(premRes.value.data); else setPremiumNews(genericFallback.slice(4, 8));
        if (schemeRes.status === 'fulfilled' && schemeRes.value.data?.length > 0) setGovtSchemes(schemeRes.value.data); else setGovtSchemes(genericFallback.slice(0, 4));

        // Widgets specific data
        if (shortsRes.status === 'fulfilled') setShortsData(shortsRes.value || []);
        if (snapRes.status === 'fulfilled') setNewsSnapData(snapRes.value.data || []);
      })
      .catch(err => {
        console.error('Error loading homepage sections:', err);
        setError('होमपेज लोड करने में त्रुटि हुई।');
      })
      .finally(() => mounted && setLoading(false));

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
        console.error('Error fetching category posts:', err);
        setError('इस श्रेणी की खबरें लोड करने में असमर्थ।');
      })
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const displayVideos = videoNews && videoNews.length > 0 
    ? videoNews.map(item => ({
        id: item.id,
        title: item.title,
        youtube_id: item.acf?.youtube_id || item.acf?.youtube_video_id || '8v9GqEszZ-E',
        thumbnail: item.featured_image || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80',
        views: item.views ? item.views.toLocaleString() + ' views' : '350K views',
        duration: item.acf?.duration || '12:00'
      }))
    : politicalEyeShowVideos;

  return (
    <div className="home-page">
      {breakingNews.length > 0 && <BreakingTicker news={breakingNews} />}

      <div className="container home-page__layout">
        {loading ? (
          <div className="skeleton-grid">
            <div className="skeleton-card skeleton-card--hero"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : selectedCategory ? (
          <div className="category-view">
            <h2 className="section-title">{categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}</h2>
            <div className="articles-grid">
              {categoryNews.map(article => (
                <NewsCard key={article.id} article={article} variant="standard" />
              ))}
            </div>
          </div>
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

            {/* Trending Links Bar */}
            <div className="trending-topics-bar">
              <span className="trending-label">Trends</span>
              <a href="#oneplus" className="trend-link">Oneplus</a>
              <a href="#drishyam" className="trend-link">Drishyam 3</a>
              <a href="#suvendu" className="trend-link">Suvendu Adhikari</a>
              <a href="#samrat" className="trend-link">Samrat Choudhary</a>
              <a href="#iran" className="trend-link">Iran War</a>
              <a href="#ipl" className="trend-link">IPL 2026</a>
            </div>

            {/* Shorts Section - Always show, widget will handle fallback if empty */}
            <ShortsWidget shorts={shortsData} onPlay={setActiveVideoId} />

            {/* Main 3-Column Layout */}
            <div className="home-grid-layout">
              {/* Left Sidebar */}
              <aside className="home-sidebar-left">
                <SidebarWeatherWidget />
                
                <div className="premium-sidebar">
                  <h3 className="premium-sidebar__title">प्रभात खबर प्रीमियम</h3>
                  <div className="premium-sidebar__list">
                    {premiumNews.slice(0, 3).map(article => (
                      <div key={article.id} className="premium-item">
                        <h4 className="premium-item__title">
                          <Link to={`/news/${article.slug}`}>{article.title}</Link>
                        </h4>
                        <span className="premium-item__cat">Opinion &gt;</span>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Main Center Column */}
              <main className="home-main-col">
                <div className="section-header">
                  <h2 className="section-header__title" style={{ color: '#ea580c', fontSize: '1.8rem' }}>Hindi News <span style={{ color: '#f97316' }}>(हिंदी न्यूज़)</span></h2>
                </div>
                
                <div className="main-editorial">
                  {heroArticle && <NewsCard article={heroArticle} variant="hero" />}
                </div>

                {/* News Snap Block inside main column */}
                {newsSnapData.length > 0 && (
                  <div className="news-snap-wrapper">
                    <NewsSnapWidget articles={newsSnapData} />
                    <div className="snap-side-news">
                      {nationalNews.slice(0, 3).map(article => (
                        <NewsCard key={article.id} article={article} variant="standard" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Grids */}
                <div className="editorial-split-grid">
                  <div className="split-column">
                    <div className="section-header"><h2 className="section-header__title">टेक</h2></div>
                    <div className="split-column__items">
                      {techNews.slice(0, 3).map(article => (
                        <div key={article.id} className="editorial-row-card">
                          <img src={article.featured_image} alt={article.title} className="row-card__img" />
                          <div className="row-card__body">
                            <h4 className="row-card__title"><Link to={`/news/${article.slug}`}>{article.title}</Link></h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="split-column">
                    <div className="section-header"><h2 className="section-header__title">ऑटो</h2></div>
                    <div className="split-column__items">
                      {autoNews.slice(0, 3).map(article => (
                        <div key={article.id} className="editorial-row-card">
                          <img src={article.featured_image} alt={article.title} className="row-card__img" />
                          <div className="row-card__body">
                            <h4 className="row-card__title"><Link to={`/news/${article.slug}`}>{article.title}</Link></h4>
                          </div>
                        </div>
                      ))}
                    </div>
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
              </aside>
            </div>

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
                <div className="video-grid">
                  {displayVideos.slice(0, 4).map(video => (
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
                        <h4 className="video-card__title" style={{ fontSize: '1rem', color: '#ffffff', lineHeight: '1.4', margin: '0 0 6px 0', fontWeight: '600' }}>
                          {video.title}
                        </h4>
                        <span className="video-card__views" style={{ fontSize: '0.8rem', color: '#a3a3a3' }}>
                          {video.views}
                        </span>
                      </div>
                    </div>
                  ))}
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
