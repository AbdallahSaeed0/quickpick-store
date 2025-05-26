import React, { useContext, useEffect } from 'react';
import { Row, Col, Form, Modal, Card, Button } from 'react-bootstrap';
import { LanguageContext } from '../../context/LanguageContext';
import { AuthContext } from '../../context/AuthContext';

function AddressSelector({
  useDefaultAddress,
  setUseDefaultAddress,
  useAnotherAddress,
  setUseAnotherAddress,
  showAddressModal,
  setShowAddressModal,
  selectedAddress,
  setSelectedAddress,
  addresses,
  setAddresses,
  newAddress,
  setNewAddress,
  showAddAddressForm,
  setShowAddAddressForm,
  handleUseDefaultAddressChange,
  handleUseAnotherAddressChange,
  handleAddressModalClose,
  handleNewAddressChange,
  handleAddressTypeChange,
  handleSaveNewAddress,
  handleSelectAddress,
  user, // Add user prop
}) {
  const { language } = useContext(LanguageContext);
  const { user: authUser } = useContext(AuthContext);

  const translations = {
    en: {
      customerName: 'Customer Name',
      useDefaultAddress: 'Use default address',
      useAnotherAddress: 'Use another address',
      selectedAddress: 'Selected Address',
      aptNo: 'Apt No.',
      floor: 'Floor',
      noAdditionalDetails: 'No additional details',
      selectAddress: 'Select Address',
      savedAddresses: 'Saved Addresses',
      noSavedAddresses: 'No saved addresses found.',
      addNewAddress: 'Add New Address',
      apartment: 'Apartment',
      house: 'House',
      work: 'Work',
      other: 'Other',
      label: 'Label *',
      labelPlaceholder: 'e.g., Home',
      aptNoPlaceholder: 'Apartment Number',
      floorPlaceholder: 'Floor Number',
      street: 'Street *',
      streetPlaceholder: 'Street Name',
      deliveryInstructions: 'Delivery Instructions',
      deliveryInstructionsPlaceholder: 'Additional details',
      close: 'Close',
      saveAddress: 'Save Address',
      select: 'Select',
    },
    ar: {
      customerName: 'اسم العميل',
      useDefaultAddress: 'استخدام العنوان الافتراضي',
      useAnotherAddress: 'استخدام عنوان آخر',
      selectedAddress: 'العنوان المحدد',
      aptNo: 'رقم الشقة',
      floor: 'الطابق',
      noAdditionalDetails: 'لا توجد تفاصيل إضافية',
      selectAddress: 'اختر العنوان',
      savedAddresses: 'العناوين المحفوظة',
      noSavedAddresses: 'لم يتم العثور على عناوين محفوظة.',
      addNewAddress: 'إضافة عنوان جديد',
      apartment: 'شقة',
      house: 'منزل',
      work: 'عمل',
      other: 'آخر',
      label: 'التسمية *',
      labelPlaceholder: 'مثال: المنزل',
      aptNoPlaceholder: 'رقم الشقة',
      floorPlaceholder: 'رقم الطابق',
      street: 'الشارع *',
      streetPlaceholder: 'اسم الشارع',
      deliveryInstructions: 'تعليمات التوصيل',
      deliveryInstructionsPlaceholder: 'تفاصيل إضافية',
      close: 'إغلاق',
      saveAddress: 'حفظ العنوان',
      select: 'اختر',
    },
  };

  const t = translations[language];

  // Load addresses from AuthContext user
  // Load addresses from AuthContext user
useEffect(() => {
  if (authUser) {
    // Initialize userAddresses as an empty array
    let userAddresses = [];

    // Handle authUser.addresses
    if (authUser.addresses) {
      if (typeof authUser.addresses === 'string') {
        try {
          const parsedAddresses = JSON.parse(authUser.addresses);
          userAddresses = Array.isArray(parsedAddresses) ? parsedAddresses : [];
        } catch (e) {
          console.error('Error parsing authUser.addresses:', e);
          userAddresses = [];
        }
      } else if (Array.isArray(authUser.addresses)) {
        userAddresses = authUser.addresses;
      } else {
        console.warn('authUser.addresses is neither a string nor an array:', authUser.addresses);
        userAddresses = [];
      }
    }

    setAddresses(userAddresses);

    // Find default address only if userAddresses is not empty
    if (userAddresses.length > 0) {
      const defaultAddress = userAddresses.find(address => address.isDefault);
      if (defaultAddress && !selectedAddress) {
        setSelectedAddress(defaultAddress);
        setUseDefaultAddress(true);
      }
    } else {
      setAddresses([]);
    }
  } else {
    setAddresses([]);
  }
}, [authUser, setAddresses, setSelectedAddress, setUseDefaultAddress, selectedAddress]);

  return (
    <>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Check
            type="checkbox"
            label={t.useDefaultAddress}
            checked={useDefaultAddress}
            onChange={handleUseDefaultAddressChange}
            className={language === 'ar' ? 'text-end' : 'text-start'}
          />
        </Col>
        <Col md={6}>
          <Form.Check
            type="checkbox"
            label={t.useAnotherAddress}
            checked={useAnotherAddress}
            onChange={handleUseAnotherAddressChange}
            className={language === 'ar' ? 'text-end' : 'text-start'}
          />
        </Col>
      </Row>

      {selectedAddress && (
        <div className="address-details mb-3">
          <h5 className={language === 'ar' ? 'text-end' : 'text-start'}>{t.selectedAddress}</h5>
          {/* Display customer name */}
          {user && (
            <div className={`d-flex justify-content-between mb-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <span>{t.customerName}</span>
              <span>{`${user.first_name} ${user.last_name}`.trim()}</span>
            </div>
          )}
          <Form.Group className="mb-3">
            <Form.Control type="text" value={selectedAddress.label} readOnly className={language === 'ar' ? 'text-end' : 'text-start'} />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Control type="text" value={selectedAddress.aptNo || 'N/A'} readOnly className={language === 'ar' ? 'text-end' : 'text-start'} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Control type="text" value={selectedAddress.floor || 'N/A'} readOnly className={language === 'ar' ? 'text-end' : 'text-start'} />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Control type="text" value={selectedAddress.street} readOnly className={language === 'ar' ? 'text-end' : 'text-start'} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              value={selectedAddress.description || t.noAdditionalDetails}
              readOnly
              className={language === 'ar' ? 'text-end' : 'text-start'}
            />
          </Form.Group>
        </div>
      )}

      <Modal show={showAddressModal} onHide={handleAddressModalClose}>
        <Modal.Header closeButton>
          <Modal.Title className={language === 'ar' ? 'text-end w-100' : 'text-start w-100'}>
            {t.selectAddress}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {addresses.length > 0 ? (
            <>
              <h5 className={language === 'ar' ? 'text-end' : 'text-start'}>{t.savedAddresses}</h5>
              {addresses.map((address) => (
                <Card key={address.id} className="mb-3">
                  <Card.Body>
                    <div className={`d-flex justify-content-between align-items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <div className={language === 'ar' ? 'text-end' : 'text-start'}>
                        <strong>{address.label}</strong>
                        <p>
                          {address.street}, {address.aptNo ? `${t.aptNo} ${address.aptNo}, ` : ''}
                          {address.floor ? `${t.floor} ${address.floor}` : ''}
                        </p>
                        <p>{address.description || t.noAdditionalDetails}</p>
                      </div>
                      <Button variant="success" onClick={() => handleSelectAddress(address)}>
                        {t.select}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </>
          ) : (
            <p className={language === 'ar' ? 'text-end' : 'text-start'}>{t.noSavedAddresses}</p>
          )}
          {!showAddAddressForm && (
            <Button
              variant="outline-success"
              className="mt-3"
              onClick={() => setShowAddAddressForm(true)}
            >
              {t.addNewAddress}
            </Button>
          )}
          {showAddAddressForm && (
            <>
              <h5 className={language === 'ar' ? 'text-end' : 'text-start'}>{t.addNewAddress}</h5>
              <div className="map-placeholder mb-3"></div>
              <div className={`address-type mb-3 ${language === 'ar' ? 'd-flex flex-row-reverse' : ''}`}>
                <Button
                  variant={newAddress.type === 'Apartment' ? 'success' : 'outline-success'}
                  className="me-2"
                  onClick={() => handleAddressTypeChange('Apartment')}
                >
                  {t.apartment}
                </Button>
                <Button
                  variant={newAddress.type === 'House' ? 'success' : 'outline-success'}
                  className="me-2"
                  onClick={() => handleAddressTypeChange('House')}
                >
                  {t.house}
                </Button>
                <Button
                  variant={newAddress.type === 'Work' ? 'success' : 'outline-success'}
                  className="me-2"
                  onClick={() => handleAddressTypeChange('Work')}
                >
                  {t.work}
                </Button>
                <Button
                  variant={newAddress.type === 'Other' ? 'success' : 'outline-success'}
                  onClick={() => handleAddressTypeChange('Other')}
                >
                  {t.other}
                </Button>
              </div>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className={language === 'ar' ? 'd-block text-end' : ''}>{t.label}</Form.Label>
                  <Form.Control
                    type="text"
                    name="label"
                    value={newAddress.label}
                    onChange={handleNewAddressChange}
                    placeholder={t.labelPlaceholder}
                    required
                    className={language === 'ar' ? 'text-end' : 'text-start'}
                  />
                </Form.Group>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className={language === 'ar' ? 'd-block text-end' : ''}>{t.aptNo}</Form.Label>
                      <Form.Control
                        type="text"
                        name="aptNo"
                        value={newAddress.aptNo}
                        onChange={handleNewAddressChange}
                        placeholder={t.aptNoPlaceholder}
                        className={language === 'ar' ? 'text-end' : 'text-start'}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className={language === 'ar' ? 'd-block text-end' : ''}>{t.floor}</Form.Label>
                      <Form.Control
                        type="text"
                        name="floor"
                        value={newAddress.floor}
                        onChange={handleNewAddressChange}
                        placeholder={t.floorPlaceholder}
                        className={language === 'ar' ? 'text-end' : 'text-start'}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label className={language === 'ar' ? 'd-block text-end' : ''}>{t.street}</Form.Label>
                  <Form.Control
                    type="text"
                    name="street"
                    value={newAddress.street}
                    onChange={handleNewAddressChange}
                    placeholder={t.streetPlaceholder}
                    required
                    className={language === 'ar' ? 'text-end' : 'text-start'}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className={language === 'ar' ? 'd-block text-end' : ''}>{t.deliveryInstructions}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={newAddress.description}
                    onChange={handleNewAddressChange}
                    placeholder={t.deliveryInstructionsPlaceholder}
                    className={language === 'ar' ? 'text-end' : 'text-start'}
                  />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className={language === 'ar' ? 'flex-row-reverse' : ''}>
          <Button variant="secondary" onClick={handleAddressModalClose}>
            {t.close}
          </Button>
          {showAddAddressForm && (
            <Button variant="success" onClick={handleSaveNewAddress}>
              {t.saveAddress}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddressSelector;
