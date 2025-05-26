import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Nav from './components/nav';
import Sidebar from './components/sidebar';
import Login from './components/login';
import AddProduct from './pages/app-product';
import AddCategory from './pages/add-category';
import ListProducts from './pages/list-products';
import EditProduct from './pages/edit-protuct';
import ViewOrders from './pages/view-orders';
import AddPromo from './pages/add-promo';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true); 
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false); 
    localStorage.removeItem('token'); // Clear the token on logout
  };

  if (!isLoggedIn) {
    return <Login onLogin={setIsLoggedIn} />;
  }

  return (
    <Router>
<div className="flex flex-col min-h-screen">
  <Nav onLogout={handleLogout} />
  <div className="flex flex-1">
    <Sidebar />
    <div className="flex-1 p-4">
      <Routes>
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/add-category" element={<AddCategory />} />
        <Route path="/list-products" element={<ListProducts />} />
        <Route path="/edit-product/:id" element={<EditProduct />} />
        <Route path="/view-orders" element={<ViewOrders />} />
        <Route path="/add-promo" element={<AddPromo />} />
      </Routes>
    </div>
  </div>
</div>

    </Router>
  );
};

export default App;