import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import wpService from '../services/wpService';
import { Sun, Moon, Mail, MapPin, Phone, Award, Menu, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import WeatherWidget from '../components/weather/WeatherWidget';
import './MainLayout.css';

const MainLayout = () => {
  const [categories, setCategories] = useState([]);
  const [ads, setAds] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  
  const scrollContainerRef = useRef(null);

  const scrollMenu = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    // Attempt to load from session cache first for instant load speed
    const cachedCats = sessionStorage.getItem('news_categories');
    const cachedAds = sessionStorage.getItem('news_ads');
    if (cachedCats) setCategories(JSON.parse(cachedCats));
    if (cachedAds) setAds(JSON.parse(cachedAds));

    // Background fetch to keep content fresh without stalling the UI
    wpService.getCategories()
      .then(data => {
        setCategories(data);
        sessionStorage.setItem('news_categories', JSON.stringify(data));
      })
      .catch(err => console.error("Error fetching categories:", err));

    // Fetch advertisements
    wpService.getAdvertisements()
      .then(adsData => {
        setAds(adsData);
        sessionStorage.setItem('news_ads', JSON.stringify(adsData));
      })
      .catch(err => console.error("Error fetching ads:", err));
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const getHindiDate = () => {
    const days = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const months = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
    const d = new Date();
    return `${days[d.getDay()]} | ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    }
  };

  const headerAd = ads.find(ad => ad.placement === 'header' && ad.is_active);
  const footerAd = ads.find(ad => ad.placement === 'footer' && ad.is_active);

  // Check if current route is admin panel
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <Outlet />;
  }

  // Filter categories to only keep active ones, excluding home and default uncategorized
  const navCategories = categories.filter(c => 
    c.slug !== 'home' && 
    c.slug !== 'uncategorized' && 
    c.slug !== 'uncategorised'
  );

  return (
    <div className="app-container">
      {/* Top Utility Bar */}
      <div className="top-bar">
        <div className="container top-bar__container">
          <div className="top-bar__left">
            <span className="top-bar__date">{getHindiDate()}</span>
            <span className="top-bar__sep">|</span>
            <WeatherWidget />
          </div>
          <div className="top-bar__links">
            <Link to="/">ई-पेपर</Link>
            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn" 
              aria-label="Toggle Theme"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {theme === 'light' ? (
                <>
                  <Moon size={13} />
                  <span>डार्क मोड</span>
                </>
              ) : (
                <>
                  <Sun size={13} />
                  <span>लाइट मोड</span>
                </>
              )}
            </button>
            <Link to="/admin">एडमिन लॉगिन</Link>
          </div>
        </div>
      </div>

      {/* Main Header / Logo Section */}
      <header className="main-header" style={{ position: 'relative', zIndex: 99 }}>
        <div className="container main-header__container">
          
          <div className="header-left-actions">
            {/* Hamburger Icon for Mobile/Desktop Sidebar */}
            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Menu"
            >
              <Menu size={28} />
            </button>
          </div>
          
          <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img 
              src="https://newspaper.keshav-enterprises.co.in/wp-content/uploads/2026/05/Untitled-design-4.jpg.jpeg" 
              alt="Logo" 
              className="logo-img" 
              style={{ maxHeight: '90px', width: 'auto' }} 
            />
          </div>
          
          {/* Dynamic Header Ad Banner Space */}
          <div className="header-ad">
            {headerAd ? (
              <a href={headerAd.target_url} target="_blank" rel="noopener noreferrer">
                <img src={headerAd.image_url} alt={headerAd.title} className="header-ad__img" />
              </a>
            ) : (
              <a href="#" target="_blank" rel="noopener noreferrer">
                <img src="https://newspaper.keshav-enterprises.co.in/wp-content/uploads/2026/05/ChatGPT-Image-May-21-2026-03_40_37-PM-e1779358275697.png" alt="Advertisement" className="header-ad__img" />
              </a>
            )}
          </div>

          {/* Spacer for perfect mobile symmetry */}
          <div className="header-right-spacer"></div>

        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} 
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Sidebar Drawer Menu */}
      <div className={`nav-sidebar-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="nav-sidebar-header">
          <span className="nav-sidebar-title">मेनू</span>
          <button 
            className="close-menu-btn" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Search Bar inside Drawer */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <form
            className="mobile-search-input-wrapper"
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                setSearchQuery('');
                setIsMobileMenuOpen(false);
              }
            }}
          >
            <input
              type="search"
              placeholder="खबर खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search news"
              className="mobile-search-input"
            />
            <button className="mobile-search-btn" type="submit">खोजें</button>
          </form>
        </div>

        <ul className="nav-menu__list mobile-list">
          <li className="nav-menu__item">
            <Link to="/" className={`nav-menu__link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>होम</Link>
          </li>
          {navCategories.map(cat => (
            <li key={cat.id} className="nav-menu__item">
              <Link 
                to={`/category/${cat.slug}`} 
                className={`nav-menu__link ${location.pathname === `/category/${cat.slug}` ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* End Sidebar Drawer Menu */}
      
      {/* Sticky Navigation Menu with Search Modal Toggle (Desktop Only) */}
      <nav className="nav-menu desktop-nav" style={{ position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow-md)' }}>
        <div className="container nav-menu__container">
          
          <div className="nav-scroll-wrapper">
            <button className="nav-scroll-btn left-btn" onClick={() => scrollMenu('left')} aria-label="Scroll Left">
              <ChevronLeft size={20} />
            </button>
            
            <ul className="nav-menu__list" ref={scrollContainerRef}>
              <li className="nav-menu__item">
                <Link to="/" className={`nav-menu__link ${location.pathname === '/' ? 'active' : ''}`}>होम</Link>
              </li>
              {navCategories.map(cat => (
                <li key={cat.id} className="nav-menu__item">
                  <Link 
                    to={`/category/${cat.slug}`} 
                    className={`nav-menu__link ${location.pathname === `/category/${cat.slug}` ? 'active' : ''}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>

            <button className="nav-scroll-btn right-btn" onClick={() => scrollMenu('right')} aria-label="Scroll Right">
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="desktop-search-wrapper">
            <button 
              className="desktop-search-toggle"
              onClick={() => setIsDesktopSearchOpen(true)}
              aria-label="Open Search Modal"
            >
              <Search size={22} />
            </button>
          </div>
        </div>
      </nav>
      
      {/* Centered Search Modal Overlay */}
      <div className={`search-modal-overlay ${isDesktopSearchOpen ? 'open' : ''}`}>
        <div className="search-modal-backdrop" onClick={() => setIsDesktopSearchOpen(false)}></div>
        <div className="search-modal-container">
          <button className="search-modal-close" onClick={() => setIsDesktopSearchOpen(false)}>
            <X size={32} />
          </button>
          
          <div className="search-modal-content">
            <h2 className="search-modal-title">क्या खोज रहे हैं?</h2>
            <form
              className="search-modal-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery('');
                  setIsDesktopSearchOpen(false);
                }
              }}
            >
              <div className="search-modal-input-wrapper">
                <Search className="search-modal-icon" size={24} />
                <input
                  type="search"
                  placeholder="खबरें, शहर या टॉपिक खोजें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-modal-input"
                />
                <button type="submit" className="search-modal-submit">खोजें</button>
              </div>
            </form>
            
            <div className="search-modal-recommendations">
              <h3>ट्रेंडिंग खोजें</h3>
              <div className="search-modal-tags">
                <button onClick={() => { navigate('/search?q=चुनाव'); setIsDesktopSearchOpen(false); }}>#चुनाव_2026</button>
                <button onClick={() => { navigate('/search?q=मौसम'); setIsDesktopSearchOpen(false); }}>#मौसम_अलर्ट</button>
                <button onClick={() => { navigate('/search?q=बिहार'); setIsDesktopSearchOpen(false); }}>#बिहार_योजना</button>
                <button onClick={() => { navigate('/search?q=क्रिकेट'); setIsDesktopSearchOpen(false); }}>#क्रिकेट_कप</button>
                <button onClick={() => { navigate('/search?q=टेक्नोलॉजी'); setIsDesktopSearchOpen(false); }}>#टेक्नोलॉजी</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="main-content">
        <Outlet />
      </main>

      {/* Dynamic Footer Banner */}
      <div className="container footer-ad-wrapper">
        {footerAd ? (
          <a href={footerAd.target_url} target="_blank" rel="noopener noreferrer">
            <img src={footerAd.image_url} alt={footerAd.title} className="footer-ad__img" />
          </a>
        ) : (
          <a href="#" target="_blank" rel="noopener noreferrer">
            <img src="https://newspaper.keshav-enterprises.co.in/wp-content/uploads/2026/05/ChatGPT-Image-May-21-2026-03_40_37-PM-e1779358275697.png" alt="Advertisement" className="footer-ad__img" />
          </a>
        )}
      </div>

      {/* Premium Content-Rich Footer */}
      <footer className="main-footer">
        <div className="container footer-container">
          {/* Brand & Social Column */}
          <div className="footer-column footer-brand-column">
            <div className="footer-brand-header">
              <h2>प्रभात खबर</h2>
              <span className="footer-tagline">आम लोगों का भरोसा</span>
            </div>
            <p className="footer-brand-desc">
              बिहार, झारखंड और देश-विदेश की तमाम ताज़ा ख़बरों के लिए आपका सबसे भरोसेमंद डिजिटल न्यूज़ पोर्टल। निष्पक्षता और गुणवत्तापूर्ण पत्रकारिता के साथ हर पल अपडेट।
            </p>
            <div className="footer-social-cluster">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon facebook" aria-label="Facebook">
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon twitter" aria-label="Twitter">
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon youtube" aria-label="YouTube">
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon instagram" aria-label="Instagram">
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="social-icon telegram" aria-label="Telegram">
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-column">
            <h4>मुख्य श्रेणियां</h4>
            <ul className="footer-links-list">
              <li><Link to="/category/bihar">बिहार समाचार</Link></li>
              <li><Link to="/category/jharkhand">झारखंड समाचार</Link></li>
              <li><Link to="/category/national">देश विदेश</Link></li>
              <li><Link to="/category/sports">खेल जगत</Link></li>
              <li><Link to="/category/entertainment">मनोरंजन</Link></li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="footer-column">
            <h4>संपर्क सूत्र</h4>
            <ul className="footer-contact-list">
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={16} className="contact-icon" style={{ marginTop: '3px' }} />
                <span>प्रभात प्रकाशन समूह, न्यू इंडस्ट्रियल एरिया, पटना, बिहार - 800001</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} className="contact-icon" />
                <span>+91 612 245 9830</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} className="contact-icon" />
                <span>contact@prabhatkhabar.com</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} className="contact-icon" />
                <span>सर्टिफाइड ट्रस्टवर्दी जर्नलिज्म</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Form Column */}
          <div className="footer-column footer-newsletter-column">
            <h4>न्यूज़लेटर सब्सक्राइब करें</h4>
            <p className="newsletter-desc">रोजाना सुबह की ताज़ा खबरें सीधे अपने इनबॉक्स में पाने के लिए हमारा न्यूज़लेटर सब्सक्राइब करें।</p>
            {newsletterSubscribed ? (
              <div className="newsletter-success">
                धन्यवाद! आप सफलतापूर्वक पंजीकृत हो गए हैं।
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                <input 
                  type="email" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="अपना ईमेल दर्ज करें" 
                  required 
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-submit">जुड़ें</button>
              </form>
            )}
            
            <div className="footer-app-badges">
              <span className="app-badges-title">हमारा ऐप डाउनलोड करें</span>
              <div className="app-buttons">
                <a href="#" className="app-btn-google">Play Store</a>
                <a href="#" className="app-btn-apple">App Store</a>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Tag Cloud Footer Block */}
        <div className="container footer-tags-row">
          <span className="tags-label">ट्रेंडिंग टॉपिक्स:</span>
          <div className="tags-cloud">
            <Link to="/search?q=मौसम" className="tag-pill">#मौसम_अलर्ट</Link>
            <Link to="/search?q=बिहार" className="tag-pill">#बिहार_योजना</Link>
            <Link to="/search?q=झारखंड" className="tag-pill">#झारखंड_खेल</Link>
            <Link to="/search?q=UPSC" className="tag-pill">#यूपीएससी_परीक्षा</Link>
            <Link to="/search?q=क्रिकेट" className="tag-pill">#क्रिकेट_कप</Link>
            <Link to="/search?q=सावन" className="tag-pill">#सावन_मेला</Link>
            <Link to="/search?q=राजगीर" className="tag-pill">#राजगीर_सफारी</Link>
          </div>
        </div>

        {/* Bottom copyright details */}
        <div className="footer-bottom">
          <div className="container footer-bottom__container">
            <p>&copy; {new Date().getFullYear()} प्रभात खबर. सर्वाधिकार सुरक्षित। आम लोगों का भरोसा।</p>
            <div className="footer-bottom-links">
              <Link to="/privacy">गोपनीयता नीति</Link>
              <span>•</span>
              <Link to="/contact">नियम और शर्तें</Link>
              <span>•</span>
              <Link to="/admin">CMS डैशबोर्ड</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
