import React, { useState, useEffect, useRef } from 'react';
import { FaShoppingCart, FaSearch, FaArrowLeft, FaHome } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import DOMPurify from 'dompurify';
import './Navbar.css';

const Navbar: React.FC<{ searchQuery: string; setSearchQuery: (query: string) => void }> = ({
  searchQuery,
  setSearchQuery,
}) => {
  const { t, i18n } = useTranslation();
  const { cart } = useCart();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const catalogRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: string) => {
    const allowedLanguages = ['ru', 'en', 'uz'];
    if (allowedLanguages.includes(lng)) {
      i18n.changeLanguage(lng);
    }
  };

  const recommendationCategories = [
    'forDiet', 'forMassGain', 'forEvening', 'forBreakfast', 'forLunch',
    'forDinner', 'forSnacks', 'forKids', 'forVegans', 'forAthletes',
    'forParties', 'forDesserts', 'forHealthy'
  ];

  const productTypes = [
    { name: "vegetables", type: "vegetables" },
    { name: "fruits", type: "fruits" },
    { name: "meat", type: "meat" },
    { name: "fish/seafood", type: "fish/seafood" },
    { name: "grains/cereals", type: "grains/cereals" },
    { name: "dairy", type: "dairy" },
    { name: "beverages", type: "beverages" },
    { name: "sweets/desserts", type: "sweets/desserts" },
    { name: "snacks", type: "snacks" },
    { name: "legumes", type: "legumes" },
    { name: "nuts/seeds", type: "nuts/seeds" },
    { name: "bakery", type: "bakery" },
    { name: "sauces/condiments", type: "sauces/condiments" },
    { name: "eggs", type: "eggs" },
    { name: "other", type: "other" },
  ];

  const sanitizeRoute = (route: string): string => {
    return route.replace(/[^a-zA-Z0-9-_]/g, '');
  };

  const handleCategoryClick = (category: string) => {
    const allowedCategories = recommendationCategories;
    const sanitizedCategory = sanitizeRoute(category);
    if (allowedCategories.includes(sanitizedCategory)) {
      setIsCatalogOpen(false);
      navigate(`/#${sanitizedCategory}`);
      setTimeout(() => {
        const element = document.getElementById(sanitizedCategory);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      console.error('Попытка перехода на неразрешенный маршрут:', sanitizedCategory);
    }
  };

  const handleTypeClick = (type: string) => {
    const allowedTypes = productTypes.map((product) => product.type);
    const sanitizedType = sanitizeRoute(type);
    if (allowedTypes.includes(sanitizedType)) {
      setIsCatalogOpen(false);
      navigate(`/products/${sanitizedType}`);
    } else {
      console.error('Попытка перехода на неразрешенный маршрут:', sanitizedType);
    }
  };

  const getTranslatedProducts = () => {
    const products = t('products', { returnObjects: true });
    if (typeof products === 'object' && products !== null) {
      return Object.values(products);
    }
    return [];
  };

  const translatedProducts = getTranslatedProducts();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let query = e.target.value;
    if (query.length > 100) {
      query = query.slice(0, 100);
    }
    const sanitizedQuery = DOMPurify.sanitize(query);
    setSearchQuery(sanitizedQuery);

    const newFilteredProducts = translatedProducts.filter((product: string) =>
      product.toLowerCase().includes(sanitizedQuery.toLowerCase())
    );
    setFilteredProducts(newFilteredProducts);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catalogRef.current && !catalogRef.current.contains(event.target as Node)) {
        setIsCatalogOpen(false);
      }
    };

    if (isCatalogOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCatalogOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        {location.pathname !== '/' && (
          <button
            className="back-button"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft /> {t('navbar.back')}
          </button>
        )}
        {location.pathname !== '/' && (
          <button
            className="home-button"
            onClick={() => navigate('/')}
          >
            <FaHome /> {t('navbar.home')}
          </button>
        )}
      </div>
      <div className="navbar-search">
        <FaSearch className="navbar-search-icon" />
        <input
          type="text"
          placeholder={t('navbar.search')}
          value={searchQuery}
          onChange={handleSearch}
        />
        {searchQuery && filteredProducts.length > 0 && (
          <ul className="search-suggestions">
            {filteredProducts.map((product, index) => (
              <li key={index} onClick={() => setSearchQuery(DOMPurify.sanitize(product))}>
                {DOMPurify.sanitize(product)}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="navbar-actions">
        <div className="navbar-catalog" ref={catalogRef}>
          <button
            className="navbar-catalog-button"
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
          >
            {t('navbar.catalog')}
          </button>
          
          {isCatalogOpen && (
            <div className="navbar-catalog-dropdown">
              <div className="catalog-section">
                <h4>{t('homepage.recommendations')}</h4>
                <div className="catalog-items">
                  {recommendationCategories.map((category) => (
                    <Link
                      key={category}
                      to={`/#${sanitizeRoute(category)}`}
                      className="navbar-catalog-item"
                      onClick={() => handleCategoryClick(category)}
                    >
                      {t(`recommendations.${category}`)}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="catalog-section">
                <h4>{t('navbar.productTypes')}</h4>
                <div className="catalog-items">
                  {productTypes.map((type) => (
                    <button
                      key={type.type}
                      className="navbar-catalog-item"
                      onClick={() => handleTypeClick(type.type)}
                    >
                      {t(`productTypes.${type.type}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <select onChange={(e) => changeLanguage(e.target.value)} value={i18n.language}>
          <option value="ru">Русский</option>
          <option value="en">English</option>
          <option value="uz">Oʻzbek</option>
        </select>
        
        <Link to="/cart" className="navbar-cart">
          <FaShoppingCart />
          <span>{t('cart.title')}</span>
          {cart.length > 0 && <span className="navbar-cart-count">{cart.length}</span>}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;