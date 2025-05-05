import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import mockProducts from '../../../mockProducts';
import DOMPurify from 'dompurify';
import { isValidImageUrl } from '../context/CartContext';
import './styles/ProductDetails.css';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  discount?: number;
  category: string;
  imageQuery: string;
  ingredients: string[];
  nutritionalInfo: { calories: number; protein: number; fat: number; carbs: number };
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      setProduct(null);
      return;
    }

    const foundProduct = mockProducts.find((p: Product) => p.id === id);
    if (!foundProduct) {
      setProduct(null);
      return;
    }

    setProduct(foundProduct);
  }, [id]);

  if (!product || !product.id || !product.name || !product.price || !product.nutritionalInfo) {
    return <div>{t('details.productNotFound')}</div>;
  }

  const validSimilarProducts = mockProducts
    .filter((p: Product) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="product-details fade-in">
      <h2>{DOMPurify.sanitize(t(`products.${product.name}`, { defaultValue: product.name }))}</h2>
      <img
        src={isValidImageUrl(product.image) ? product.image : '/fallback-image.png'}
        alt={DOMPurify.sanitize(product.name)}
      />
      <p>
        {t('product.price')}: {product.price} {t('money.currency')}
      </p>
      <h3>{t('details.ingredients')}</h3>
      <ul>
        {product.ingredients.map((ingredient, index) => (
          <li key={index}>{t(`ingredients.${ingredient}`, { defaultValue: ingredient })}</li>
        ))}
      </ul>
      <h3>{t('details.nutritional')}</h3>
      <p>{t('details.calories')}: {product.nutritionalInfo.calories} {t('details.kcal')}</p>
      <p>{t('details.protein')}: {product.nutritionalInfo.protein} {t('details.grams')}</p>
      <p>{t('details.fat')}: {product.nutritionalInfo.fat} {t('details.grams')}</p>
      <p>{t('details.carbs')}: {product.nutritionalInfo.carbs} {t('details.grams')}</p>

      <div className="similar-products">
        <h3>{t('details.similarProducts')}</h3>
        <div className="similar-products-list">
          {validSimilarProducts.map((similar) => (
            <div key={similar.id} className="similar-product">
              <img
                src={isValidImageUrl(similar.image) ? similar.image : '/fallback-image.png'}
                alt={DOMPurify.sanitize(similar.name)}
                className="similar-product-image"
              />
              <p>{DOMPurify.sanitize(similar.name)}</p>
              <p>{similar.price} {t('money.currency')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;