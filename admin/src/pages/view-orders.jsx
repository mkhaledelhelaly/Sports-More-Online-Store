import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token'); // Get the token for authentication
      if (!token) {
        toast.error('You are not authorized to view orders.');
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/admin/getAllOrders`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            token: `Bearer ${token}`, // Pass the token in the Authorization header
          },
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Fetched orders:', data.orders); // Log the fetched orders
        setOrders(data.orders);
        setLoading(false);
      } catch (error) {
        toast.error(error.message || 'Error fetching orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('token'); // Get the token for authentication
    if (!token) {
      toast.error('You are not authorized to change the order status.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/updateStatus/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          token: `Bearer ${token}`, // Pass the token in the Authorization header
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      const updatedOrder = await response.json();
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId ? { ...order, status: updatedOrder.order.status } : order
        )
      );
      toast.success('Order status updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Error updating order status');
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center mt-8">No orders found.</div>;
  }

  // Filter canceled orders
  const canceledOrders = orders.filter((order) => order.status === 'cancelled');

  return (
    <div className="p-4 sm:p-8">
      <ToastContainer />
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">All Orders</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Order ID</th>
              <th className="border border-gray-300 p-2">User</th>
              <th className="border border-gray-300 p-2">Address</th> {/* New Address Column */}
              <th className="border border-gray-300 p-2">Items</th>
              <th className="border border-gray-300 p-2">Total Amount</th>
              <th className="border border-gray-300 p-2">Status</th>
              <th className="border border-gray-300 p-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId.slice(-6)} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">{order.orderId.slice(-6)}</td>
                <td className="border border-gray-300 p-2">
                  <div>
                    <span className="font-bold">{order.user.username}</span>
                    <br />
                    <span className="text-sm text-gray-600">{order.user.email}</span>
                    <br />
                    <span className="text-sm text-gray-600">Phone: {order.user.phoneNumber || 'Not provided'}</span>
                  </div>
                </td>
                <td className="border border-gray-300 p-2">{order.user.address || 'Not provided'}</td> {/* Display Address */}
                <td className="border border-gray-300 p-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="mb-2">
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="inline-block w-12 h-12 mr-2 rounded"
                      />
                      <div>
                        <span className="font-bold">{item.product.title}</span>
                        <div className="text-sm text-gray-600">
                          <span>Size: {item.size || 'N/A'}</span>
                          <br />
                          <span>Color: {item.color || 'N/A'}</span>
                        </div>
                        <div>
                          {item.quantity} x ${item.product.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </td>
                <td className="border border-gray-300 p-2">
                  {order.discount > 0 && (
                    <span className="text-sm text-gray-600">
                      ({order.discount}% off)
                    </span>
                  )}
                  <br />
                  <span className="font-bold">${order.totalAmount.toFixed(2)}</span>
                  <br />
                  <span className="text-sm text-gray-600">Payment Method: {order.paymentMethod}</span>
                </td>
                <td className="border border-gray-300 p-2 capitalize">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                    className="p-1 border border-gray-300 rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="border border-gray-300 p-2">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Canceled Orders Table */}
      {canceledOrders.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">Canceled Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-2">Order ID</th>
                  <th className="border border-gray-300 p-2">User</th>
                  <th className="border border-gray-300 p-2">Address</th> {/* New Address Column */}
                  <th className="border border-gray-300 p-2">Reason</th>
                  <th className="border border-gray-300 p-2">Total Amount</th>
                  <th className="border border-gray-300 p-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {canceledOrders.map((order) => (
                  <tr key={order.orderId.slice(-6)} className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-2">{order.orderId.slice(-6)}</td>
                    <td className="border border-gray-300 p-2">
                      <div>
                        <span className="font-bold">{order.user.username}</span>
                        <br />
                        <span className="text-sm text-gray-600">{order.user.email}</span>
                        <br></br>
                        <span className="text-sm text-gray-600">Phone: {order.user.phoneNumber || 'Not provided'}</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-2">{order.user.address || 'Not provided'}</td> {/* Display Address */}
                    <td className="border border-gray-300 p-2">
                      {order.cancellationReason || 'No reason provided'}
                    </td>
                    <td className="border border-gray-300 p-2">${order.totalAmount.toFixed(2)}</td>
                    <td className="border border-gray-300 p-2">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewOrders;