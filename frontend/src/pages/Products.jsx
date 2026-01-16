import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, Row, Col, Select, Spin, Empty } from 'antd';
import api from '../services/api';
import '../styles/Products.scss';

const { Option } = Select;

const Products = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryId || 'all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.categories.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let data;
        if (categoryId) {
          data = await api.products.getByCategory(categoryId);
        } else {
          data = await api.products.getAll();
        }
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    // The route change will be handled by the Link in the Select options
  };

  return (
    <div className="products-page">
      <section className="section products-header">
        <div className="container">
          <h1 className="page-title">Products</h1>
          <div className="category-filter">
            <h3>Filter by Category:</h3>
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              style={{ width: 250 }}
              size="large"
            >
              <Option value="all">
                <Link to="/products">All Products</Link>
              </Option>
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  <Link to={`/products/category/${category.id}`}>{category.name}</Link>
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <section className="section products-section">
        <div className="container">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p>Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <Row gutter={[30, 30]}>
              {products.map(product => (
                <Col xs={24} sm={12} md={8} key={product.id}>
                  <Link to={`/products/${product.id}`} className="product-link">
                    <Card className="product-card">
                      <div className="product-image">
                        {product.product_images && product.product_images.length > 0 ? (
                          <img
                            src={product.product_images[0].imageUrl}
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
                        <div className="product-actions">
                          <span className="view-details">View Details →</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description="No products found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;
