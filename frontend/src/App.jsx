import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import BrandStory from './pages/BrandStory';
import ProductionProcess from './pages/ProductionProcess';
import QualityCertification from './pages/QualityCertification';
import Clients from './pages/Clients';
import About from './pages/About';
import Contact from './pages/Contact';
// Admin pages
import Login from './admin/pages/Login';
import Dashboard from './admin/pages/Dashboard';
import ProductManagement from './admin/pages/ProductManagement';
import CategoryManagement from './admin/pages/CategoryManagement';
import CompanyInfoManagement from './admin/pages/CompanyInfoManagement';
import TeamMemberManagement from './admin/pages/TeamMemberManagement';
import ProductionProcessManagement from './admin/pages/ProductionProcessManagement';
import QualityCertificationManagement from './admin/pages/QualityCertificationManagement';
import ClientsManagement from './admin/pages/ClientsManagement';
import ContactsManagement from './admin/pages/ContactsManagement';
import CarouselManagement from './admin/pages/CarouselManagement';

// Admin components
import AdminLayout from './admin/components/Layout';
import './styles/global.scss';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Primary Colors
          colorPrimary: '#2563eb',
          colorPrimaryHover: '#3b82f6',
          colorPrimaryActive: '#1d4ed8',
          colorPrimaryBorder: '#3b82f6',
          
          // Secondary Colors
          colorSecondary: '#f97316',
          colorSecondaryHover: '#fdba74',
          colorSecondaryActive: '#ea580c',
          
          // Font Size
          fontSize: 16,
          fontSizeLG: 18,
          fontSizeSM: 14,
          fontSizeXS: 12,
          
          // Font Weight
          fontWeightStrong: 700,
          fontWeightNormal: 500,
          
          // Border Radius
          borderRadius: 8,
          borderRadiusLG: 12,
          borderRadiusSM: 6,
          
          // Shadow
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          boxShadowSecondary: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          
          // Spacing
          marginXS: 4,
          marginSM: 8,
          margin: 16,
          marginLG: 24,
          marginXL: 32,
          
          paddingXS: 4,
          paddingSM: 8,
          padding: 16,
          paddingLG: 24,
          paddingXL: 32,
          
          // Line Height
          lineHeight: 1.65,
          lineHeightLG: 1.75,
          lineHeightSM: 1.5,
        },
      }}
    >
      <AntApp>
        <Router>
        <Routes>
          {/* Admin routes - no Header/Footer */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/products" element={<AdminLayout><ProductManagement /></AdminLayout>} />
          <Route path="/admin/categories" element={<AdminLayout><CategoryManagement /></AdminLayout>} />
          <Route path="/admin/company-info" element={<AdminLayout><CompanyInfoManagement /></AdminLayout>} />
          <Route path="/admin/team-members" element={<AdminLayout><TeamMemberManagement /></AdminLayout>} />
          <Route path="/admin/production" element={<AdminLayout><ProductionProcessManagement /></AdminLayout>} />
          <Route path="/admin/quality" element={<AdminLayout><QualityCertificationManagement /></AdminLayout>} />
          <Route path="/admin/clients" element={<AdminLayout><ClientsManagement /></AdminLayout>} />
          <Route path="/admin/contacts" element={<AdminLayout><ContactsManagement /></AdminLayout>} />
          <Route path="/admin/carousel" element={<AdminLayout><CarouselManagement /></AdminLayout>} />

          
          {/* Frontend public routes - with Header/Footer */}
          <Route path="/*" element={
            <div className="app">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route index element={<Home />} />
                  <Route path="products" element={<Products />} />
                  <Route path="products/category/:categoryId" element={<Products />} />
                  <Route path="products/:id" element={<ProductDetail />} />
                  <Route path="about" element={<About />} />
                  <Route path="company/brand-story" element={<BrandStory />} />
                  <Route path="company/production" element={<ProductionProcess />} />
                  <Route path="company/quality" element={<QualityCertification />} />
                  <Route path="company/clients" element={<Clients />} />
                  <Route path="contact" element={<Contact />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
        </Router>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
