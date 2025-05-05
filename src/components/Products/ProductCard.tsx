import React, { useEffect, useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { isValidImageUrl, isValidProduct } from '../context/CartContext';
import './styles/ProductCard.css';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  discount?: number;
}

const ProductCard: React.FC<{ product: any }> = ({ product }) => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const [animate, setAnimate] = useState(false);
  const [discountActive, setDiscountActive] = useState(true);
  const [discountStartTime, setDiscountStartTime] = useState<Date | null>(null);

  if (!isValidProduct(product)) {
    return null;
  }

  useEffect(() => {
    setAnimate(true);
    if (!discountStartTime) {
      setDiscountStartTime(new Date());
    }
    const interval = setInterval(() => {
      if (discountStartTime) {
        const now = new Date();
        const timeElapsed = now.getTime() - discountStartTime.getTime();
        if (timeElapsed >= 2 * 60 * 60 * 1000) {
          setDiscountActive(false);
          setTimeout(() => {
            setDiscountActive(true);
            setDiscountStartTime(new Date());
          }, 12 * 24 * 60 * 60 * 1000);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [discountStartTime]);

  const conversionRates: { [key: string]: number } = {
    ru: 0.00748,
    en: 0.00007874, 
    uz: 1, 
  };

  const currentLanguage = i18n.language;
  const conversionRate = conversionRates[currentLanguage] || conversionRates['uz'];

  const validDiscount = product.discount && product.discount > 0 && product.discount <= 100;
  const basePrice = validDiscount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  const convertedPrice = basePrice * conversionRate;

  const handleAddToCart = () => {
    try {
      const sanitizedProduct: Product = {
        id: product.id,
        name: DOMPurify.sanitize(product.name),
        price: product.price,
        image: product.image,
        discount: product.discount,
      };
      addToCart(sanitizedProduct);
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
    }
  };

  const truncatedName = product.name.length > 50
    ? `${product.name.slice(0, 50)}...`
    : product.name;

  return (
    <div className={`product-card ${animate ? 'fade-in' : ''}`}>
      <Link to={`/product/${product.id}`}>
        <img
          src={isValidImageUrl(product.image) ? product.image : '/fallback-image.png'}
          alt={DOMPurify.sanitize(product.name)}
        />
      </Link>
      <div className="product-card-info">
        <Link to={`/product/${product.id}`}>
          <h3>{DOMPurify.sanitize(truncatedName)}</h3>
        </Link>
        <p>
          {t('product.price')}: {convertedPrice.toFixed(2)} {t('money.currency')}
        </p>
        {discountActive && validDiscount && (
          <p className="discount">
            {t('product.off')} {product.discount}%
          </p>
        )}
      </div>
      <div className="product-card-buttons">
        <button onClick={handleAddToCart}>
          <FaShoppingCart /> {t('product.addToCart')}
        </button>
        <Link to={`/product/${product.id}`}>
          <button className="details-button">{t('product.details')}</button>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;