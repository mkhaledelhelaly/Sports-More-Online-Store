import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './AddressPage.css';
import CartTotals from '../components/CartTotals';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";


const CheckoutForm = () => {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creditCardDetails, setCreditCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const { fetchCartCount } = useContext(CartContext);

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  });

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
        headers: {
          token: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setCartItems(response.data.products.filter((item) => item.product));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cart items:', err.message);
      setError('Failed to load cart items. Please try again later.');
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
        headers: {
          token: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      const addressParts = res.data.address ? res.data.address.split(',').map(part => part.trim()) : [];
  
      setAddress({
        street: addressParts[0] || '',
        city: addressParts[1] || '',
        state: addressParts[2] || '',
        zipCode: addressParts[3] || '',
        country: addressParts[4] || '',
        phone: res.data.phoneNumber || '',
      });
  
    } catch (err) {
      toast.error("Failed to load user data.");
    }
  };
  

  useEffect(() => {
    fetchCartItems();
    fetchUserData();
  }, []);

  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreditCardChange = (e) => {
    const { name, value } = e.target;
    setCreditCardDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/promo/apply`,
        { code: coupon }
      );
      setDiscount(response.data.discountPercent);
      toast.success(`Coupon applied! ${response.data.discountPercent}% discount added.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply coupon.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !address.street ||
      !address.city ||
      !address.state ||
      !address.zipCode ||
      !address.country ||
      !address.phone
    ) {
      toast.error('Please fill in all address fields.');
      return;
    }

    if (!selectedPayment) {
      toast.error('Please select a payment method.');
      return;
    }

    if (selectedPayment === 'Credit Card') {
      // Validate credit card details
      const cardNumberRegex = /^[0-9]{16}$/; // 16-digit card number
      const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/; // MM/YY format
      const cvvRegex = /^[0-9]{3,4}$/; // 3 or 4-digit CVV

      if (!cardNumberRegex.test(creditCardDetails.cardNumber)) {
        toast.error('Card number must be 16 digits.');
        return;
      }

      if (!expiryDateRegex.test(creditCardDetails.expiryDate)) {
        toast.error('Expiry date must be in MM/YY format.');
        return;
      }

      if (!cvvRegex.test(creditCardDetails.cvv)) {
        toast.error('CVV must be 3 or 4 digits.');
        return;
      }
    }

    // Place order
    await placeOrder();
  };

  const placeOrder = async () => {
    try {
      const shippingFee = address.state?.toLowerCase() === "cairo" ? 5 : 10; // Calculate shipping fee

      // Fetch cart items with product details to check stock
      const cartResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
        headers: {
          token: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const cartProducts = cartResponse.data.products;

      // Check if any product exceeds available stock
      for (const item of cartProducts) {
        if (item.quantity > item.product.quantity) {
          toast.error(`Insufficient stock for product: ${item.product.title}. Available: ${item.product.quantity}`);
          return; // Stop the order process
        }
      }

      // Save address and phone number
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
        {
          address: `${address.street}, ${address.city}, ${address.state}, ${address.zipCode}, ${address.country}`,
          phoneNumber: address.phone, // Include phone number
        },
        {
          headers: {
            token: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success('Address and phone number saved successfully!');

      // Place order with discount
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/createOrder`,
        { shippingFee, selectedPayment, discount }, // Include discount
        {
          headers: {
            token: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      toast.success('Order placed successfully!');
      console.log('Order details:', response.data);

      // Clear form and reset state
      setAddress({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: '',
      });
      setSelectedPayment('');
      setCreditCardDetails({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
      });

      // Fetch updated cart items
      fetchCartItems();
      fetchCartCount();

      navigate(`/orders`);
    } catch (err) {
      console.error('Error saving address or placing order:', err.message);
      toast.error('Failed to save address or place order. Please try again.');
    }
  };

  if (loading) return <p>Loading cart items...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="checkout-container">
      <div className="form-section">
        <h2 className="section-title">DELIVERY INFORMATION</h2>
        <form className="delivery-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              name="street"
              placeholder="Street"
              className="input-field full"
              value={address.street}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              name="city"
              placeholder="City"
              className="input-field half"
              value={address.city}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              className="input-field half"
              value={address.state}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              name="zipCode"
              placeholder="Zip code"
              className="input-field half"
              value={address.zipCode}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              className="input-field half"
              value={address.country}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-row">
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              className="input-field full"
              value={address.phone}
              onChange={handleInputChange}
            />
          </div>
        </form>
      </div>

      <div className="cart-section">
        <h2 className="section-title">CART TOTALS</h2>
        <CartTotals items={cartItems} showCheckoutButton={false} state={address.state} discount={discount} />

        <h2 className="section-title payment-title">PAYMENT METHOD</h2>
        <div className="payment-options">
          <div
            className={`payment-option ${selectedPayment === 'Credit Card' ? 'selected' : ''}`}
            onClick={() => handlePaymentSelect('Credit Card')}
          >
            <input
              type="radio"
              name="payment"
              checked={selectedPayment === 'Credit Card'}
              onChange={() => {}}
            />
            <span className="payment-name">Credit Card</span>
          </div>

          <div
            className={`payment-option ${selectedPayment === 'cash' ? 'selected' : ''}`}
            onClick={() => handlePaymentSelect('cash')}
          >
            <input
              type="radio"
              name="payment"
              checked={selectedPayment === 'cash'}
              onChange={() => {}}
            />
            <span className="payment-name">CASH ON DELIVERY</span>
          </div>
        </div>

        {selectedPayment === 'Credit Card' && (
          <div className="credit-card-details">
            <h2>Enter Credit Card Details</h2>
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={creditCardDetails.cardNumber}
              onChange={handleCreditCardChange}
              maxLength="16" // Limit to 16 digits
              inputMode="numeric" // Show numeric keyboard on mobile
              pattern="[0-9]{16}" // Ensure only 16 digits are allowed
              title="Card number must be 16 digits."
            />
            <input
              type="text"
              name="expiryDate"
              placeholder="Expiry Date (MM/YY)"
              value={creditCardDetails.expiryDate}
              onChange={handleCreditCardChange}
              pattern="(0[1-9]|1[0-2])\/\d{2}" // MM/YY format
              title="Expiry date must be in MM/YY format."
            />
            <input
              type="text"
              name="cvv"
              placeholder="CVV"
              value={creditCardDetails.cvv}
              onChange={handleCreditCardChange}
              maxLength="4" // Limit to 4 digits
              inputMode="numeric" // Show numeric keyboard on mobile
              pattern="[0-9]{3,4}" // Ensure only 3 or 4 digits are allowed
              title="CVV must be 3 or 4 digits."
            />
          </div>
        )}

        <div className="coupon-section">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="coupon-input"
          />
          <button className="apply-coupon-button" onClick={handleApplyCoupon}>
            Apply Coupon
          </button>
        </div>
        {discount > 0 && (
          <div className="discount-row">
            <span>Discount Applied:</span>
            <span>-{discount}%</span>
          </div>
        )}

        <button className="place-order-btn" onClick={handleSubmit}>
          PLACE ORDER
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default CheckoutForm;