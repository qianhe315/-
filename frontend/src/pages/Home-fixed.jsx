import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Card } from 'antd';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import '../styles/Home.scss';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [carousels, setCarousels] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [loading, setLoading] = useState(true);

  // Auto-rotation every 5 seconds
  useEffect(() => {
    if (carousels.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % carousels.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [carousels.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('开始获取数据...');
        
        const [productsData, categoriesData, carouselsData] = await Promise.all([
          api.products.getAll(),
          api.categories.getAll(),
          api.carousels.getAll()
        ]);
        
        console.log('获取到的轮播图数据:', carouselsData);
        console.log('获取到的产品数据:', productsData);
        console.log('获取到的分类数据:', categoriesData);
        
        setProducts(productsData.slice(0, 6)); // Show first 6 products
        setCategories(categoriesData);
        
        // Filter active carousels and map image_url to image for component compatibility
        const processedCarousels = carouselsData
          .filter(carousel => carousel.is_active === 1 || carousel.is_active === true)
          .map(carousel => ({
            ...carousel,
            image: carousel.image_url,
            buttonText: carousel.button_text,
            buttonLink: carousel.button_link,
            sortOrder: carousel.sort_order,
            isActive: carousel.is_active === 1 || carousel.is_active === true
          }));
        
        console.log('处理后的轮播图数据:', processedCarousels);
        setCarousels(processedCarousels);
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('错误详情:', error.response || error.message);
        
        // Only use fallback if we're in development or if there's a network error
        if (import.meta.env.DEV || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          console.log('使用fallback数据...');
          setCarousels([
            {
              id: 1,
              title: "Welcome to Star Leap",
              description: "Professional cheerleading uniforms for teams around the world",
              image: "02.jpg",
              buttonText: "View Our Products",
              buttonLink: "/products",
              sortOrder: 0,
              isActive: true
            }
          ]);
        } else {
          // In production, show empty state or error message
          console.log('生产环境，不使用fallback数据');
          setCarousels([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-carousel">
          {carousels.length > 0 ? (
            carousels.map((carousel, index) => (
              <div 
                key={carousel.id} 
                className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              >
                <div 
                  className="hero-image"
                  style={{ backgroundImage: `url(${getImageUrl(carousel.image)})` }}
                >
                  <div className="hero-overlay"></div>
                  <div className="container hero-content">
                    <h1 className="hero-title">{carousel.title}</h1>
                    {carousel.description && (
                      <p className="hero-description">{carousel.description}</p>
                    )}
                    {carousel.buttonText && carousel.buttonLink && (
                      <Link to={carousel.buttonLink}>
                        <Button type="primary" size="large" className="hero-button btn-large">
                          {carousel.buttonText}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="hero-slide active">
              <div 
                className="hero-image"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80)' }}
              >
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                  <h1 className="hero-title">Welcome to Star Leap</h1>
                  <p className="hero-description">Professional cheerleading uniforms for teams around the world</p>
                  <Link to="/products">
                    <Button type="primary" size="large" className="hero-button btn-large">
                      View Our Products
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="section categories-section">
        <div className="container">
          <h2 className="section-title">Product Categories</h2>
          <div className="grid">
            {categories.map(category => (
              <Link to={`/products/category/${category.id}`} key={category.id} className="category-item">
                <div className="category-card">
                  <div className="category-image">
                    {/* Placeholder image */}
                    <div className="placeholder-image">
                      <h3>{category.name}</h3>
                    </div>
                  </div>
                  <div className="category-content">
                    <h3 className="category-title">{category.name}</h3>
                    <p className="category-description">{category.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section section-bg products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/products" className="view-all-link">
              View All Products <span>→</span>
            </Link>
          </div>
          <div className="product-grid">
            {products.map(product => (
              <Link to={`/products/${product.id}`} key={product.id} className="product-link">
                <Card className="product-card">
                  <div className="product-image">
                    {product.product_images && product.product_images.length > 0 ? (
                      <img 
                        src={getImageUrl(product.product_images[0].imageUrl)} 
                        alt={product.name} 
                        className="product-img"
                      />
                    ) : (
                      <div className="placeholder-product-image">
                        <h3>{product.name}</h3>
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    {product.price && (
                      <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section about-section">
        <div className="container">
          <Row gutter={[30, 30]}>
            <Col xs={24} md={12}>
              <div className="about-image">
                <img 
                  src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" 
                  alt="About Star Leap" 
                  className="about-img"
                />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="about-content">
                <h2 className="section-title">About Star Leap</h2>
                <p className="about-text">
                  Star Leap is a professional cheerleading uniform brand dedicated to providing high-quality, stylish uniforms for teams around the world. With years of experience in the industry, we understand the unique needs of cheerleading teams and strive to create uniforms that are both durable and fashionable.
                </p>
                <p className="about-text">
                  Our mission is to empower cheerleaders with uniforms that make them feel confident and ready to perform at their best. We use only premium materials and advanced production techniques to ensure every uniform meets our strict quality standards.
                </p>
                <Link to="/about" className="btn btn-primary">
                  Learn More About Us
                </Link>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Company Strengths Section */}
      <section className="section section-dark strengths-section">
        <div className="container">
          <h2 className="section-title">Why Choose Star Leap</h2>
          <div className="grid">
            <div className="strength-card">
              <div className="strength-icon">🏆</div>
              <h3 className="strength-title">Quality Assurance</h3>
              <p className="strength-description">
                All our products undergo strict quality control processes to ensure the highest standards.
              </p>
            </div>
            <div className="strength-card">
              <div className="strength-icon">👗</div>
              <h3 className="strength-title">Custom Designs</h3>
              <p className="strength-description">
                We offer custom design services to create unique uniforms for your team.
              </p>
            </div>
            <div className="strength-card">
              <div className="strength-icon">⚡</div>
              <h3 className="strength-title">Fast Production</h3>
              <p className="strength-description">
                We use advanced production techniques to deliver your order quickly.
              </p>
            </div>
            <div className="strength-card">
              <div className="strength-icon">🌍</div>
              <h3 className="strength-title">Global Shipping</h3>
              <p className="strength-description">
                We ship our products to teams all around the world.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
