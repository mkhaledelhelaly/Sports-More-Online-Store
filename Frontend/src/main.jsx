import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import CartProvider from './context/CartContext.jsx'; // Import CartProvider, not CartContext

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider> {/* Use CartProvider here */}
      <App />
    </CartProvider>
  </StrictMode>
);
