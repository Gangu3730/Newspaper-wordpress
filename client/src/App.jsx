import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Category from './pages/Category';
import ArticleDetail from './pages/ArticleDetail';
import SearchResults from './pages/SearchResults';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public facing layout & pages */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="category/:slug" element={<Category />} />
          <Route path="news/:slug" element={<ArticleDetail />} />
          <Route path="search" element={<SearchResults />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
