import React, { useState, useContext, useEffect } from 'react';
import { Nav, Tab, Row, Col, Button, Container, Collapse } from 'react-bootstrap';
import AccountSidebar from '../components/AccountSidebar';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import '../styles/MyOrders.css';

function MyOrders() {
    const { user } = useContext(AuthContext);
    const { language } = useContext(LanguageContext);
    const navigate = useNavigate();
    const [orderTab, setOrderTab] = useState('upcoming');
    const [orders, setOrders] = useState({ past: [], upcoming: [] });
    const [openOrderId, setOpenOrderId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const translations = {
        en: {
            title: 'My Orders',
            tabs: {
                past: 'Past',
                upcoming: 'Upcoming',
            },
            noPastOrders: 'No past orders found.',
            noUpcomingOrders: 'No upcoming orders found.',
            orderNumber: 'Order #{id}',
            orderDelivered: 'Order delivered',
            orderPlaced: 'Order placed',
            total: 'Total: EGP {amount}',
            shippingFees: 'Shipping fees: EGP {amount}',
            subtotal: 'Subtotal: EGP {amount}',
            items: 'Items:',
            itemDetails: '{name} - {quantity} x EGP {price}',
            showDetails: 'Show Details',
            hideDetails: 'Hide Details',
            loading: 'Loading orders...',
            error: 'Orders functionality is not yet implemented on the backend.',
        },
        ar: {
            title: 'طلباتي',
            tabs: {
                past: 'السابقة',
                upcoming: 'القادمة',
            },
            noPastOrders: 'لم يتم العثور على طلبات سابقة.',
            noUpcomingOrders: 'لم يتم العثور على طلبات قادمة.',
            orderNumber: 'الطلب #{id}',
            orderDelivered: 'تم تسليم الطلب',
            orderPlaced: 'تم تقديم الطلب',
            total: 'الإجمالي: {amount} ج.م.',
            shippingFees: 'رسوم الشحن: {amount} ج.م.',
            subtotal: 'المجموع الفرعي: {amount} ج.م.',
            items: 'المنتجات:',
            itemDetails: '{name} - {quantity} × {price} ج.م.',
            showDetails: 'إظهار التفاصيل',
            hideDetails: 'إخفاء التفاصيل',
            loading: 'جارٍ تحميل الطلبات...',
            error: 'وظيفة الطلبات لم يتم تنفيذها بعد على الخادم.',
        },
    };

    const t = translations[language];

    useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/orders`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                let errorData = {};
                if (contentType && contentType.includes('application/json')) {
                    errorData = await response.json();
                } else {
                    const text = await response.text();
                    console.error('Non-JSON response:', text);
                    errorData = { message: 'Server error' };
                }
                throw new Error(errorData.message || 'Failed to fetch orders');
            }

            const data = await response.json();
            console.log('Fetched orders:', data);
            if (isMounted) {
                const pastOrders = data
                    .filter(order => ['delivered', 'cancelled'].includes(order.status))
                    .map(order => ({
                        id: order.id,
                        status: order.status,
                        total: parseFloat(order.total),
                        date: new Date(order.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US'),
                        shipping: parseFloat(order.shipping || 0),
                        items: order.items.map(item => ({
                            name: item.product.name,
                            name_ar: item.product.name_ar,
                            quantity: item.quantity,
                            price: parseFloat(item.price),
                        })),
                    }));
                const upcomingOrders = data
                    .filter(order => ['pending', 'processing', 'shipped'].includes(order.status))
                    .map(order => ({
                        id: order.id,
                        status: order.status,
                        total: parseFloat(order.total),
                        date: new Date(order.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US'),
                        shipping: parseFloat(order.shipping || 0),
                        items: order.items.map(item => ({
                            name: item.product.name,
                            name_ar: item.product.name_ar,
                            quantity: item.quantity,
                            price: parseFloat(item.price),
                        })),
                    }));
                setOrders({ past: pastOrders, upcoming: upcomingOrders });
                setError('');
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            if (isMounted) {
                setError(err.message || t.error);
            }
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    };

    fetchOrders();

    return () => {
        isMounted = false;
    };
}, [user, language, t.error]);

    if (!user) {
        navigate('/login');
        return null;
    }

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
                <p>{error}</p>
            </Container>
        );
    }

    const toggleDetails = (orderId) => {
        setOpenOrderId(openOrderId === orderId ? null : orderId);
    };

    return (
        <div className="my-account-page">
            <Container className="py-5">
                <h2 className={`section-title mb-4 ${language === 'ar' ? 'text-end' : 'text-start'}`}>
                    {t.title}
                </h2>
                <Row>
                    <Col md={3}>
                        <AccountSidebar />
                    </Col>
                    <Col md={9}>
                        <div className="my-orders">
                            <Tab.Container
                                id="order-tabs"
                                activeKey={orderTab}
                                onSelect={(key) => setOrderTab(key)}
                            >
                                <Nav
                                    variant="tabs"
                                    className={`mb-4 justify-content-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                                    style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
                                >
                                    <Nav.Item>
                                        <Nav.Link eventKey="past">{t.tabs.past}</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="upcoming">{t.tabs.upcoming}</Nav.Link>
                                    </Nav.Item>
                                </Nav>

                                <Tab.Content>
                                    <Tab.Pane eventKey="past">
                                        {orders.past.length > 0 ? (
                                            orders.past.map((order) => (
                                                <div key={order.id} className="order-item mb-3 p-3">
                                                    <Row className="align-items-center">
                                                        <Col xs={12}>
                                                            <h5
                                                                className={`order-title ${language === 'ar' ? 'text-end' : 'text-start'}`}
                                                            >
                                                                {t.orderNumber.replace('{id}', order.id)}
                                                            </h5>
                                                            <div
                                                                className={`d-flex justify-content-between align-items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                                                            >
                                                                <div>
                                                                    <p
                                                                        className={`order-status mb-0 ${language === 'ar' ? 'text-end' : 'text-start'}`}
                                                                    >
                                                                        {order.status === 'delivered' ? t.orderDelivered : order.status}
                                                                    </p>
                                                                    <p
                                                                        className={`order-total mb-0 ${language === 'ar' ? 'text-end' : 'text-start'}`}
                                                                    >
                                                                        {t.total.replace(
                                                                            '{amount}',
                                                                            parseFloat(order.total || 0).toFixed(2)
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <Button
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    onClick={() => toggleDetails(order.id)}
                                                                    aria-controls={`collapse-details-${order.id}`}
                                                                    aria-expanded={openOrderId === order.id}
                                                                >
                                                                    {openOrderId === order.id ? t.hideDetails : t.showDetails}
                                                                </Button>
                                                            </div>
                                                            <Collapse in={openOrderId === order.id}>
                                                                <div id={`collapse-details-${order.id}`} className="mt-3">
                                                                    <p
                                                                        className={`order-date ${language === 'ar' ? 'text-end' : 'text-start'}`}
                                                                    >
                                                                        {order.date}
                                                                    </p>
                                                                    <p
                                                                        className={`order-shipping ${language === 'ar' ? 'text-end' : 'text-start'}`}
                                                                    >
                                                                        {t.shippingFees.replace(
                                                                            '{amount}',
                                                                            parseFloat(order.shipping || 0).toFixed(2)
                                                                        )}
                                                                    </p>
                                                                    <p
                                                                        className={`order-subtotal ${language === 'ar' ? 'text-end' : 'text-start'}`}
                                                                    >
                                                                        {t.subtotal.replace(
                                                                            '{amount}',
                                                                            (
                                                                                parseFloat(order.total || 0) - parseFloat(order.shipping || 0)
                                                                            ).toFixed(2)
                                                                        )}
                                                                    </p>
                                                                    {order.items && order.items.length > 0 && (
                                                                        <div
                                                                            className={`order-items ${language === 'ar' ? 'text-end' : 'text-start'}`}
                                                                        >
                                                                            <strong>{t.items}</strong>
                                                                            {order.items.map((item, index) => (
                                                                                <p key={index} className="mb-0">
                                                                                    {t.itemDetails
                                                                                        .replace('{name}', item.name)
                                                                                        .replace('{quantity}', item.quantity)
                                                                                        .replace('{price}', parseFloat(item.price).toFixed(2))}
                                                                                </p>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </Collapse>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            ))
                                        ) : (
                                            <p className={language === 'ar' ? 'text-end' : 'text-start'}>
                                                {t.noPastOrders}
                                            </p>
                                        )}
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="upcoming">
                                        {orders.upcoming.length > 0 ? (
                                            orders.upcoming.map((order) => (
                                                <div key={order.id} className="order-item mb-3 p-3">
                                                    <Row className="align-items-center">
                                                        <Col xs={12}>
                                                            <h5
                                                                className={`order-title ${language === 'ar' ? 'text-end' : 'text-start'}`}
                                                            >
                                                                {t.orderNumber.replace('{id}', order.id)}
                                                            </h5>
                                                            <div
                                                                className={`d-flex justify-content-between align-items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                                                            >
                                                                <div>
                                                                    <p
                                                                        className={`order-status mb-0 ${language === 'ar' ? 'text-end' : 'text-start'}`}
                                                                    >
                                                                        {order.status === 'pending' ? t.orderPlaced : order.status}
                                                                    </p>
                                                                    <p
                                                                        className={`order-total mb-0 ${language === 'ar' ? 'text-end' : 'text-start'}`}
                                                                    >
                                                                        {t.total.replace(
                                                                            '{amount}',
                                                                            parseFloat(order.total || 0).toFixed(2)
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <Button
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    onClick={() => toggleDetails(order.id)}
                                                                    aria-controls={`collapse-details-${order.id}`}
                                                                    aria-expanded={openOrderId === order.id}
                                                                >
                                                                    {openOrderId === order.id ? t.hideDetails : t.showDetails}
                                                                </Button>
                                                            </div>
                                                            <Collapse in={openOrderId === order.id}>
                                                                <div id={`collapse-details-${order.id}`} className="mt-3">
                                                                    <p
                                                                        className={`order-date ${language === 'ar' ? 'text-end' : 'text-start'}`}
                                                                    >
                                                                        {order.date}
                                                                    </p>
                                                                    <p
                                                                        className={`order-shipping ${language === 'ar' ? 'text-end' : 'text-start'}`}
                                                                    >
                                                                        {t.shippingFees.replace(
                                                                            '{amount}',
                                                                            parseFloat(order.shipping || 0).toFixed(2)
                                                                        )}
                                                                    </p>
                                                                    <p
                                                                        className={`order-subtotal ${language === 'ar' ? 'text-end' : 'text-start'}`}
                                                                    >
                                                                        {t.subtotal.replace(
                                                                            '{amount}',
                                                                            (
                                                                                parseFloat(order.total || 0) - parseFloat(order.shipping || 0)
                                                                            ).toFixed(2)
                                                                        )}
                                                                    </p>
                                                                    {order.items && order.items.length > 0 && (
                                                                        <div
                                                                            className={`order-items ${language === 'ar' ? 'text-end' : 'text-start'}`}
                                                                        >
                                                                            <strong>{t.items}</strong>
                                                                            {order.items.map((item, index) => (
                                                                                <p key={index} className="mb-0">
                                                                                    {t.itemDetails
                                                                                        .replace('{name}', item.name)
                                                                                        .replace('{quantity}', item.quantity)
                                                                                        .replace('{price}', parseFloat(item.price).toFixed(2))}
                                                                                </p>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </Collapse>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            ))
                                        ) : (
                                            <p className={language === 'ar' ? 'text-end' : 'text-start'}>
                                                {t.noUpcomingOrders}
                                            </p>
                                        )}
                                    </Tab.Pane>
                                </Tab.Content>
                            </Tab.Container>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default MyOrders;
