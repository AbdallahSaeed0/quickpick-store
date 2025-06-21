import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/OffersPage.css';
import ProductCard from '../components/ProductCard';

function OffersPage() {
  const { language } = useContext(LanguageContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [bannerContent, setBannerContent] = useState({
    banner1: { title: { en: '', ar: '' }, text: { en: '', ar: '' }, image: '', products: [] },
    banner2: { title: { en: '', ar: '' }, text: { en: '', ar: '' }, image: '', products: [] },
    banner3: { title: { en: '', ar: '' }, text: { en: '', ar: '' }, image: '', products: [] },
  });
  const [bannerProducts, setBannerProducts] = useState({
    banner1: [],
    banner2: [],
    banner3: [],
  });

  const translations = {
    en: {
      searchPlaceholder: 'Search for products',
      searchButton: 'Search',
      noProducts: 'No products found.',
      orderNow: 'Order Now',
      sectionTitle: 'View Products',
      loading: 'Loading...',
      error: 'Error loading content.',
    },
    ar: {
      searchPlaceholder: 'ابحث عن المنتجات',
      searchButton: 'بحث',
      noProducts: 'لم يتم العثور على منتجات.',
      orderNow: 'اطلب الآن',
      sectionTitle: 'عرض المنتجات',
      loading: 'جارٍ التحميل...',
      error: 'خطأ في تحميل المحتوى.',
    },
  };

  const t = translations[language];

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/offers_page`);
        if (!response.ok) throw new Error('Failed to fetch offers page settings');
        const data = await response.json();
        const contentMap = {
          banner1: { title: {}, text: {}, image: '', products: [] },
          banner2: { title: {}, text: {}, image: '', products: [] },
          banner3: { title: {}, text: {}, image: '', products: [] },
        };

        data.forEach(item => {
          const [key, value] = [item.key, item.value];
          const bannerMatch = key.match(/^banner(\d)_(title|text)_(en|ar)$/);
          const imageMatch = key.match(/^banner(\d)_image$/);
          const productsMatch = key.match(/^banner(\d)_products$/);

          if (bannerMatch) {
            const [, num, field, lang] = bannerMatch;
            contentMap[`banner${num}`][field][lang] = value;
          } else if (imageMatch) {
            const [, num] = imageMatch;
            contentMap[`banner${num}`].image = item.image ? `${process.env.REACT_APP_API_URL}/storage/${item.image}` : '';
          } else if (productsMatch) {
            const [, num] = productsMatch;
            try {
              const productIds = JSON.parse(value);
              if (Array.isArray(productIds) && productIds.length > 0) {
                contentMap[`banner${num}`].products = productIds;
              }
            } catch (e) {
              console.error(`Failed to parse products for banner${num}:`, value);
            }
          }
        });
        setBannerContent(contentMap);

        // Fetch associated products for each banner
        for (const bannerKey in contentMap) {
          const productIds = contentMap[bannerKey].products;
          if (productIds.length > 0) {
            const productsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/products/batch?ids=${productIds.join(',')}`);
            if (productsResponse.ok) {
              const productsData = await productsResponse.json();
              setBannerProducts(prev => ({ ...prev, [bannerKey]: productsData }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching offers page content:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [language]);

  // Debug image loading
  useEffect(() => {
    const images = [bannerContent.banner1.image, bannerContent.banner2.image, bannerContent.banner3.image];
    images.forEach((img) => {
      if (img) {
        const image = new Image();
        image.src = img;
        image.onerror = () => console.error('Failed to load banner image:', img);
      }
    });
  }, [bannerContent]);

  const productsSection1 = products.slice(0, 4);
  const productsSection2 = products.slice(4, 8);
  const productsSection3 = products.slice(8, 12);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate('/search', { state: { searchTerm, fromSearch: true } });
    } else {
      navigate('/search');
    }
  };

  const renderProductSection = (products) => (
    <Row className="mb-5">
      {products.length > 0 ? (
        products.map((product) => (
          <Col md={3} key={product.id} className="mb-4">
            <ProductCard product={product} />
          </Col>
        ))
      ) : (
        <Col>
          <p>{language === 'ar' ? 'لا توجد منتجات مرتبطة.' : 'No related products found.'}</p>
        </Col>
      )}
    </Row>
  );

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <p>{t.loading}</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <p>{t.error}</p>
      </Container>
    );
  }

  return (
    <div className="offers-page">
      <Container className="py-5">
        <Form onSubmit={handleSearchSubmit} className="search-form mb-5">
          <Row className="justify-content-center">
            <Col xs={12} md={6} lg={5}>
              <div className={`search-container ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <Form.Control
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-bar"
                />
                <Button type="submit" className="search-btn">
                  {t.searchButton}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>

        <Row
          className={`banner banner-1 mb-5 align-items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}
          style={{
            backgroundImage: `url(${bannerContent.banner1.image || `${process.env.PUBLIC_URL}/assets/offer-banner1.jpeg`})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Col md={6} className={language === 'ar' ? 'text-end' : ''}>
            <h2 className="banner-title">
              {bannerContent.banner1.title[language]}
            </h2>
            <p className="banner-text">
              {bannerContent.banner1.text[language]}
            </p>
          </Col>
          <Col md={6} className={language === 'ar' ? 'text-start' : 'text-end'}>
            <Button as={Link} to="/products" className="banner-btn">
              {t.orderNow}
            </Button>
          </Col>
        </Row>

        <h3 className={`section-title mb-4 ${language === 'ar' ? 'text-end' : 'text-start'}`}>
          {t.sectionTitle}
        </h3>
        {renderProductSection(bannerProducts.banner1)}

        <Row
          className={`banner banner-2 mb-5 align-items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}
          style={{
            backgroundImage: `url(${bannerContent.banner2.image || `${process.env.PUBLIC_URL}/assets/offer-banner2.jpeg`})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Col md={6} className={language === 'ar' ? 'text-end' : ''}>
            <h2 className="banner-title">
              {bannerContent.banner2.title[language]}
            </h2>
            <p className="banner-text">
              {bannerContent.banner2.text[language]}
            </p>
          </Col>
          <Col md={6} className={language === 'ar' ? 'text-start' : 'text-end'}>
            <Button as={Link} to="/products" className="banner-btn">
              {t.orderNow}
            </Button>
          </Col>
        </Row>

        <h3 className={`section-title mb-4 ${language === 'ar' ? 'text-end' : 'text-start'}`}>
          {t.sectionTitle}
        </h3>
        {renderProductSection(bannerProducts.banner2)}

        <Row
          className={`banner banner-3 mb-5 align-items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}
          style={{
            backgroundImage: `url(${bannerContent.banner3.image || `${process.env.PUBLIC_URL}/assets/offer-banner3.jpeg`})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Col md={6} className={language === 'ar' ? 'text-end' : ''}>
            <h2 className="banner-title">
              {bannerContent.banner3.title[language]}
            </h2>
            <p className="banner-text">
              {bannerContent.banner3.text[language]}
            </p>
          </Col>
          <Col md={6} className={language === 'ar' ? 'text-start' : 'text-end'}>
            <Button as={Link} to="/products" className="banner-btn">
              {t.orderNow}
            </Button>
          </Col>
        </Row>

        <h3 className={`section-title mb-4 ${language === 'ar' ? 'text-end' : 'text-start'}`}>
          {t.sectionTitle}
        </h3>
        {renderProductSection(bannerProducts.banner3)}
      </Container>
    </div>
  );
}

export default OffersPage;
