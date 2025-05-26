import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Checkout.css';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { WalletContext } from '../context/WalletContext';
import { LanguageContext } from '../context/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import BillingDetailsForm from './Checkout/BillingDetailsForm';
import AddressSelector from './Checkout/AddressSelector';
import DeliveryOptions from './Checkout/DeliveryOptions';
import PaymentMethods from './Checkout/PaymentMethod';
import OrderSummary from './Checkout/OrderSummary';

function Checkout() {
  const { cart, setCart } = useContext(CartContext);
  const { user, updateUser } = useContext(AuthContext);
  const { payWithWallet } = useContext(WalletContext);
  const { language } = useContext(LanguageContext);
  const location = useLocation();
  const navigate = useNavigate();

  // State for checkout form
  const [billingDetails, setBillingDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [useDefaultAddress, setUseDefaultAddress] = useState(false);
  const [useAnotherAddress, setUseAnotherAddress] = useState(false);
  const [instantDelivery, setInstantDelivery] = useState(false);
  const [scheduleDelivery, setScheduleDelivery] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('Earliest Available');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [cards, setCards] = useState([]);
  const [newAddress, setNewAddress] = useState({
    label: '',
    type: 'Apartment',
    aptNo: '',
    floor: '',
    street: '',
    description: '',
    isDefault: false,
  });
  const [newCard, setNewCard] = useState({
    number: '',
    expiry: '',
    cvc: '',
    holderName: '',
    type: 'Visa',
  });
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Calculate totals
  const totalPrice = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const shipping = 4.89;
  const cashHandlingFee = 2.99;
  const subtotal = parseFloat(totalPrice);
  const total = subtotal + shipping + (paymentMethod === 'cash' ? cashHandlingFee : 0);
  const discountPercentage = location.state?.discount || 0;
  const discountedTotal = total - (total * discountPercentage) / 100;

  // Translations
  const translations = {
    en: {
      error: {
        emptyCart: 'Your cart is empty. Please add items before checking out.',
        paymentMethod: 'Please select a payment method.',
        shippingAddress: 'Please select a shipping address.',
        cardRequired: 'Please select or add a card for payment.',
      },
      success: 'Order placed successfully!',
      usingAccountDetails: 'Using account details for {email}. You can edit the fields below if needed.',
    },
    ar: {
      error: {
        emptyCart: 'سلتك فارغة. يرجى إضافة عناصر قبل الدفع.',
        paymentMethod: 'يرجى اختيار طريقة دفع.',
        shippingAddress: 'يرجى اختيار عنوان الشحن.',
        cardRequired: 'يرجى اختيار أو إضافة بطاقة للدفع.',
      },
      success: 'تم تقديم الطلب بنجاح!',
      usingAccountDetails: 'استخدام تفاصيل الحساب لـ {email}. يمكنك تعديل الحقول أدناه إذا لزم الأمر.',
    },
  };

  const t = translations[language];

  // Load saved addresses and cards on mount
  // Load saved addresses and cards on mount
useEffect(() => {
  if (user) {
    setBillingDetails({
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email || '',
      phone: user.phone || billingDetails.phone || '',
    });

    // Parse addresses if it's a JSON string, or handle as array
    let userAddresses = [];
    if (user.addresses) {
      if (typeof user.addresses === 'string') {
        try {
          const parsedAddresses = JSON.parse(user.addresses);
          userAddresses = Array.isArray(parsedAddresses) ? parsedAddresses : [];
        } catch (e) {
          console.error('Error parsing user.addresses:', e);
          userAddresses = [];
        }
      } else if (Array.isArray(user.addresses)) {
        userAddresses = user.addresses;
      } else {
        console.warn('user.addresses is neither a string nor an array:', user.addresses);
        userAddresses = [];
      }
    }

    setAddresses(userAddresses);

    // Find default address only if userAddresses is not empty
    if (userAddresses.length > 0) {
      const defaultAddress = userAddresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
        setUseDefaultAddress(true);
      }
    } else {
      setAddresses([]);
    }
  }

  const savedCards = JSON.parse(localStorage.getItem('cards')) || [];
  setCards(savedCards);
}, [user, billingDetails.phone]);

  // Handlers for form inputs
  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseDefaultAddressChange = (e) => {
    const isChecked = e.target.checked;
    setUseDefaultAddress(isChecked);
    if (isChecked) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      setSelectedAddress(defaultAddress || null);
      setUseAnotherAddress(false);
      setShowAddressModal(false);
    } else {
      setSelectedAddress(null);
    }
  };

  const handleInstantDeliveryChange = (e) => {
    const isChecked = e.target.checked;
    setInstantDelivery(isChecked);
    if (isChecked) {
      setScheduleDelivery(false);
      setShowScheduleModal(false);
      setDeliveryDate(t.instantDeliveryDate || 'As soon as possible');
      setDeliveryTime('');
    }
  };

  const handleScheduleDeliveryChange = (e) => {
    const isChecked = e.target.checked;
    setScheduleDelivery(isChecked);
    if (isChecked) {
      setInstantDelivery(false);
      setShowScheduleModal(true);
    }
  };

  const handleUseAnotherAddressChange = (e) => {
    const isChecked = e.target.checked;
    setUseAnotherAddress(isChecked);
    if (isChecked) {
      setUseDefaultAddress(false);
      setShowAddressModal(true);
    } else {
      setShowAddressModal(false);
      setShowAddAddressForm(false);
    }
  };

  const handleModalClose = () => {
    setShowScheduleModal(false);
    if (!deliveryTime) {
      setScheduleDelivery(false);
    }
  };

  const handleModalSave = () => {
    setShowScheduleModal(false);
  };

  const handleAddressModalClose = () => {
    setShowAddressModal(false);
    setUseAnotherAddress(false);
    setShowAddAddressForm(false);
    setNewAddress({
      label: '',
      type: 'Apartment',
      aptNo: '',
      floor: '',
      street: '',
      description: '',
      isDefault: false,
    });
  };

  const handleNewAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddressTypeChange = (type) => {
    setNewAddress((prev) => ({ ...prev, type }));
  };

  const handleSaveNewAddress = async () => {
    if (!newAddress.label || !newAddress.street) {
      setError(language === 'ar' ? 'الأسم والشارع مطلوبان.' : 'Label and Street are required.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let updatedAddresses = [...addresses, { ...newAddress, id: Date.now() }];

      // Handle default address logic
      if (newAddress.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === updatedAddresses[updatedAddresses.length - 1].id,
        }));
      }

      const payload = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || '',
        gender: user.gender || '',
        wallet: user.wallet || 0,
        addresses: updatedAddresses,
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/update/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save address');
      }

      const updatedUser = await response.json();
      updateUser(updatedUser);
      setAddresses(updatedUser.addresses || []);
      setSelectedAddress(updatedAddresses[updatedAddresses.length - 1]);
      handleAddressModalClose();
      setError('');
      setSuccess(language === 'ar' ? 'تم حفظ العنوان بنجاح!' : 'Address saved successfully!');
    } catch (err) {
      console.error('Error saving address:', err);
      setError(err.message);
    }
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  const handleSaveCardChange = (e) => {
    setSaveCard(e.target.checked);
  };

  const handleCardModalClose = () => {
    setShowCardModal(false);
    setNewCard({
      number: '',
      expiry: '',
      cvc: '',
      holderName: '',
      type: 'Visa',
    });
  };

  const handleNewCardChange = (e) => {
    const { name, value } = e.target;
    setNewCard((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveNewCard = () => {
    if (!newCard.number || !newCard.expiry || !newCard.cvc || !newCard.holderName) {
      setError(t.error.cardRequired || 'All card fields are required.');
      return;
    }
    const maskedNumber = `**** **** **** ${newCard.number.slice(-4)}`;
    const updatedCards = [...cards, { ...newCard, number: maskedNumber, id: Date.now() }];
    localStorage.setItem('cards', JSON.stringify(updatedCards));
    setCards(updatedCards);
    setSelectedCard(updatedCards[updatedCards.length - 1]);
    setShowCardModal(false);
    setNewCard({
      number: '',
      expiry: '',
      cvc: '',
      holderName: '',
      type: 'Visa',
    });
    setError('');
  };

  const handleSelectCard = (card) => {
    setSelectedCard(card);
    setShowCardModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (cart.length === 0) {
      setError(t.error.emptyCart);
      return;
    }

    if (!selectedAddress) {
      setError(t.error.shippingAddress);
      return;
    }

    if (!paymentMethod) {
      setError(t.error.paymentMethod);
      return;
    }

    if (paymentMethod === 'card' && !selectedCard) {
      setError(t.error.cardRequired);
      return;
    }

    if (paymentMethod === 'wallet') {
      const paymentSuccessful = await payWithWallet(discountedTotal);
      if (!paymentSuccessful) {
        setError(language === 'ar' ? 'رصيد المحفظة غير كافٍ.' : 'Insufficient wallet balance.');
        return;
      }
    }

    const orderData = {
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price),
      })),
      total: parseFloat(discountedTotal),
      payment_method: paymentMethod,
      address: {
        label: selectedAddress.label,
        street: selectedAddress.street,
        aptNo: selectedAddress.aptNo || '',
        floor: selectedAddress.floor || '',
        description: selectedAddress.description || '',
      },
      delivery: {
        date: deliveryDate,
        time: deliveryTime,
        instructions: deliveryInstructions,
      },
      promo_code: location.state?.promoCode || null,
      discount_percentage: discountPercentage,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to place order');
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error('Server returned an unexpected response');
        }
      }

      const order = await response.json();
      setCart([]);
      setSuccess(t.success);
      navigate('/order-confirmation', { state: { orderDetails: order } });
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="checkout-page">
      <Container className="py-5">
        <Row>
          <Col md={8}>
            <Form onSubmit={handleSubmit} id="checkoutForm">
              <BillingDetailsForm
                billingDetails={billingDetails}
                setBillingDetails={setBillingDetails}
                handleBillingChange={handleBillingChange}
                user={user}
              />
              <AddressSelector
                useDefaultAddress={useDefaultAddress}
                setUseDefaultAddress={setUseDefaultAddress}
                useAnotherAddress={useAnotherAddress}
                setUseAnotherAddress={setUseAnotherAddress}
                showAddressModal={showAddressModal}
                setShowAddressModal={setShowAddressModal}
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
                addresses={addresses}
                setAddresses={setAddresses}
                newAddress={newAddress}
                setNewAddress={setNewAddress}
                showAddAddressForm={showAddAddressForm}
                setShowAddAddressForm={setShowAddAddressForm}
                handleUseDefaultAddressChange={handleUseDefaultAddressChange}
                handleUseAnotherAddressChange={handleUseAnotherAddressChange}
                handleAddressModalClose={handleAddressModalClose}
                handleNewAddressChange={handleNewAddressChange}
                handleAddressTypeChange={handleAddressTypeChange}
                handleSaveNewAddress={handleSaveNewAddress}
                handleSelectAddress={handleSelectAddress}
                user={user}
              />
              <DeliveryOptions
                instantDelivery={instantDelivery}
                setInstantDelivery={setInstantDelivery}
                scheduleDelivery={scheduleDelivery}
                setScheduleDelivery={setScheduleDelivery}
                showScheduleModal={showScheduleModal}
                setShowScheduleModal={setShowScheduleModal}
                deliveryDate={deliveryDate}
                setDeliveryDate={setDeliveryDate}
                deliveryTime={deliveryTime}
                setDeliveryTime={setDeliveryTime}
                deliveryInstructions={deliveryInstructions}
                setDeliveryInstructions={setDeliveryInstructions}
                handleInstantDeliveryChange={handleInstantDeliveryChange}
                handleScheduleDeliveryChange={handleScheduleDeliveryChange}
                handleModalClose={handleModalClose}
                handleModalSave={handleModalSave}
              />
              <PaymentMethods
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                showCardModal={showCardModal}
                setShowCardModal={setShowCardModal}
                selectedCard={selectedCard}
                setSelectedCard={setSelectedCard}
                saveCard={saveCard}
                setSaveCard={setSaveCard}
                cards={cards}
                setCards={setCards}
                newCard={newCard}
                setNewCard={setNewCard}
                handleSaveCardChange={handleSaveCardChange}
                handleCardModalClose={handleCardModalClose}
                handleNewCardChange={handleNewCardChange}
                handleSaveNewCard={handleSaveNewCard}
                handleSelectCard={handleSelectCard}
                totalPrice={total}
              />
            </Form>
          </Col>
          <Col md={4}>
            <OrderSummary
              cart={cart}
              totalPrice={totalPrice}
              subtotal={subtotal}
              shipping={shipping}
              cashHandlingFee={cashHandlingFee}
              total={discountedTotal}
              promoCode={location.state?.promoCode || null}
              discount={discountPercentage}
            />
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Checkout;
