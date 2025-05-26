import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Slider from 'react-slick';
import { LanguageContext } from '../context/LanguageContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/PopularProducts.css';
import ProductCard from '../components/ProductCard';

// Slick Slider arrow components
const NextArrow = ({ className, style, onClick }) => (
  <div
    className={className}
    style={{ ...style, display: 'block', right: '10px' }}
    onClick={onClick}
  />
);

const PrevArrow = ({ className, style, onClick }) => (
  <div
    className={className}
    style={{ ...style, display: 'block', left: '10px', zIndex: 1 }}
    onClick={onClick}
  />
);

function PopularProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useContext(LanguageContext);

  // Fetch popular products from the backend
  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        // Map products and ensure price is a number
        const formattedProducts = data.map(product => ({
          ...product,
          price: parseFloat(product.price),
        }));
        setProducts(formattedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPopularProducts();
  }, []);

  // Translations
  const translations = {
    en: {
      sectionTitle: 'QuickPick Popular Products',
      loading: 'Loading products...',
      error: 'Error loading products.',
    },
    ar: {
      sectionTitle: 'المنتجات الشعبية من QuickPick',
      loading: 'جارٍ تحميل المنتجات...',
      error: 'خطأ في تحميل المنتجات.',
    },
  };

  const t = translations[language];

  // Slick Slider settings
  const sliderSettings = {
    dots: true,
    infinite: products.length > 6, // Enable infinite loop only if > 6 products
    speed: 500,
    slidesToShow: Math.min(products.length, 6), // Show up to 6 products
    slidesToScroll: 6, // Scroll 6 products at a time
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(products.length, 4),
          slidesToScroll: 4,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: Math.min(products.length, 3),
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(products.length, 2),
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="popular-products py-5 text-center">
        <Container>
          <p>{t.loading}</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="popular-products py-5 text-center">
        <Container>
          <p>{t.error}</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="popular-products py-5">
      <Container>
        {/* Title */}
        <h2 className={`section-title mb-4 ${language === 'ar' ? 'text-end' : 'text-start'}`}>
          {t.sectionTitle}
        </h2>

        {/* Product Cards in Slider */}
        {products.length > 6 ? (
          <Slider {...sliderSettings}>
            {products.map((product) => (
              <div key={product.id} className="px-2">
                <ProductCard
                  product={product}
                  className="popular-product-card"
                  cartButtonContent={<i className="bi bi-plus-circle-fill"></i>}
                  priceFormatter={(price) => {
                    return language === 'ar'
                      ? `${price.toFixed(2)} جنيه مصري`
                      : `${price.toFixed(2)} LE`;
                  }}
                  titleClassName="product-title"
                  priceAndButtonLayout="inline"
                />
              </div>
            ))}
          </Slider>
        ) : (
          <Row className="justify-content-center">
            {products.map((product) => (
              <Col
                md={2}
                key={product.id}
                className={`col-9 mb-4 ${language === 'ar' ? 'order-md-last' : 'order-md-first'}`}
              >
                <ProductCard
                  product={product}
                  className="popular-product-card"
                  cartButtonContent={<i className="bi bi-plus-circle-fill"></i>}
                  priceFormatter={(price) => {
                    return language === 'ar'
                      ? `${price.toFixed(2)} جنيه مصري`
                      : `${price.toFixed(2)} LE`;
                  }}
                  titleClassName="product-title"
                  priceAndButtonLayout="inline"
                />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}

export default PopularProducts;
