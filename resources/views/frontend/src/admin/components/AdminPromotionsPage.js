import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Badge, Button, Dropdown, Modal, Form } from 'react-bootstrap';
import Sidebar from './Sidebar';
import '../styles/styles.css';

function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPromo, setCurrentPromo] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_percentage: '',
    expiration_date: '',
    is_active: true,
  });
  const navigate = useNavigate();

  // Fetch promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          navigate('/admin/login');
          return;
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/promotions`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.status === 401) {
          setError('Session expired. Please login again.');
          navigate('/admin/login');
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch promotions');
        }

        const data = await response.json();
        setPromotions(data);
      } catch (error) {
        console.error('Error fetching promotions:', error);
        setError(error.message);
      }
    };
    fetchPromotions();
  }, [navigate]);

  // Handle create/edit modal
  const handleShowModal = (promo = null) => {
    if (promo) {
      setIsEditMode(true);
      setCurrentPromo(promo);
      setFormData({
        code: promo.code,
        discount_percentage: promo.discount_percentage,
        expiration_date: promo.expiration_date.split(' ')[0], // Format for input type="date"
        is_active: promo.is_active,
      });
    } else {
      setIsEditMode(false);
      setCurrentPromo(null);
      setFormData({
        code: '',
        discount_percentage: '',
        expiration_date: '',
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setCurrentPromo(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditMode
        ? `${process.env.REACT_APP_API_URL}/api/admin/promotions/${currentPromo.id}`
        : `${process.env.REACT_APP_API_URL}/api/admin/promotions`;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(isEditMode ? 'Failed to update promotion' : 'Failed to create promotion');
      }

      const updatedPromo = await response.json();
      if (isEditMode) {
        setPromotions(promotions.map((promo) => (promo.id === updatedPromo.id ? updatedPromo : promo)));
      } else {
        setPromotions([...promotions, updatedPromo]);
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving promotion:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/api/admin/promotions/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setPromotions(promotions.filter((promo) => promo.id !== id));
      } catch (error) {
        console.error('Error deleting promotion:', error);
        setError('Error deleting promotion');
      }
    }
  };

  return (
    <div className="d-flex admin-promotions-page">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/admin/dashboard">Home</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Promotions
            </li>
          </ol>
        </nav>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Promotions</h2>
          <Button variant="success" onClick={() => handleShowModal()}>
            Add Promotion
          </Button>
        </div>
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        <div className="card">
          <div className="card-body p-0">
            {promotions.length > 0 ? (
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount (%)</th>
                    <th>Expiration Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((promo) => (
                    <tr key={promo.id}>
                      <td>{promo.code}</td>
                      <td>{promo.discount_percentage}%</td>
                      <td>{new Date(promo.expiration_date).toLocaleDateString()}</td>
                      <td>
                        <Badge className={`badge-status ${promo.is_active ? 'active' : 'inactive'}`}>
                          {promo.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-primary" className="btn-action" id={`dropdown-${promo.id}`}>
                            Actions
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleShowModal(promo)}>
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDelete(promo.id)}>
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="p-3">No promotions available.</p>
            )}
          </div>
        </div>

        {/* Modal for Create/Edit Promotion */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{isEditMode ? 'Edit Promotion' : 'Add Promotion'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Code</Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleFormChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Discount Percentage</Form.Label>
                <Form.Control
                  type="number"
                  name="discount_percentage"
                  value={formData.discount_percentage}
                  onChange={handleFormChange}
                  min="0"
                  max="100"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Expiration Date</Form.Label>
                <Form.Control
                  type="date"
                  name="expiration_date"
                  value={formData.expiration_date}
                  onChange={handleFormChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleFormChange}
                />
              </Form.Group>
              <Button variant="success" type="submit">
                {isEditMode ? 'Update' : 'Create'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default AdminPromotionsPage;
