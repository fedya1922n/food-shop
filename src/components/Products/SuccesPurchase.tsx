import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './styles/Cart.css';

const SuccesPurchase: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="success-container">
      <h2>{t('cart.successPurchase') || 'Thank you for your purchase!'}</h2>
      <button className="back-button" onClick={() => navigate('/')}>
        {t('cart.backToHome') || 'Back to homepage'}
      </button>
    </div>
  );
};

export default SuccesPurchase;