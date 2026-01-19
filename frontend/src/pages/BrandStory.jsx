import React, { useState, useEffect } from 'react';
import { Breadcrumb, Row, Col, Card, Spin } from 'antd';
import api from '../services/api';
import '../styles/BrandStory.scss';

const BrandStory = () => {
  const [brandStory, setBrandStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandStory = async () => {
      setLoading(true);
      try {
        const data = await api.companyInfo.getByType('brand_story');
        setBrandStory(data);
      } catch (error) {
        console.error('Error fetching brand story:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandStory();
  }, []);

  return (
    <div className="brand-story-page">
      {/* Breadcrumb */}
      <section className="breadcrumb-section">
        <div className="container">
          <Breadcrumb>
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/company">Company</Breadcrumb.Item>
            <Breadcrumb.Item>Brand Story</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="section brand-story-section">
        <div className="container">
          <h1 className="page-title">Our Brand Story</h1>
          
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p>Loading brand story...</p>
            </div>
          ) : brandStory ? (
            <div className="brand-story-content">
              <Row gutter={[40, 40]}>
                <Col xs={24} md={12}>
                  <div className="story-text">
                    <h2>{brandStory.title}</h2>
                    <div className="content">
                      {brandStory.content.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="story-image">
                    {brandStory.imageUrl ? (
                      <img src={brandStory.imageUrl} alt="Brand Story" className="brand-story-main-image" />
                    ) : (
                      <div className="placeholder-image">
                        <h3>Brand Story Image</h3>
                      </div>
                    )}
                    <Card className="story-card">
                      <h3>Our Mission</h3>
                      <p>To empower cheerleaders with high-quality, stylish uniforms that help them perform at their best.</p>
                    </Card>
                    <Card className="story-card">
                      <h3>Our Vision</h3>
                      <p>To become the global leader in cheerleading apparel, known for innovation, quality, and exceptional service.</p>
                    </Card>
                  </div>
                </Col>
              </Row>
            </div>
          ) : (
            <div className="error-container">
              <h2>Brand story not found</h2>
              <p>Please check back later or contact us for more information.</p>
            </div>
          )}
        </div>
      </section>

      {/* Values Section */}
      <section className="section section-bg values-section">
        <div className="container">
          <h2 className="section-title">Our Core Values</h2>
          <div className="values-grid">
            <Card className="value-card">
              <div className="value-icon">✨</div>
              <h3 className="value-title">Excellence</h3>
              <p className="value-description">
                We strive for excellence in every aspect of our business, from design to production to customer service.
              </p>
            </Card>
            <Card className="value-card">
              <div className="value-icon">🎯</div>
              <h3 className="value-title">Innovation</h3>
              <p className="value-description">
                We continuously innovate to bring the latest designs and technologies to our products.
              </p>
            </Card>
            <Card className="value-card">
              <div className="value-icon">🤝</div>
              <h3 className="value-title">Integrity</h3>
              <p className="value-description">
                We conduct our business with honesty, transparency, and ethical practices.
              </p>
            </Card>
            <Card className="value-card">
              <div className="value-icon">❤️</div>
              <h3 className="value-title">Passion</h3>
              <p className="value-description">
                We are passionate about cheerleading and dedicated to supporting teams around the world.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BrandStory;
