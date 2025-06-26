import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Form, Button, Dropdown, Pagination, Carousel } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/SearchPage.css';
import { CartContext } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

function Search() {
    const { language, setLanguage } = useContext(LanguageContext);
    const { addToCart } = useContext(CartContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState(''); // Separate state for actual search
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortOption, setSortOption] = useState('Best Selling');
    const [currentPage, setCurrentPage] = useState(1);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(false); // Change to false initially
    const [error, setError] = useState(null);
    const productsPerPage = 16;
    const location = useLocation();

    const translations = {
        en: {
            searchPlaceholder: 'Search for products',
            searchButton: 'Search',
            noProducts: 'No products found.',
            categoryLabel: 'Category:',
            sortLabel: 'Sort by:',
            all: 'All',
            bestSelling: 'Best Selling',
            priceLowToHigh: 'Price Low to High',
            priceHighToLow: 'Price High to Low',
            languageLabel: 'Language:',
            loading: 'Loading products...',
            error: 'Error loading products.',
        },
        ar: {
            searchPlaceholder: 'ابحث عن المنتجات',
            searchButton: 'بحث',
            noProducts: 'لم يتم العثور على منتجات.',
            categoryLabel: 'الفئة:',
            sortLabel: 'ترتيب حسب:',
            all: 'الكل',
            bestSelling: 'الأكثر مبيعًا',
            priceLowToHigh: 'السعر من الأقل إلى الأعلى',
            priceHighToLow: 'السعر من الأعلى إلى الأقل',
            languageLabel: 'اللغة:',
            loading: 'جارٍ تحميل المنتجات...',
            error: 'خطأ في تحميل المنتجات.',
        },
    };

    const t = translations[language];

    useEffect(() => {
        const fetchSliderContent = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/settings/search_slider`, {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include',
                });
                console.log('Fetch slider response status:', response.status, response.statusText);
                if (!response.ok) throw new Error('Failed to fetch slider settings');
                const data = await response.json();
                console.log('Raw slider settings:', data);
                const slideMap = {
                    slide1: { title: { en: '', ar: '' }, text: { en: '', ar: '' }, button: { en: '', ar: '' }, image: '' },
                    slide2: { title: { en: '', ar: '' }, text: { en: '', ar: '' }, button: { en: '', ar: '' }, image: '' },
                    slide3: { title: { en: '', ar: '' }, text: { en: '', ar: '' }, button: { en: '', ar: '' }, image: '' },
                };
                data.forEach(item => {
                    const slideKey = item.key.split('_')[0];
                    if (item.key.includes('image')) {
                        slideMap[slideKey].image = item.image ? `${process.env.REACT_APP_API_URL}/storage/${item.image}` : '';
                    } else {
                        const field = item.key.split('_')[1];
                        try {
                            slideMap[slideKey][field][item.language] = JSON.parse(item.value);
                        } catch (e) {
                            console.error(`Failed to parse value for ${item.key}:`, item.value);
                        }
                    }
                });
                console.log('Processed slider content:', slideMap);
                setSlides([
                    {
                        image: slideMap.slide1.image || `${process.env.PUBLIC_URL}/assets/offer-banner3.jpeg`,
                        fallbackImage: `${process.env.PUBLIC_URL}/assets/placeholder.jpg`,
                        title: slideMap.slide1.title[language] || (language === 'ar' ? 'تألقي بجمال لا يُضاهى!' : 'Glow with Unstoppable Beauty!'),
                        text: slideMap.slide1.text[language] || (language === 'ar' ? 'العد التنازلي بدأ! اغتنم أفضل العروض قبل نفاد المخزون.' : 'The Countdown is on! Grab the best deals while stock lasts.'),
                        buttonText: slideMap.slide1.button[language] || (language === 'ar' ? 'اطلب الآن' : 'Order Now'),
                        buttonLink: '/products',
                    },
                    {
                        image: slideMap.slide2.image || `${process.env.PUBLIC_URL}/assets/offer-banner1.jpeg`,
                        fallbackImage: `${process.env.PUBLIC_URL}/assets/placeholder.jpg`,
                        title: slideMap.slide2.title[language] || (language === 'ar' ? 'وفر حتى 60% على عروض البقالة!' : 'Save Up to 60% Off the Grocery Deals!'),
                        text: slideMap.slide2.text[language] || (language === 'ar' ? 'العد التنازلي بدأ! اغتنم أفضل العروض قبل نفاد المخزون.' : 'The Countdown is on! Grab the best deals while stock lasts.'),
                        buttonText: slideMap.slide2.button[language] || (language === 'ar' ? 'اطلب الآن' : 'Order Now'),
                        buttonLink: '/products',
                    },
                    {
                        image: slideMap.slide3.image || `${process.env.PUBLIC_URL}/assets/offer-banner2.jpeg`,
                        fallbackImage: `${process.env.PUBLIC_URL}/assets/placeholder.jpg`,
                        title: slideMap.slide3.title[language] || (language === 'ar' ? 'عرض رائع للأدوات المنزلية!' : 'A Sparkling Homeware Deal!'),
                        text: slideMap.slide3.text[language] || (language === 'ar' ? 'العد التنازلي بدأ! اغتنم أفضل العروض قبل نفاد المخزون.' : 'The Countdown is on! Grab the best deals while stock lasts.'),
                        buttonText: slideMap.slide3.button[language] || (language === 'ar' ? 'اطلب الآن' : 'Order Now'),
                        buttonLink: '/products',
                    },
                ]);
            } catch (error) {
                console.error('Error fetching slider content:', error);
                setSlides([
                    {
                        image: `${process.env.PUBLIC_URL}/assets/offer-banner3.jpeg`,
                        fallbackImage: `${process.env.PUBLIC_URL}/assets/placeholder.jpg`,
                        title: language === 'ar' ? 'تألقي بجمال لا يُضاهى!' : 'Glow with Unstoppable Beauty!',
                        text: language === 'ar' ? 'العد التنازلي بدأ! اغتنم أفضل العروض قبل نفاد المخزون.' : 'The Countdown is on! Grab the best deals while stock lasts.',
                        buttonText: language === 'ar' ? 'اطلب الآن' : 'Order Now',
                        buttonLink: '/products',
                    },
                    {
                        image: `${process.env.PUBLIC_URL}/assets/offer-banner1.jpeg`,
                        fallbackImage: `${process.env.PUBLIC_URL}/assets/placeholder.jpg`,
                        title: language === 'ar' ? 'وفر حتى 60% على عروض البقالة!' : 'Save Up to 60% Off the Grocery Deals!',
                        text: language === 'ar' ? 'العد التنازلي بدأ! اغتنم أفضل العروض قبل نفاد المخزون.' : 'The Countdown is on! Grab the best deals while stock lasts.',
                        buttonText: language === 'ar' ? 'اطلب الآن' : 'Order Now',
                        buttonLink: '/products',
                    },
                    {
                        image: `${process.env.PUBLIC_URL}/assets/offer-banner2.jpeg`,
                        fallbackImage: `${process.env.PUBLIC_URL}/assets/placeholder.jpg`,
                        title: language === 'ar' ? 'عرض رائع للأدوات المنزلية!' : 'A Sparkling Homeware Deal!',
                        text: language === 'ar' ? 'العد التنازلي بدأ! اغتنم أفضل العروض قبل نفاد المخزون.' : 'The Countdown is on! Grab the best deals while stock lasts.',
                        buttonText: language === 'ar' ? 'اطلب الآن' : 'Order Now',
                        buttonLink: '/products',
                    },
                ]);
            }
        };
        fetchSliderContent();
    }, [language]);

    useEffect(() => {
        if (location.state?.fromSearch && location.state?.searchTerm) {
            setSearchTerm(location.state.searchTerm);
            setSearchQuery(location.state.searchTerm);
        } else {
            setSearchTerm('');
            setSearchQuery('');
            setCurrentPage(1);
        }
    }, [location]);

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                const categoriesResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/categories`, {
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    },
                    credentials: token ? undefined : 'include',
                });

                if (!categoriesResponse.ok) {
                    throw new Error('Failed to fetch categories');
                }

                const categoriesData = await categoriesResponse.json();
                const visibleCategories = categoriesData.filter(category => category.visibility);
                const categoryNames = visibleCategories.map(category => ({
                    en: category.name,
                    ar: category.name_ar || category.name,
                }));
                setCategories(['All', ...categoryNames]);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError(err.message);
            }
        };
        fetchCategories();
    }, []);

    // Fetch products on load and when search/category/sort changes
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                const params = new URLSearchParams();
                if (searchQuery.trim()) {
                    params.append('search', searchQuery);
                }
                if (selectedCategory !== 'All') {
                    params.append('category', selectedCategory);
                }
                params.append('sort', sortOption);

                const productsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/products?${params}`, {
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    },
                    credentials: token ? undefined : 'include',
                });

                if (!productsResponse.ok) {
                    throw new Error('Failed to fetch products');
                }

                const productsData = await productsResponse.json();
                setProducts(productsData);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [searchQuery, selectedCategory, sortOption]);

    const totalPages = Math.ceil(products.length / productsPerPage);
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchQuery(searchTerm);
        setCurrentPage(1);
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
    };

    const handleSortSelect = (option) => {
        const sortOptionInEnglish =
            option === t.bestSelling
                ? translations.en.bestSelling
                : option === t.priceLowToHigh
                    ? translations.en.priceLowToHigh
                    : option === t.priceHighToLow
                        ? translations.en.priceHighToLow
                        : translations.en.bestSelling;
        setSortOption(sortOptionInEnglish);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleLanguageSelect = (lang) => {
        setLanguage(lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    };

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
        <div className="search-page">
            <Container className="py-5">

                <Form onSubmit={handleSearchSubmit} className="search-form mb-4">
                    <Row className="justify-content-center">
                        <Col xs={12} md={6} lg={5}>
                            <div className={`search-container ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                <Form.Control
                                    type="text"
                                    placeholder={t.searchPlaceholder}
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className={`search-bar ${language === 'ar' ? 'text-end' : 'text-start'}`}
                                />
                                <Button type="submit" className="search-btn">
                                    {t.searchButton}
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Form>

                <Row className="mb-5">
                    <Col>
                        <Carousel className="custom-carousel" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
                            {slides.map((slide, index) => (
                                <Carousel.Item key={index}>
                                    <div className="slider-image">
                                        <img
                                            src={slide.image}
                                            alt={slide.title}
                                            className="d-block w-100"
                                            style={{ height: '300px', objectFit: 'cover' }}
                                            onError={(e) => {
                                                console.warn(`Failed to load slide image: ${slide.image}`);
                                                e.target.src = slide.fallbackImage;
                                            }}
                                        />
                                        <div className="slider-overlay">
                                            <div className={`slider-content ${language === 'ar' ? 'text-end' : 'text-center'}`}>
                                                <h2 className="slider-title">{slide.title}</h2>
                                                <p className="slider-text">{slide.text}</p>
                                                <Button as={Link} to={slide.buttonLink} className="slider-btn">
                                                    {slide.buttonText}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Row className={`mb-4 align-items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                            <Col md={6} className="mb-2 mb-md-0">
                                <Dropdown onSelect={handleCategorySelect}>
                                    <Dropdown.Toggle variant="outline-secondary" id="category-dropdown">
                                        {t.categoryLabel}{' '}
                                        {selectedCategory === 'All' ? t.all : language === 'ar' ? categories.find(cat => cat.en === selectedCategory)?.ar || selectedCategory : selectedCategory}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
                                        {categories.map((category) => (
                                            <Dropdown.Item key={typeof category === 'string' ? category : category.en} eventKey={typeof category === 'string' ? category : category.en}>
                                                {typeof category === 'string' ? (category === 'All' ? t.all : category) : (language === 'ar' ? category.ar : category.en)}
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Col>
                            <Col md={6} className={language === 'ar' ? 'text-md-start' : 'text-md-end'}>
                                <Dropdown onSelect={handleSortSelect}>
                                    <Dropdown.Toggle variant="outline-secondary" id="sort-dropdown">
                                        {t.sortLabel}{' '}
                                        {sortOption === translations.en.bestSelling
                                            ? t.bestSelling
                                            : sortOption === translations.en.priceLowToHigh
                                                ? t.priceLowToHigh
                                                : t.priceHighToLow}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
                                        <Dropdown.Item eventKey={t.bestSelling}>{t.bestSelling}</Dropdown.Item>
                                        <Dropdown.Item eventKey={t.priceLowToHigh}>{t.priceLowToHigh}</Dropdown.Item>
                                        <Dropdown.Item eventKey={t.priceHighToLow}>{t.priceHighToLow}</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Col>
                        </Row>

                        <Row>
                            {currentProducts.length > 0 ? (
                                currentProducts.map((product) => (
                                    <Col md={3} key={product.id} className="mb-4">
                                        <ProductCard product={product} />
                                    </Col>
                                ))
                            ) : (
                                <Col className={language === 'ar' ? 'text-end' : 'text-start'}>
                                    <p>{t.noProducts}</p>
                                </Col>
                            )}
                        </Row>

                        {totalPages > 1 && (
                            <Row className="mt-4">
                                <Col className="text-center">
                                    <Pagination style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
                                        <Pagination.Prev
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        />
                                        {[...Array(totalPages).keys()].map((page) => (
                                            <Pagination.Item
                                                key={page + 1}
                                                active={page + 1 === currentPage}
                                                onClick={() => handlePageChange(page + 1)}
                                            >
                                                {page + 1}
                                            </Pagination.Item>
                                        ))}
                                        <Pagination.Next
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        />
                                    </Pagination>
                                </Col>
                            </Row>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Search;
