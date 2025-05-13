import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './OrdersPage.css';

const OrdersPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/getOrders`, {
          headers: {
            token: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('Fetched orders:', response.data.orders);
        setOrders(response.data.orders);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err.message);
        setError('Failed to load orders. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleCancelOrder = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/cancelOrder/${selectedOrderId}`,
        { reason: cancelReason },
        {
          headers: {
            token: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === selectedOrderId ? { ...order, status: 'cancelled' } : order
        )
      );
      
      // Show refund notification based on payment method after successful cancellation
      if (selectedPaymentMethod && selectedPaymentMethod.toLowerCase() === 'credit card') {
        toast.success('Your order has been cancelled. Refund will be processed to your credit card within 14 days.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
      } else {
          toast.success('Your order has been cancelled successfully.', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
      }
      
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedOrderId(null);
      setSelectedPaymentMethod(null);
    } catch (err) {
      console.error('Error cancelling order:', err.message);
      toast.error('Failed to cancel the order. Please try again.');
    }
  };

  const handleCancelClick = (order) => {
    setSelectedOrderId(order.orderId);
    setSelectedPaymentMethod(order.paymentMethod);
    setShowCancelModal(true);
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <ToastContainer position="top-center" autoClose={5000} />
      <div className="orders-header">
        <h1>My Orders</h1>
        <p className="order-count">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
      </div>

      <div className="order-tabs">
        {['all', 'pending', 'shipped', 'delivered'].map(tab => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">📦</div>
          <h2>No {activeTab !== 'all' ? activeTab : ''} orders found</h2>
          {activeTab !== 'all' ? (
            <button className="view-all-button" onClick={() => setActiveTab('all')}>
              View All Orders
            </button>
          ) : (
            <p>Your order history will appear here once you make a purchase.</p>
          )}
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order.orderId} className="order-card">
              <div className="order-summary" onClick={() => toggleOrderExpansion(order.orderId)}>
                <div className="order-info">
                  <div className="order-header">
                    <h2>Order #{order.orderId.slice(-6)}</h2>
                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  </div>
                  <div className="order-meta">
                    <div className="meta-item">
                      <span className="meta-label">Date:</span>
                      <span className="meta-value">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Items:</span>
                      <span className="meta-value">{order.items.length}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Total:</span>
                      <span className="meta-value price">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="expand-icon">
                  {expandedOrder === order.orderId ? '−' : '+'}
                </div>
              </div>

              {expandedOrder === order.orderId && (
                <div className="order-details">
                  <div className="order-timeline">
                    <div className={`timeline-step ${['pending', 'shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                      <div className="step-icon">✓</div>
                      <div className="step-label">Order Placed</div>
                    </div>
                    <div className="timeline-connector"></div>
                    <div className={`timeline-step ${['shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                      <div className="step-icon">📦</div>
                      <div className="step-label">Shipped</div>
                    </div>
                    <div className="timeline-connector"></div>
                    <div className={`timeline-step ${order.status === 'delivered' ? 'completed' : ''}`}>
                      <div className="step-icon">🏠</div>
                      <div className="step-label">Delivered</div>
                    </div>
                  </div>

                  <h3 className="items-heading">Order Items</h3>
                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-image-container">
                          <img src={item.product.image} alt={item.product.title} className="order-item-image" />
                        </div>
                        <div className="order-item-details">
                          <h4>{item.product.title}</h4>
                          <div className="item-attributes">
                            <div className="attribute">
                              <span className="attribute-label">Size:</span>
                              <span className="attribute-value">{item.product.sizes}</span>
                            </div>
                            <div className="attribute">
                              <span className="attribute-label">Color:</span>
                              <span className="attribute-value">{item.product.colors}</span>
                            </div>
                            <div className="attribute">
                              <span className="attribute-label">Quantity:</span>
                              <span className="attribute-value">{item.quantity}</span>
                            </div>
                          </div>
                          <div className="item-price">
                            <span>${item.product.price.toFixed(2)} × {item.quantity}</span>
                            <span className="item-subtotal">${item.subtotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-summary-footer">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>${order.subtotal.toFixed(2)}</span> {/* Total before discount */}
                    </div>
                    <div className="summary-row">
                      <span>Discount</span>
                      <span>-${order.discountAmount.toFixed(2)}</span> {/* Discount applied */}
                    </div>
                    <div className="summary-row">
                      <span>Discount Percentage</span>
                      <span>{order.discount}%</span> {/* Discount percentage */}
                    </div>
                    <div className="summary-row">
                      <span>Shipping</span>
                      <span>${order.shippingFee.toFixed(2)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>${order.totalAmount.toFixed(2)}</span> {/* Total after discount */}
                    </div>
                    <div className="summary-row">
                      <span>Payment Method</span>
                      <span>{order.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button
                      className="action-button primary"
                      onClick={() => navigate('/contact')}
                    >
                      Contact Support
                    </button>
                    {order.status !== 'cancelled' && (
                      <button
                        className="cancel-button"
                        onClick={() => handleCancelClick(order)}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCancelModal && (
        <div className="cancel-modal">
          <div className="modal-content">
            <h2>Cancel Order</h2>
            <textarea
              placeholder="Enter the reason for cancellation"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={handleCancelOrder}>Submit</button>
              <button onClick={() => setShowCancelModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;