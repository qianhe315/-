import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Image, Spin, Descriptions, Button, Breadcrumb } from 'antd';
import api from '../services/api';
import '../styles/ProductDetail.scss';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await api.products.getById(id);
        setProduct(data);
        if (data.product_images && data.product_images.length > 0) {
          setActiveImage(data.product_images[0].imageUrl);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <h2>Product not found</h2>
        <Link to="/products">
          <Button type="primary">Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <section className="breadcrumb-section">
        <div className="container">
          <Breadcrumb>
            <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/products">Products</Link></Breadcrumb.Item>
            <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </section>

      {/* Product Detail Section */}
      <section className="section product-detail-section">
        <div className="container">
          <Row gutter={[40, 40]}>
            {/* Product Images */}
            <Col xs={24} md={12}>
              <div className="product-images">
                <div className="main-image">
                  <Image
                    src={activeImage}
                    alt={product.name}
                    className="zoomable-image"
                    preview={{ 
                      src: activeImage,
                      mask: true,
                    }}
                  />
                </div>
                
                {/* Image Thumbnails */}
                {product.product_images && product.product_images.length > 0 && (
                  <div className="image-thumbnails">
                    {product.product_images.map((image) => (
                      <div 
                        key={image.id}
                        className={`thumbnail-item ${activeImage === image.imageUrl ? 'active' : ''}`}
                        onClick={() => setActiveImage(image.imageUrl)}
                      >
                        <Image
                          src={image.imageUrl}
                          alt={`${product.name} - thumbnail`}
                          className="thumbnail-image"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>

            {/* Product Information */}
            <Col xs={24} md={12}>
              <div className="product-info">
                <h1 className="product-name">{product.name}</h1>
                
                {product.price && (
                  <div className="product-price">
                    <span className="price-label">Price:</span>
                    <span className="price-value">${parseFloat(product.price).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="product-description">
                  <h3>Description</h3>
                  <p>{product.description}</p>
                </div>
                
                <div className="product-specifications">
                  <h3>Specifications</h3>
                  <div className="specs-content">
                    {product.specifications ? (
                      <pre>{product.specifications}</pre>
                    ) : (
                      <p>No specifications available</p>
                    )}
                  </div>
                </div>
                
                <div className="product-actions">
                  <Button 
                    type="primary" 
                    size="large" 
                    className="contact-button"
                    onClick={() => window.location.href = '/contact'}
                  >
                    Contact for Inquiry
                  </Button>
                  <Link to="/products">
                    <Button size="large" className="back-button">
                      Back to Products
                    </Button>
                  </Link>
                </div>
              </div>
            </Col>
          </Row>

          {/* Additional Product Details */}
          <div className="additional-details">
            <Card title="Product Details" className="detail-card">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Category">
                  {product.category ? product.category.name : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {product.isActive ? 'Active' : 'Inactive'}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {new Date(product.createdAt).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Updated At">
                  {new Date(product.updatedAt).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
