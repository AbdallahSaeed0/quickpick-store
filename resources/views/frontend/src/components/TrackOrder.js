import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Form, Button, ProgressBar, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/TrackOrder.css';
import { CartContext } from '../context/CartContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function TrackOrder() {
  const { language } = useContext(LanguageContext);
  const { setCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const translations = {
    en: {
      title: 'Track Your Order',
      searchPlaceholder: 'Enter Order ID (e.g., SDGT1254FD)',
      searchButton: 'Search',
      orderStatusTitle: 'ORDER STATUS',
      orderIdLabel: 'OrderID: #',
      deliveryAddress: 'Delivery Address',
      trackingStatuses: [
        { status: 'Order placed', date: '28 July 2024, 11:00 PM' },
        { status: 'Accepted', date: '29 July 2024, 11:15 PM' },
        { status: 'In Progress', date: '30 July 2024' },
        { status: 'On the Way', date: '30 July 2024' },
        { status: 'Delivered', date: '30 July 2024' },
      ],
      expectedAt: 'Expected at ',
      products: 'Products',
      noItems: 'No items found in this order.',
      editOrder: 'Edit Order',
      errorMessage: 'Order not found. Please check the Order ID and try again.',
      modal: {
        title: 'Edit Order',
        message: 'Hi there, you can still make changes to your order as long as it has not shipped.',
        preparing: 'preparing',
        keepAsIs: 'Keep as is',
        editOrder: 'Edit order',
      },
      map: {
        store: 'Store Location',
        customer: 'Your Location',
      },
    },
    ar: {
      title: 'تتبع طلبك',
      searchPlaceholder: 'أدخل معرف الطلب (مثال: SDGT1254FD)',
      searchButton: 'بحث',
      orderStatusTitle: 'حالة الطلب',
      orderIdLabel: 'معرف الطلب: #',
      deliveryAddress: 'عنوان التوصيل',
      trackingStatuses: [
        { status: 'تم تقديم الطلب', date: '28 يوليو 2024، 11:00 مساءً' },
        { status: 'تم القبول', date: '29 يوليو 2024، 11:15 مساءً' },
        { status: 'قيد التنفيذ', date: '30 يوليو 2024' },
        { status: 'في الطريق', date: '30 يوليو 2024' },
        { status: 'تم التوصيل', date: '30 يوليو 2024' },
      ],
      expectedAt: 'متوقع في ',
      products: 'المنتجات',
      noItems: 'لم يتم العثور على عناصر في هذا الطلب.',
      editOrder: 'تعديل الطلب',
      errorMessage: 'لم يتم العثور على الطلب. يرجى التحقق من معرف الطلب والمحاولة مرة أخرى.',
      modal: {
        title: 'تعديل الطلب',
        message: 'مرحبًا، يمكنك إجراء تغييرات على طلبك طالما لم يتم شحنه بعد.',
        preparing: 'جاري التحضير',
        keepAsIs: 'الإبقاء كما هو',
        editOrder: 'تعديل الطلب',
      },
      map: {
        store: 'موقع المتجر',
        customer: 'موقعك',
      },
    },
  };

  const t = translations[language];
  const trackingStatuses = t.trackingStatuses;

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to track your order');
        return;
      }

      console.log('Searching for order:', orderId); // Debug log

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/orders`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch orders:', errorData); // Debug log
        throw new Error(errorData.message || 'Failed to fetch orders');
      }

      const orders = await response.json();
      console.log('All orders:', orders); // Debug log

      const foundOrder = orders.find((o) => o.id.toString() === orderId.toString());
      console.log('Found order:', foundOrder); // Debug log

      if (foundOrder) {
        let statusData = [];
        try {
          const statusResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/user/orders/${foundOrder.id}/status-history`, {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (statusResponse.ok) {
            statusData = await statusResponse.json();
            console.log('Status history:', statusData); // Debug log
          } else {
            console.warn('Failed to fetch status history, falling back to current status');
            statusData = [{ status: foundOrder.status, changed_at: foundOrder.created_at }];
          }
        } catch (err) {
          console.error('Error fetching status history:', err);
          statusData = [{ status: foundOrder.status, changed_at: foundOrder.created_at }];
        }

        const tracking = statusData.map(statusEntry => ({
          status: statusEntry.status === 'pending' ? (language === 'ar' ? 'تم تقديم الطلب' : 'Order placed') :
                  statusEntry.status === 'processing' ? (language === 'ar' ? 'قيد التنفيذ' : 'In Progress') :
                  statusEntry.status === 'shipped' ? (language === 'ar' ? 'في الطريق' : 'On the Way') :
                  statusEntry.status === 'delivered' ? (language === 'ar' ? 'تم التوصيل' : 'Delivered') :
                  statusEntry.status === 'cancelled' ? (language === 'ar' ? 'ملغى' : 'Cancelled') :
                  statusEntry.status,
          date: new Date(statusEntry.changed_at).toLocaleString(
            language === 'ar' ? 'ar-EG' : 'en-US',
            {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            }
          ),
        }));

        setOrder({
          id: foundOrder.id,
          address: JSON.parse(foundOrder.address),
          items: foundOrder.items.map(item => ({
            id: item.product_id,
            name: item.product.name,
            name_ar: item.product.name_ar,
            quantity: item.quantity,
            price: item.price,
            image: item.product.image,
          })),
          tracking: tracking.length > 0 ? tracking : [{
            status: language === 'ar' ? 'تم تقديم الطلب' : 'Order placed',
            date: new Date(foundOrder.created_at).toLocaleString(
              language === 'ar' ? 'ar-EG' : 'en-US',
              {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              }
            ),
          }],
        });
        setStatusHistory(statusData);
        setError('');
      } else {
        console.log('Order not found in the list'); // Debug log
        setOrder(null);
        setStatusHistory([]);
        setError(t.errorMessage);
      }
    } catch (err) {
      console.error('Error in handleSearch:', err); // Debug log
      setOrder(null);
      setStatusHistory([]);
      setError(t.errorMessage);
    }
  };

  const getProgress = () => {
    if (!order || !order.tracking || order.tracking.length === 0) return 0;
    const latestStatus = order.tracking[order.tracking.length - 1]?.status || trackingStatuses[0].status;
    const statusIndex = trackingStatuses.findIndex((s) => s.status === latestStatus);
    if (statusIndex === -1) return 0;
    return ((statusIndex + 1) / trackingStatuses.length) * 100;
  };

  const canEditOrder = () => {
    if (!order || !order.tracking || order.tracking.length === 0) return false;
    const latestStatus = order.tracking[order.tracking.length - 1]?.status || '';
    return latestStatus === (language === 'ar' ? 'تم تقديم الطلب' : 'Order placed');
  };

  const shouldShowMap = () => {
    if (!order || !order.tracking || order.tracking.length === 0) return false;
    const latestStatus = order.tracking[order.tracking.length - 1]?.status || '';
    const acceptedIndex = trackingStatuses.findIndex(s => s.status === (language === 'ar' ? 'تم القبول' : 'Accepted'));
    const currentIndex = trackingStatuses.findIndex(s => s.status === latestStatus);
    return currentIndex >= acceptedIndex;
  };

  const handleEditOrder = () => {
    setShowEditModal(true);
  };

  const confirmEditOrder = () => {
    if (order && order.items) {
      setCart(order.items);
      const savedOrders = JSON.parse(localStorage.getItem('orders')) || { past: [], upcoming: [] };
      savedOrders.upcoming = savedOrders.upcoming.filter((o) => o.id !== order.id);
      savedOrders.past = savedOrders.past.filter((o) => o.id !== order.id);
      localStorage.setItem('orders', JSON.stringify(savedOrders));
      navigate('/cart', { state: { fromEditOrder: true } });
    }
    setShowEditModal(false);
  };

  // Mock coordinates (in a real app, you'd geocode the addresses)
  const storeLocation = [30.0444, 31.2357]; // Example: Cairo, Egypt (store location)
  const customerLocation = [30.0626, 31.2498]; // Example: Another point in Cairo (customer location)
  const polyline = [storeLocation, customerLocation]; // Path between store and customer

  return (
    <div className="track-order-page">
      <Container className="py-5">
        <h2 className={`section-title mb-4 ${language === 'ar' ? 'text-end' : 'text-start'}`}>
          {t.title}
        </h2>
        <Row className="mb-4">
          <Col md={8} className="mx-auto">
            <Form className={`d-flex ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <Form.Control
                type="text"
                placeholder={t.searchPlaceholder}
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className={`flex-grow-1 ${language === 'ar' ? 'ml-2' : 'mr-2'}`}
              />
              <Button variant="success" onClick={handleSearch}>
                {t.searchButton}
              </Button>
            </Form>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}

        {order && (
          <>
            <h4 className={`order-status-title mb-3 ${language === 'ar' ? 'text-end' : 'text-start'}`}>
              {t.orderStatusTitle}
              <br />
              {t.orderIdLabel}{order.id}
            </h4>
            <Row className="mb-4">
              <Col>
                <ProgressBar now={getProgress()} className="mb-2" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }} />
                <div className={`tracking-timeline d-flex justify-content-between text-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  {trackingStatuses.map((status, index) => {
                    const orderTracking = order.tracking.find((t) => t.status === status.status);
                    const isCompleted = order.tracking.some((t) => t.status === status.status);
                    const isFuture = !isCompleted && trackingStatuses.findIndex((s) => s.status === order.tracking[order.tracking.length - 1].status) < index;

                    return (
                      <div key={index} className="tracking-step">
                        <div className={`tracking-icon ${isCompleted ? 'completed' : ''}`}>
                          {status.status === (language === 'ar' ? 'تم تقديم الطلب' : 'Order placed') && <i className="bi bi-hand-index-thumb"></i>}
                          {status.status === (language === 'ar' ? 'تم القبول' : 'Accepted') && <i className="bi bi-check-circle"></i>}
                          {status.status === (language === 'ar' ? 'قيد التنفيذ' : 'In Progress') && <i className="bi bi-hourglass-split"></i>}
                          {status.status === (language === 'ar' ? 'في الطريق' : 'On the Way') && <i className="bi bi-truck"></i>}
                          {status.status === (language === 'ar' ? 'تم التوصيل' : 'Delivered') && <i className="bi bi-check-circle-fill"></i>}
                        </div>
                        <p className="tracking-status">{status.status}</p>
                        {(isCompleted || isFuture) && (
                          <p className="tracking-date">
                            {isFuture ? t.expectedAt : ''}{isCompleted ? orderTracking.date : status.date}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Col>
            </Row>

            {/* Show Map if status is "Accepted" or beyond */}
            {shouldShowMap() && (
              <Row className="mb-4">
                <Col>
                  <h5 className={`mb-3 ${language === 'ar' ? 'text-end' : 'text-start'}`}>
                    {language === 'ar' ? 'تتبع الطلب على الخريطة' : 'Track Order on Map'}
                  </h5>
                  <div style={{ height: '400px', width: '100%' }}>
                    <MapContainer center={storeLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={storeLocation}>
                        <Popup>{t.map.store}</Popup>
                      </Marker>
                      <Marker position={customerLocation}>
                        <Popup>{t.map.customer}</Popup>
                      </Marker>
                      <Polyline positions={polyline} color="blue" />
                    </MapContainer>
                  </div>
                </Col>
              </Row>
            )}

            {order.address && (
              <Row className="mb-4">
                <Col>
                  <h5 className={`mb-3 ${language === 'ar' ? 'text-end' : 'text-start'}`}>
                    {t.deliveryAddress}
                  </h5>
                  <div className={language === 'ar' ? 'text-end' : 'text-start'}>
                    <p className="mb-1"><strong>{order.address.label}</strong></p>
                    <p className="mb-1">{order.address.street}</p>
                    <p className="mb-1">
                      {order.address.aptNo ? `Apt No: ${order.address.aptNo}, ` : ''}
                      {order.address.floor ? `Floor: ${order.address.floor}` : ''}
                    </p>
                    <p className="mb-1">{order.address.description || 'No additional details'}</p>
                  </div>
                </Col>
              </Row>
            )}

            <Row className={language === 'ar' ? 'flex-row-reverse' : ''}>
              <Col md={8}>
                <h5 className={`mb-3 ${language === 'ar' ? 'text-end' : 'text-start'}`}>
                  {t.products}
                </h5>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div
                      key={index}
                      className={`product-item d-flex align-items-center mb-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                    >
                      <img
                        src={item.image
                          ? `${process.env.REACT_APP_API_URL}/storage/${item.image}`
                          : '/assets/placeholder.jpg'}
                        alt={language === 'ar' && item.name_ar ? item.name_ar : item.name}
                        className="product-image"
                        onError={(e) => {
                          console.warn(`Failed to load image for ${item.name}: ${item.image}`);
                          e.target.src = '/assets/placeholder.jpg';
                        }}
                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                      />
                      <div className={`flex-grow-1 ${language === 'ar' ? 'text-end mr-3' : 'text-start ml-3'}`}>
                        <p className="mb-0">{language === 'ar' && item.name_ar ? item.name_ar : item.name}</p>
                        <p className="mb-0">
                          {item.quantity} x {language === 'ar' ? 'ج.م.' : 'EGP'} {parseFloat(item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>{t.noItems}</p>
                )}
              </Col>
              <Col md={4} className={language === 'ar' ? 'text-left' : 'text-right'}>
                {canEditOrder() && (
                  <Button variant="outline-success" onClick={handleEditOrder}>
                    {t.editOrder}
                  </Button>
                )}
              </Col>
            </Row>
          </>
        )}
      </Container>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header>
          <Modal.Title className={language === 'ar' ? 'text-end w-100' : ''}>
            {t.modal.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className={`text-center ${language === 'ar' ? 'text-end' : ''}`}>
            {t.modal.message}
          </p>
          <div className="d-flex justify-content-center mb-3">
            <Button variant="success" disabled>
              {t.modal.preparing}
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer className={language === 'ar' ? 'flex-row-reverse' : ''}>
          <Button variant="outline-success" onClick={() => setShowEditModal(false)}>
            {t.modal.keepAsIs}
          </Button>
          <Button variant="success" onClick={confirmEditOrder}>
            {t.modal.editOrder}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default TrackOrder;
