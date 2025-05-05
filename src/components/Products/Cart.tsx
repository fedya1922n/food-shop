import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { isValidImageUrl } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import './styles/Cart.css';

const Cart: React.FC = () => {
  const { cart, setCart } = useCart();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardNumberError, setCardNumberError] = useState('');
  const [cardHolderError, setCardHolderError] = useState('');
  const [expiryDateError, setExpiryDateError] = useState('');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const conversionRates: { [key: string]: number } = {
    ru: 0.00748, 
    en: 0.00007874, 
    uz: 1, 
  };

  const currentLanguage = i18n.language;
  const conversionRate = conversionRates[currentLanguage] || conversionRates['uz'];

  const groupedCart = cart.reduce((acc: { [key: string]: any }, item) => {
    if (acc[item.id]) {
      acc[item.id].quantity += 1;
    } else {
      acc[item.id] = { ...item, quantity: 1 };
    }
    return acc;
  }, {});

  const groupedCartItems = Object.values(groupedCart);

  const calculatePrice = (item: any) => {
    const validDiscount = item.discount && item.discount > 0 && item.discount <= 100;
    const basePrice = validDiscount
      ? item.price - (item.price * item.discount) / 100
      : item.price;
    return basePrice * item.quantity * conversionRate;
  };

  const totalPrice = groupedCartItems.reduce((total: number, item: any) => {
    return total + calculatePrice(item);
  }, 0);

  const clearCart = () => {
    setCart([]);
    setShowPayment(false);
  };

  const removeOneFromCart = (id: string) => {
    const updatedCart = [...cart];
    const itemIndex = updatedCart.findIndex((item) => item.id === id);

    if (itemIndex !== -1) {
      const item = updatedCart[itemIndex];
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        updatedCart.splice(itemIndex, 1);
      }
    }

    setCart(updatedCart);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();

    const isCardNumberValid = validateCardNumber();
    const isCardHolderValid = validateCardHolder();
    const isExpiryDateValid = validateExpiryDate();

    if (isCardNumberValid && isCardHolderValid && isExpiryDateValid && cvv.length === 3) {
      clearCart();
      try {
        navigate('/success-purchase', { replace: true });
      } catch (error) {
        console.error('Ошибка при навигации:', error);
      }
    }
  };

  const validateCardNumber = () => {
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length !== 16 || !/^\d{16}$/.test(cleanCardNumber)) {
      setCardNumberError(t('cart.invalidCardNumber') || 'Invalid card number.');
      return false;
    }
    setCardNumberError('');
    return true;
  };

  const validateCardHolder = () => {
    const cleanCardHolder = cardHolder.trim();
    if (cleanCardHolder.length < 5 || cleanCardHolder.length > 25 || !/^[a-zA-Z\s]+$/.test(cleanCardHolder)) {
      setCardHolderError(t('cart.invalidCardHolder') || 'Invalid card holder name.');
      return false;
    }
    setCardHolderError('');
    return true;
  };

  const validateExpiryDate = () => {
    const [month, year] = expiryDate.split('/').map(Number);
    if (!month || !year || month < 1 || month > 12) {
      setExpiryDateError(t('cart.invalidExpiryDate') || 'Invalid expiry date.');
      return false;
    }
    if (year < currentYear % 100 || (year === currentYear % 100 && month < currentMonth)) {
      setExpiryDateError(t('cart.expiredCard') || 'Card expired.');
      return false;
    }
    if (year > (currentYear % 100) + 10) {
      setExpiryDateError(t('cart.invalidExpiryDate') || 'Invalid expiry date.');
      return false;
    }
    setExpiryDateError('');
    return true;
  };

  return (
    <div className="cart">
      <h2>{t('cart.title')}</h2>
      {groupedCartItems.length === 0 ? (
        <p>{t('cart.empty')}</p>
      ) : (
        <>
          <ul>
            {groupedCartItems.map((item: any) => (
              <li key={item.id} className="cart-item">
                <img
                  src={isValidImageUrl(item.image) ? item.image : '/fallback-image.png'}
                  alt={DOMPurify.sanitize(item.name)}
                />
                <div>
                  <h3>{DOMPurify.sanitize(item.name)}</h3>
                  <p>
                    {t('product.price')}: {calculatePrice(item).toFixed(2)} {t('money.currency')}
                  </p>
                  {item.discount && (
                    <p className="discount">
                      {t('product.discount')}: {item.discount}% {t('product.off')}
                    </p>
                  )}
                  {item.quantity > 1 && <p>{t('cart.quantity')}: {item.quantity}</p>}
                  <button onClick={() => removeOneFromCart(item.id)}>{t('cart.remove')}</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="cart-summary">
            <h3>{t('cart.totalPrice')}</h3>
            <p>{totalPrice.toFixed(2)} {t('money.currency')}</p>
            <button className="clear-cart-button" onClick={clearCart}>{t('cart.clear')}</button>
            <button className="pay-button" onClick={() => setShowPayment(true)}>{t('cart.pay')}</button>
          </div>
        </>
      )}

      {showPayment && (
        <div className="payment-form">
          <h3>{t('cart.payment')}</h3>
          <form onSubmit={handlePayment}>
            <div>
              <label>{t('cart.cardNumber')}</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
              {cardNumberError && <p className="error">{cardNumberError}</p>}
            </div>
            <div>
              <label>{t('cart.cardHolder')}</label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="JOHN DOE"
                maxLength={25}
                required
              />
              {cardHolderError && <p className="error">{cardHolderError}</p>}
            </div>
            <div>
              <label>{t('cart.expiryDate')}</label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
                maxLength={5}
                required
              />
              {expiryDateError && <p className="error">{expiryDateError}</p>}
            </div>
            <div>
              <label>{t('cart.cvv')}</label>
              <input
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                maxLength={3}
                required
              />
            </div>
            <button type="submit">{t('cart.confirmPayment')}</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Cart;