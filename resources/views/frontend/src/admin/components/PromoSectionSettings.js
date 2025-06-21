import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { LanguageContext } from '../../context/LanguageContext';
import Sidebar from './Sidebar'; // Adjust the import path as needed
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/PromoSectionSettings.css'; // New styles file
import Select from 'react-select';

function PromoSectionSettings() {
  const { language } = useContext(LanguageContext);
  const [formData, setFormData] = useState({
    cooking_ideas_badge_en: '',
    cooking_ideas_badge_ar: '',
    cooking_ideas_title_en: '',
    cooking_ideas_title_ar: '',
    cooking_ideas_image: null,
    cooking_ideas_products: [],
    fast_delivery_badge_en: '',
    fast_delivery_badge_ar: '',
    fast_delivery_title_en: '',
    fast_delivery_title_ar: '',
    fast_delivery_image: null,
    fast_delivery_products: [],
  });
  const [products, setProducts] = useState([]);
  const [previewImages, setPreviewImages] = useState({ cooking_ideas: null, fast_delivery: null });
  const [existingImages, setExistingImages] = useState({ cooking_ideas: null, fast_delivery: null }); // Store existing image URLs
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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/settings/promo_section`, {
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        console.log('Fetch promo settings response status:', response.status, response.statusText);
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        console.log('Raw promo settings:', data);
        const settings = {
          cooking_ideas_badge_en: '',
          cooking_ideas_badge_ar: '',
          cooking_ideas_title_en: '',
          cooking_ideas_title_ar: '',
          cooking_ideas_image: null,
          fast_delivery_badge_en: '',
          fast_delivery_badge_ar: '',
          fast_delivery_title_en: '',
          fast_delivery_title_ar: '',
          fast_delivery_image: null,
        };
        const existing = { cooking_ideas: null, fast_delivery: null };
        data.forEach(item => {
          if (item.key.includes('image') && item.image) {
            const imgKey = item.key.includes('cooking') ? 'cooking_ideas' : 'fast_delivery';
            const imageUrl = `${process.env.REACT_APP_API_URL}/storage/${item.image}`;
            settings[`${imgKey}_image`] = null; // We don't store the image file in formData
            existing[imgKey] = imageUrl;
            setPreviewImages(prev => ({ ...prev, [imgKey]: imageUrl }));
          } else if (item.key.includes('_products')) {
            try {
              settings[item.key] = JSON.parse(item.value);
            } catch (e) {
              console.error(`Failed to parse products for ${item.key}:`, item.value);
              settings[item.key] = [];
            }
          } else {
            settings[item.key] = item.value;
          }
        });
        setFormData(prev => ({ ...prev, ...settings }));
        setExistingImages(existing);
      } catch (err) {
        setError(language === 'ar' ? 'خطأ في تحميل الإعدادات' : 'Error loading settings');
      }
    };
    fetchProducts();
    fetchSettings();
  }, [language]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (selectedOptions, key) => {
    const productIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prev => ({ ...prev, [`${key}_products`]: productIds }));
  };

  const handleImageChange = (e, key) => {
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
      setFormData(prev => ({ ...prev, [`${key}_image`]: file }));
      setPreviewImages(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  };

  const clearImage = (key) => {
    setFormData(prev => ({ ...prev, [`${key}_image`]: null }));
    setPreviewImages(prev => ({ ...prev, [key]: existingImages[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const requiredFields = [
      'cooking_ideas_badge_en', 'cooking_ideas_badge_ar',
      'cooking_ideas_title_en', 'cooking_ideas_title_ar',
      'fast_delivery_badge_en', 'fast_delivery_badge_ar',
      'fast_delivery_title_en', 'fast_delivery_title_ar',
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
      { key: 'cooking_ideas_badge_en', value: formData.cooking_ideas_badge_en, language: 'en' },
      { key: 'cooking_ideas_badge_ar', value: formData.cooking_ideas_badge_ar, language: 'ar' },
      { key: 'cooking_ideas_title_en', value: formData.cooking_ideas_title_en, language: 'en' },
      { key: 'cooking_ideas_title_ar', value: formData.cooking_ideas_title_ar, language: 'ar' },
      { key: 'cooking_ideas_products', value: JSON.stringify(formData.cooking_ideas_products), language: 'en' },
      { key: 'fast_delivery_badge_en', value: formData.fast_delivery_badge_en, language: 'en' },
      { key: 'fast_delivery_badge_ar', value: formData.fast_delivery_badge_ar, language: 'ar' },
      { key: 'fast_delivery_title_en', value: formData.fast_delivery_title_en, language: 'en' },
      { key: 'fast_delivery_title_ar', value: formData.fast_delivery_title_ar, language: 'ar' },
      { key: 'fast_delivery_products', value: JSON.stringify(formData.fast_delivery_products), language: 'en' },
    ];

    // Only include image settings if a new image is uploaded
    if (formData.cooking_ideas_image) {
      settings.push({ key: 'cooking_ideas_image', value: 'image', language: 'en' });
    }
    if (formData.fast_delivery_image) {
      settings.push({ key: 'fast_delivery_image', value: 'image', language: 'en' });
    }

    settings.forEach((setting, index) => {
      form.append(`${index}[key]`, setting.key);
      form.append(`${index}[value]`, setting.value);
      form.append(`${index}[language]`, setting.language);
      if (setting.key === 'cooking_ideas_image' && formData.cooking_ideas_image) {
        form.append(`${index}[image]`, formData.cooking_ideas_image);
      } else if (setting.key === 'fast_delivery_image' && formData.fast_delivery_image) {
        form.append(`${index}[image]`, formData.fast_delivery_image);
      }
    });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/settings/promo_section`, {
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

      // Update existingImages with new URLs if new images were uploaded
      const updatedExistingImages = { ...existingImages };
      if (formData.cooking_ideas_image) {
        updatedExistingImages.cooking_ideas = previewImages.cooking_ideas;
      }
      if (formData.fast_delivery_image) {
        updatedExistingImages.fast_delivery = previewImages.fast_delivery;
      }
      setExistingImages(updatedExistingImages);

      // Clear image fields to prevent re-sending on next submit
      setFormData(prev => ({
        ...prev,
        cooking_ideas_image: null,
        fast_delivery_image: null,
      }));
    } catch (err) {
      console.error('Submit error:', err);
      setError(language === 'ar' ? `خطأ في تحديث الإعدادات: ${err.message}` : `Error updating settings: ${err.message}`);
    }
  };

  return (
    <div className="promo-section-settings-wrapper">
      <Row className="g-0">
        {/* Sidebar */}
        <Col md={3}>
          <Sidebar />
        </Col>

        {/* Main Content */}
        <Col md={9}>
          <Container fluid className="py-5 main-content">
            <h2 className={`promo-section-settings-title mb-5 ${language === 'ar' ? 'text-end' : 'text-start'}`}>
              {language === 'ar' ? 'إعدادات القسم الترويجي' : 'Promo Section Settings'}
            </h2>

            {message && (
              <Alert variant="success" className="promo-section-settings-alert">
                {message}
              </Alert>
            )}
            {error && (
              <Alert variant="danger" className="promo-section-settings-alert">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} dir={language === 'ar' ? 'rtl' : 'ltr'} className="promo-section-settings-form">
              {/* Cooking Ideas Section */}
              <div className="form-section mb-5">
                <h4 className={`section-title ${language === 'ar' ? 'text-end' : 'text-start'}`}>
                  {language === 'ar' ? 'أفكار الطهي' : 'Cooking Ideas'}
                </h4>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="promo-section-settings-label">
                        {language === 'ar' ? 'الشارة (إنجليزي)' : 'Badge (English)'}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="cooking_ideas_badge_en"
                        value={formData.cooking_ideas_badge_en}
                        onChange={handleChange}
                        required
                        className="promo-section-settings-input"
                      />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="promo-section-settings-label">
                        {language === 'ar' ? 'الشارة (عربي)' : 'Badge (Arabic)'}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="cooking_ideas_badge_ar"
                        value={formData.cooking_ideas_badge_ar}
                        onChange={handleChange}
                        required
                        className="promo-section-settings-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="promo-section-settings-label">
                        {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="cooking_ideas_title_en"
                        value={formData.cooking_ideas_title_en}
                        onChange={handleChange}
                        required
                        className="promo-section-settings-input"
                      />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="promo-section-settings-label">
                        {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="cooking_ideas_title_ar"
                        value={formData.cooking_ideas_title_ar}
                        onChange={handleChange}
                        required
                        className="promo-section-settings-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4">
                  <Form.Label className="promo-section-settings-label">
                    {language === 'ar' ? 'صورة أفكار الطهي' : 'Cooking Ideas Image'}
                  </Form.Label>
                  <div className="custom-file-upload">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'cooking_ideas')}
                      className="promo-section-settings-file-input"
                      id="cooking_ideas_image"
                    />
                    <label htmlFor="cooking_ideas_image" className="promo-section-settings-file-label">
                      {language === 'ar' ? 'اختر صورة' : 'Choose Image'}
                    </label>
                  </div>
                  {previewImages.cooking_ideas && (
                    <div className="promo-section-settings-preview mt-3">
                      <img
                        src={previewImages.cooking_ideas}
                        alt="Cooking Ideas Preview"
                        className="img-fluid rounded"
                      />
                      {formData.cooking_ideas_image && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="mt-2"
                          onClick={() => clearImage('cooking_ideas')}
                        >
                          {language === 'ar' ? 'إلغاء الصورة' : 'Clear Image'}
                        </Button>
                      )}
                    </div>
                  )}
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="promo-section-settings-label">
                    {language === 'ar' ? 'المنتجات المرتبطة' : 'Associated Products'}
                  </Form.Label>
                  <Select
                    isMulti
                    name="cooking_ideas_products"
                    options={products}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    value={products.filter(p => formData.cooking_ideas_products.includes(p.value))}
                    onChange={(options) => handleProductChange(options, 'cooking_ideas')}
                  />
                </Form.Group>
              </div>

              {/* Fast Delivery Section */}
              <div className="form-section mb-5">
                <h4 className={`section-title ${language === 'ar' ? 'text-end' : 'text-start'}`}>
                  {language === 'ar' ? 'التوصيل السريع' : 'Fast Delivery'}
                </h4>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="promo-section-settings-label">
                        {language === 'ar' ? 'الشارة (إنجليزي)' : 'Badge (English)'}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="fast_delivery_badge_en"
                        value={formData.fast_delivery_badge_en}
                        onChange={handleChange}
                        required
                        className="promo-section-settings-input"
                      />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="promo-section-settings-label">
                        {language === 'ar' ? 'الشارة (عربي)' : 'Badge (Arabic)'}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="fast_delivery_badge_ar"
                        value={formData.fast_delivery_badge_ar}
                        onChange={handleChange}
                        required
                        className="promo-section-settings-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="promo-section-settings-label">
                        {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="fast_delivery_title_en"
                        value={formData.fast_delivery_title_en}
                        onChange={handleChange}
                        required
                        className="promo-section-settings-input"
                      />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="promo-section-settings-label">
                        {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="fast_delivery_title_ar"
                        value={formData.fast_delivery_title_ar}
                        onChange={handleChange}
                        required
                        className="promo-section-settings-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4">
                  <Form.Label className="promo-section-settings-label">
                    {language === 'ar' ? 'صورة التوصيل السريع' : 'Fast Delivery Image'}
                  </Form.Label>
                  <div className="custom-file-upload">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'fast_delivery')}
                      className="promo-section-settings-file-input"
                      id="fast_delivery_image"
                    />
                    <label htmlFor="fast_delivery_image" className="promo-section-settings-file-label">
                      {language === 'ar' ? 'اختر صورة' : 'Choose Image'}
                    </label>
                  </div>
                  {previewImages.fast_delivery && (
                    <div className="promo-section-settings-preview mt-3">
                      <img
                        src={previewImages.fast_delivery}
                        alt="Fast Delivery Preview"
                        className="img-fluid rounded"
                      />
                      {formData.fast_delivery_image && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="mt-2"
                          onClick={() => clearImage('fast_delivery')}
                        >
                          {language === 'ar' ? 'إلغاء الصورة' : 'Clear Image'}
                        </Button>
                      )}
                    </div>
                  )}
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="promo-section-settings-label">
                    {language === 'ar' ? 'المنتجات المرتبطة' : 'Associated Products'}
                  </Form.Label>
                  <Select
                    isMulti
                    name="fast_delivery_products"
                    options={products}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    value={products.filter(p => formData.fast_delivery_products.includes(p.value))}
                    onChange={(options) => handleProductChange(options, 'fast_delivery')}
                  />
                </Form.Group>
              </div>

              {/* Submit Button */}
              <Button type="submit" variant="primary" className="promo-section-settings-submit">
                {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
              </Button>
            </Form>
          </Container>
        </Col>
      </Row>
    </div>
  );
}

export default PromoSectionSettings;
