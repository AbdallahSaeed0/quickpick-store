import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import { LanguageContext } from '../../context/LanguageContext';
import Sidebar from './Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/styles.css';

function OffersPageSettings() {
    const { language } = useContext(LanguageContext);
    const [formData, setFormData] = useState({
        banner1_title_en: '',
        banner1_title_ar: '',
        banner1_text_en: '',
        banner1_text_ar: '',
        banner1_image: null,
        banner1_products: [],
        banner2_title_en: '',
        banner2_title_ar: '',
        banner2_text_en: '',
        banner2_text_ar: '',
        banner2_image: null,
        banner2_products: [],
        banner3_title_en: '',
        banner3_title_ar: '',
        banner3_text_en: '',
        banner3_text_ar: '',
        banner3_image: null,
        banner3_products: [],
    });
    const [products, setProducts] = useState([]);
    const [previewImages, setPreviewImages] = useState({ banner1: null, banner2: null, banner3: null });
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`);
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                setProducts(data.map(p => ({ value: p.id, label: p.name })));
            } catch (err) {
                setError(language === 'ar' ? 'خطأ في تحميل المنتجات' : 'Error loading products');
            }
        };

        const fetchSettings = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/settings/offers_page`, {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include',
                });
                if (!response.ok) throw new Error('Failed to fetch settings');
                const data = await response.json();
                const settings = {};
                const previews = { banner1: null, banner2: null, banner3: null };
                data.forEach(item => {
                    if (item.key.includes('image') && item.image) {
                        const bannerKey = item.key.split('_')[0];
                        previews[bannerKey] = `${process.env.REACT_APP_API_URL}/storage/${item.image}`;
                    } else if (item.key.includes('_products')) {
                        try {
                            settings[item.key] = JSON.parse(item.value);
                        } catch (e) {
                            settings[item.key] = [];
                        }
                    } else {
                        settings[item.key] = item.value;
                    }
                });
                setFormData(prev => ({ ...prev, ...settings }));
                setPreviewImages(previews);
            } catch (err) {
                setError(language === 'ar' ? 'خطأ في تحميل الإعدادات' : 'Error loading settings');
            }
        };

        fetchProducts();
        fetchSettings();
    }, [language]);

    const handleProductChange = (selectedOptions, banner) => {
        const productIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setFormData(prev => ({ ...prev, [`${banner}_products`]: productIds }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e, banner) => {
        const file = e.target.files[0];
        if (file) {
            if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
                setError(language === 'ar' ? 'يرجى تحميل صورة بصيغة JPEG، PNG، أو GIF' : 'Please upload an image in JPEG, PNG, or GIF format');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setError(language === 'ar' ? 'حجم الصورة يجب ألا يتجاوز 2 ميجابايت' : 'Image size must not exceed 2MB');
                return;
            }
            setFormData(prev => ({ ...prev, [`${banner}_image`]: file }));
            setPreviewImages(prev => ({ ...prev, [banner]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        // Validate required fields
        const requiredFields = [
            'banner1_title_en', 'banner1_title_ar', 'banner1_text_en', 'banner1_text_ar',
            'banner2_title_en', 'banner2_title_ar', 'banner2_text_en', 'banner2_text_ar',
            'banner3_title_en', 'banner3_title_ar', 'banner3_text_en', 'banner3_text_ar',
        ];
        for (const field of requiredFields) {
            if (!formData[field]) {
                console.warn(`Field ${field} is empty`);
                setError(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
                return;
            }
        }

        const form = new FormData();
        const settings = [
            { key: 'banner1_title_en', value: formData.banner1_title_en, language: 'en' },
            { key: 'banner1_title_ar', value: formData.banner1_title_ar, language: 'ar' },
            { key: 'banner1_text_en', value: formData.banner1_text_en, language: 'en' },
            { key: 'banner1_text_ar', value: formData.banner1_text_ar, language: 'ar' },
            { key: 'banner1_image', value: 'image', language: 'en' },
            { key: 'banner1_products', value: JSON.stringify(formData.banner1_products), language: 'en' },
            { key: 'banner2_title_en', value: formData.banner2_title_en, language: 'en' },
            { key: 'banner2_title_ar', value: formData.banner2_title_ar, language: 'ar' },
            { key: 'banner2_text_en', value: formData.banner2_text_en, language: 'en' },
            { key: 'banner2_text_ar', value: formData.banner2_text_ar, language: 'ar' },
            { key: 'banner2_image', value: 'image', language: 'en' },
            { key: 'banner2_products', value: JSON.stringify(formData.banner2_products), language: 'en' },
            { key: 'banner3_title_en', value: formData.banner3_title_en, language: 'en' },
            { key: 'banner3_title_ar', value: formData.banner3_title_ar, language: 'ar' },
            { key: 'banner3_text_en', value: formData.banner3_text_en, language: 'en' },
            { key: 'banner3_text_ar', value: formData.banner3_text_ar, language: 'ar' },
            { key: 'banner3_image', value: 'image', language: 'en' },
            { key: 'banner3_products', value: JSON.stringify(formData.banner3_products), language: 'en' },
        ];

        settings.forEach((setting, index) => {
            form.append(`${index}[key]`, setting.key);
            form.append(`${index}[value]`, setting.value);
            form.append(`${index}[language]`, setting.language);
            if (setting.key === 'banner1_image' && formData.banner1_image) {
                form.append(`${index}[image]`, formData.banner1_image);
            } else if (setting.key === 'banner2_image' && formData.banner2_image) {
                form.append(`${index}[image]`, formData.banner2_image);
            } else if (setting.key === 'banner3_image' && formData.banner3_image) {
                form.append(`${index}[image]`, formData.banner3_image);
            }
        });

        console.log('FormData entries:');
        for (let [key, value] of form.entries()) {
            console.log(`${key}:`, value);
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/settings/offers_page`, {
                method: 'POST',
                body: form,
                credentials: 'include',
            });
            console.log('Submit response status:', response.status, response.statusText);
            const responseData = await response.json();
            console.log('Submit response data:', responseData);
            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to update settings');
            }
            setMessage(language === 'ar' ? 'تم تحديث الإعدادات بنجاح' : 'Settings updated successfully');
        } catch (err) {
            console.error('Submit error:', err);
            setError(language === 'ar' ? `خطأ في تحديث الإعدادات: ${err.message}` : `Error updating settings: ${err.message}`);
        }
    };

    return (
        <div className="banner-settings-wrapper">
            <Row className="g-0">
                <Col md={3}>
                    <Sidebar />
                </Col>
                <Col md={9}>
                    <Container fluid className="py-5 main-content">
                        <h2 className={`banner-settings-title ${language === 'ar' ? 'text-end' : 'text-start'} mb-5`}>
                            {language === 'ar' ? 'إعدادات صفحة العروض' : 'Offers Page Settings'}
                        </h2>

                        {message && (
                            <Alert variant="success" className="banner-settings-alert">
                                {message}
                            </Alert>
                        )}
                        {error && (
                            <Alert variant="danger" className="banner-settings-alert">
                                {error}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            <div className="form-section mb-5">
                                <h4 className="section-title">{language === 'ar' ? 'البانر الأول' : 'Banner 1'}</h4>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="banner-settings-label">
                                                {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="banner1_title_en"
                                                value={formData.banner1_title_en}
                                                onChange={handleChange}
                                                required
                                                className="banner-settings-input"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="banner-settings-label">
                                                {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="banner1_title_ar"
                                                value={formData.banner1_title_ar}
                                                onChange={handleChange}
                                                required
                                                className="banner-settings-input"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="banner-settings-label">
                                                {language === 'ar' ? 'النص (إنجليزي)' : 'Text (English)'}
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="banner1_text_en"
                                                value={formData.banner1_text_en}
                                                onChange={handleChange}
                                                required
                                                className="banner-settings-input"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="banner-settings-label">
                                                {language === 'ar' ? 'النص (عربي)' : 'Text (Arabic)'}
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="banner1_text_ar"
                                                value={formData.banner1_text_ar}
                                                onChange={handleChange}
                                                required
                                                className="banner-settings-input"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-4">
                                    <Form.Label className="banner-settings-label">
                                        {language === 'ar' ? 'المنتجات المرتبطة' : 'Associated Products'}
                                    </Form.Label>
                                    <Select
                                        isMulti
                                        name="banner1_products"
                                        options={products}
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                        value={products.filter(p => formData.banner1_products.includes(p.value))}
                                        onChange={(options) => handleProductChange(options, 'banner1')}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label className="banner-settings-label">
                                        {language === 'ar' ? 'صورة البانر الأول' : 'Banner 1 Image'}
                                    </Form.Label>
                                    <div className="custom-file-upload">
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, 'banner1')}
                                            className="banner-settings-file-input"
                                        />
                                    </div>
                                    {previewImages.banner1 && (
                                        <div className="banner-settings-preview">
                                            <img
                                                src={previewImages.banner1}
                                                alt="Banner 1 Preview"
                                                className="image-preview"
                                            />
                                        </div>
                                    )}
                                </Form.Group>
                            </div>

                            <div className="form-section mb-5">
                                <h4 className="section-title">{language === 'ar' ? 'البانر الثاني' : 'Banner 2'}</h4>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="banner-settings-label">
                                                {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="banner2_title_en"
                                                value={formData.banner2_title_en}
                                                onChange={handleChange}
                                                required
                                                className="banner-settings-input"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="banner-settings-label">
                                                {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="banner2_title_ar"
                                                value={formData.banner2_title_ar}
                                                onChange={handleChange}
                                                required
                                                className="banner-settings-input"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="banner-settings-label">
                                                {language === 'ar' ? 'النص (إنجليزي)' : 'Text (English)'}
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="banner2_text_en"
                                                value={formData.banner2_text_en}
                                                onChange={handleChange}
                                                required
                                                className="banner-settings-input"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="banner-settings-label">
                                                {language === 'ar' ? 'النص (عربي)' : 'Text (Arabic)'}
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="banner2_text_ar"
                                                value={formData.banner2_text_ar}
                                                onChange={handleChange}
                                                required
                                                className="banner-settings-input"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-4">
                                    <Form.Label className="banner-settings-label">
                                        {language === 'ar' ? 'المنتجات المرتبطة' : 'Associated Products'}
                                    </Form.Label>
                                    <Select
                                        isMulti
                                        name="banner2_products"
                                        options={products}
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                        value={products.filter(p => formData.banner2_products.includes(p.value))}
                                        onChange={(options) => handleProductChange(options, 'banner2')}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label className="banner-settings-label">
                                        {language === 'ar' ? 'صورة البانر الثاني' : 'Banner 2 Image'}
                                    </Form.Label>
                                    <div className="custom-file-upload">
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, 'banner2')}
                                            className="banner-settings-file-input"
                                        />
                                    </div>
                                    {previewImages.banner2 && (
                                        <div className="banner-settings-preview">
                                            <img
                                                src={previewImages.banner2}
                                                alt="Banner 2 Preview"
                                                className="image-preview"
                                            />
                                        </div>
                                    )}
                                </Form.Group>
                            </div>

                            <div className="form-section mb-5">
                                <h4 className="section-title">{language === 'ar' ? 'البانر الثالث' : 'Banner 3'}</h4>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="banner-settings-label">
                                                {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="banner3_title_en"
                                                value={formData.banner3_title_en}
                                                onChange={handleChange}
                                                required
                                                className="banner-settings-input"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="banner-settings-label">
                                                {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="banner3_title_ar"
                                                value={formData.banner3_title_ar}
                                                onChange={handleChange}
                                                required
                                                className="banner-settings-input"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="banner-settings-label">
                                                {language === 'ar' ? 'النص (إنجليزي)' : 'Text (English)'}
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="banner3_text_en"
                                                value={formData.banner3_text_en}
                                                onChange={handleChange}
                                                required
                                                className="banner-settings-input"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="banner-settings-label">
                                                {language === 'ar' ? 'النص (عربي)' : 'Text (Arabic)'}
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="banner3_text_ar"
                                                value={formData.banner3_text_ar}
                                                onChange={handleChange}
                                                required
                                                className="banner-settings-input"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-4">
                                    <Form.Label className="banner-settings-label">
                                        {language === 'ar' ? 'المنتجات المرتبطة' : 'Associated Products'}
                                    </Form.Label>
                                    <Select
                                        isMulti
                                        name="banner3_products"
                                        options={products}
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                        value={products.filter(p => formData.banner3_products.includes(p.value))}
                                        onChange={(options) => handleProductChange(options, 'banner3')}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label className="banner-settings-label">
                                        {language === 'ar' ? 'صورة البانر الثالث' : 'Banner 3 Image'}
                                    </Form.Label>
                                    <div className="custom-file-upload">
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, 'banner3')}
                                            className="banner-settings-file-input"
                                        />
                                    </div>
                                    {previewImages.banner3 && (
                                        <div className="banner-settings-preview">
                                            <img
                                                src={previewImages.banner3}
                                                alt="Banner 3 Preview"
                                                className="image-preview"
                                            />
                                        </div>
                                    )}
                                </Form.Group>
                            </div>

                            <Button type="submit" className="banner-settings-submit">
                                {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                            </Button>
                        </Form>
                    </Container>
                </Col>
            </Row>
        </div>
    );
}

export default OffersPageSettings;
