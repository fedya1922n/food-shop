import React from 'react';
import ProductCard from './ProductCard';
import './styles/ProductsList.css';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  discount?: number;
}

const ProductList: React.FC<{ products: Product[] | undefined }> = ({ products }) => {
  const { t } = useTranslation();

  if (!Array.isArray(products) || products.some(product => !product.id || !product.name || !product.price)) {
    return <p>{t('error.invalidData')}</p>;
  }

  const uniqueProducts = Array.from(new Set(products.map(product => product.id)))
    .map(id => products.find(product => product.id === id));

  return (
    <div className="product-list">
      {uniqueProducts && uniqueProducts.length > 0 ? (
        uniqueProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              ...product,
              name: DOMPurify.sanitize(t(`products.${product.name}`, { defaultValue: product.name })),
            }}
          />
        ))
      ) : (
        <p>{t('error.noProductsAvailable')}</p>
      )}
    </div>
  );
};

export default ProductList;