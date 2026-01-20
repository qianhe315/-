import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Button, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import api from '../services/api';
import '../styles/Header.scss';

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [mobileVisible, setMobileVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.categories.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileVisible(false);
  }, [location.pathname]);

  const menuItems = [
    {
      key: 'home',
      label: <Link to="/">Home</Link>,
    },
    {
      key: 'products',
      label: 'Products',
      children: categories.map(category => ({
        key: `category-${category.id}`,
        label: <Link to={`/products/category/${category.id}`}>{category.name}</Link>,
      })),
    },
    {
      key: 'about',
      label: <Link to="/about">About Us</Link>,
    },
    {
      key: 'company',
      label: 'Company',
      children: [
        {
          key: 'brand-story',
          label: <Link to="/company/brand-story">Brand Story</Link>,
        },
        {
          key: 'production',
          label: <Link to="/company/production">Production</Link>,
        },
        {
          key: 'quality',
          label: <Link to="/company/quality">Quality</Link>,
        },
        {
          key: 'clients',
          label: <Link to="/company/clients">Clients</Link>,
        },
      ],
    },
    {
      key: 'contact',
      label: <Link to="/contact">Contact</Link>,
    },
  ];

  const mobileMenuItems = [
    ...menuItems.map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.map(child => ({
            ...child,
            label: (
              <div onClick={() => setMobileVisible(false)}>
                {child.label}
              </div>
            ),
          })),
        };
      }
      return {
        ...item,
        label: (
          <div onClick={() => setMobileVisible(false)}>
            {item.label}
          </div>
        ),
      };
    }),
  ];

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        <div className="logo">
          <Link to="/">
            <h1 className="logo-text">STAR LEAP</h1>
          </Link>
        </div>

        {/* Desktop Menu */}
        <nav className="desktop-menu">
          <Menu
            mode="horizontal"
            items={menuItems}
            selectedKeys={[]}
            style={{
              borderBottom: 'none',
              backgroundColor: 'transparent',
              fontSize: '1rem',
              fontWeight: '500',
              letterSpacing: '0.02em'
            }}
            className="main-menu"
          />
        </nav>

        {/* Mobile Menu Button */}
        <div className="mobile-menu-btn">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileVisible(true)}
            className="menu-button"
            style={{
              fontSize: '1.25rem',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          />
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileVisible(false)}
        open={mobileVisible}
        size="large"
        styles={{
          header: {
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            borderBottom: 'none',
            padding: '16px 24px',
            fontSize: '1.25rem',
            fontWeight: '600'
          },
          body: {
            padding: 0
          }
        }}
        style={{
          borderRadius: '16px 0 0 16px',
        }}
      >
        <Menu
          mode="inline"
          items={mobileMenuItems}
          selectedKeys={[]}
          style={{
            borderRight: 'none',
            backgroundColor: 'white',
            fontSize: '1rem',
            fontWeight: '500'
          }}
          className="mobile-menu"
        />
      </Drawer>
    </header>
  );
};

export default Header;
