import React, { useContext } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { LanguageContext } from '../context/LanguageContext';
import '../styles/ProductPage.css';

function ProductCard({
  product,
  className = 'product-card',
  cartButtonContent = null,
  priceFormatter = (price, language) => {
    const numericPrice = parseFloat(price); // Convert to number
    const currency = 'EGP'; // Always use EGP
    const locale = language === 'ar' ? 'ar-EG' : 'en-US'; // Set locale based on language
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(numericPrice);
  },
  titleClassName = 'product-name',
  priceAndButtonLayout = 'stacked',
}) {
  const { addToCart } = useContext(CartContext);
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const { language } = useContext(LanguageContext);

  const translations = {
    en: {
      addToWishlist: 'Add to wishlist',
      removeFromWishlist: 'Remove from wishlist',
      addToCart: 'Add to cart',
    },
    ar: {
      addToWishlist: 'إضافة إلى قائمة الأمنيات',
      removeFromWishlist: 'إزالة من قائمة الأمنيات',
      addToCart: 'إضافة إلى السلة',
    },
  };

  const t = translations[language];

  const displayName = language === 'ar' && product.name_ar ? product.name_ar : product.name;
  const buttonText = cartButtonContent || t.addToCart;
  const formattedPrice = priceFormatter(product.price, language);

  return (
    <Card className={className}>
      <Link to={`/product/${product.id}`} className="product-link">
        <Card.Img
          variant="top"
          src={product.image ? `${process.env.REACT_APP_API_URL}/storage/${product.image}` : '/assets/placeholder.jpg'}
          alt={displayName}
          className="product-image"
          onError={(e) => {
            e.target.src = '/assets/placeholder.jpg';
          }}
        />
      </Link>
      <Card.Body>
        <div
          className={`d-flex ${
            language === 'ar' ? 'flex-row-reverse' : 'flex-row'
          } justify-content-between align-items-center`}
        >
          <Card.Title className={titleClassName}>
            <Link to={`/product/${product.id}`}>{displayName}</Link>
          </Card.Title>
          <FaHeart
            className={`wishlist-icon ${
              wishlist.some((item) => item.id === product.id) ? 'wishlist-active' : ''
            }`}
            onClick={() => toggleWishlist(product)}
            style={{ cursor: 'pointer' }}
            aria-label={
              wishlist.some((item) => item.id === product.id)
                ? t.removeFromWishlist
                : t.addToWishlist
            }
          />
        </div>
        {priceAndButtonLayout === 'inline' ? (
          <div
            className={`d-flex ${
              language === 'ar' ? 'flex-row-reverse' : 'flex-row'
            } justify-content-between align-items-center`}
          >
            <Card.Text className={`product-price mb-0 ${language === 'ar' ? 'text-end' : 'text-start'}`}>
              {formattedPrice}
            </Card.Text>
            <Button
              className="add-to-cart-btn"
              onClick={(e) => {
                e.preventDefault();
                addToCart(product, 1);
              }}
              variant="success"
              aria-label={t.addToCart}
            >
              {buttonText}
            </Button>
          </div>
        ) : (
          <>
            <Card.Text className={`product-price ${language === 'ar' ? 'text-center' : 'text-center'}`}>
              {formattedPrice}
            </Card.Text>
            <Button
              className="add-to-cart-btn"
              onClick={(e) => {
                e.preventDefault();
                addToCart(product, 1);
              }}
              variant="success"
              aria-label={t.addToCart}
            >
              {buttonText}
            </Button>
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default ProductCard;
