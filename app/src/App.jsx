import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CategoryWrapper from './pages/CategoryWrapper';
import ProductWrapper from './pages/ProductWrapper';
import AdminDashboard from './pages/AdminDashboard';
import BrandsPage from './pages/BrandsPage';
import BrandWrapper from './pages/BrandWrapper';
import AllProductsPage from './pages/AllProductsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:id" element={<CategoryWrapper />} />
        <Route path="/product/:id" element={<ProductWrapper />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/brands" element={<BrandsPage />} />
        <Route path="/brand/:id" element={<BrandWrapper />} />
        <Route path="/products" element={<AllProductsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
