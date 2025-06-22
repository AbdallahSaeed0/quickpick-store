import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../styles/CategoriesSection.css';

function CategoriesSection() {
  const { language } = useContext(LanguageContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Translations for section title and see more link
  const translations = {
    en: {
      sectionTitle: 'QuickPick Categories',
      seeMore: 'See More',
      loading: 'Loading categories...',
      error: 'Error loading categories.',
      noCategories: 'No categories available.',
    },
    ar: {
      sectionTitle: 'فئات QuickPick',
      seeMore: 'عرض المزيد',
      loading: 'جارٍ تحميل الفئات...',
      error: 'خطأ في تحميل الفئات.',
      noCategories: 'لا توجد فئات متاحة.',
    },
  };

  const t = translations[language];

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/categories`);

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        // Filter only visible categories
        const visibleCategories = data.filter(category => category.visibility);
        setCategories(visibleCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    arrows: true,
    rtl: language === 'ar',
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
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
      <div className="categories-section py-5">
        <Container className="text-center">
          <p>{t.loading}</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-section py-5">
        <Container className="text-center">
          <p>{t.error}</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="categories-section py-5">
      <Container>
        {/* Title and See More Link */}
        <div
          className={`d-flex ${
            language === 'ar' ? 'flex-row-reverse' : ''
          } justify-content-between align-items-center mb-4`}
        >
          <h2 className={`section-title ${language === 'ar' ? 'text-end' : 'text-start'}`}>
            {t.sectionTitle}
          </h2>
          <Link to="/categories" className="see-more-link">
            {t.seeMore}
          </Link>
        </div>

        {/* Category Slider */}
        {categories.length > 0 ? (
          <Slider {...settings}>
            {categories.map((category) => (
              <div key={category.id} className="category-slide">
                <Row className="justify-content-center">
                  <Col xl={12} lg={12} md={12} className="col-12 mb-4">
                    <Link to={`/category/${category.id}`} className="text-decoration-none">
                      <Card className="category-card">
                        <Card.Img
                          variant="top"
                          src={category.image ? `${process.env.REACT_APP_API_URL}/storage/${category.image}` : '/assets/placeholder.jpg'}
                          alt={language === 'ar' ? category.name_ar || category.name : category.name}
                          className="category-image"
                          onError={(e) => {
                            e.target.src = '/assets/placeholder.jpg';
                          }}
                        />
                        <div className="category-name-wrapper">
                          <Card.Title className="category-name">
                            {language === 'ar' ? category.name_ar || category.name : category.name}
                          </Card.Title>
                        </div>
                      </Card>
                    </Link>
                  </Col>
                </Row>
              </div>
            ))}
          </Slider>
        ) : (
          <div className="text-center">
            <p>{t.noCategories}</p>
          </div>
        )}
      </Container>
    </div>
  );
}

export default CategoriesSection;
