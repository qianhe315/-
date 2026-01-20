import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Upload, Space, Typography, Tag, Row, Col, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, CloseOutlined } from '@ant-design/icons';
import AdminLayout from '../components/Layout';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import adminApi from '../services/adminApi';
import '../styles/ProductManagement.scss';

const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

const ProductManagement = () => {
  const { message } = App.useApp();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      message.error('Failed to fetch categories');
    }
  };

  const handleAddProduct = () => {
    form.resetFields();
    setEditingId(null);
    setImages([]);
    setModalVisible(true);
  };

  const handleEditProduct = (product) => {
    form.setFieldsValue({
      name: product.name,
      categoryId: product.categoryId,
      description: product.description,
      specifications: product.specifications,
      price: product.price,
      isActive: product.isActive,
      sortOrder: product.sortOrder
    });
    setEditingId(product.id);
    setImages(product.product_images || []);
    setModalVisible(true);
  };

  const handleDeleteProduct = async (id) => {
    try {
      await productService.deleteProduct(id);
      message.success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      message.error('Failed to delete product');
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Include images in the product data
      const productData = {
        ...values,
        images: images
      };
      
      if (editingId) {
        // Update product
        await productService.updateProduct(editingId, productData);
        message.success('Product updated successfully');
      } else {
        // Create product
        const newProduct = await productService.createProduct(productData);
        message.success('Product created successfully');
      }
      setModalVisible(false);
      fetchProducts();
    } catch (err) {
      message.error('Failed to save product');
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload file to media endpoint
      const response = await adminApi.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Add uploaded image to images array
      const newImage = {
        imageUrl: response.filePath,
        isPrimary: images.length === 0, // First image is primary
        sortOrder: images.length
      };
      
      setImages([...images, newImage]);
      return false; // Prevent default upload behavior
    } catch (err) {
      message.error('Failed to upload image');
      return false;
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (index) => {
    try {
      // If image has an ID, delete from server
      if (images[index].id) {
        await productService.deleteProductImage(images[index].id);
      }
      // Remove from local state
      const newImages = [...images];
      newImages.splice(index, 1);
      // Update sort orders and primary flag
      const updatedImages = newImages.map((image, idx) => ({
        ...image,
        isPrimary: idx === 0,
        sortOrder: idx
      }));
      setImages(updatedImages);
      message.success('Image deleted successfully');
    } catch (err) {
      message.error('Failed to delete image');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => category?.name || 'No Category'
    },
    { 
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${parseFloat(price).toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Sort Order',
      dataIndex: 'sortOrder',
      key: 'sortOrder'
    },
    {
      title: 'Images',
      dataIndex: 'product_images',
      key: 'images',
      render: (images) => (
        <Space>
          {images?.slice(0, 2).map((image) => (
            <img 
              key={image.id} 
              src={image.imageUrl} 
              alt="Product" 
              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
            />
          ))}
          {images?.length > 2 && <Text>...and {images.length - 2} more</Text>}
        </Space>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditProduct(record)}
          >
            Edit
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteProduct(record.id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Space orientation="vertical" size="large" className="product-management-container">
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2}>Product Management</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddProduct}
          >
            Add Product
          </Button>
        </Col>
      </Row>
      
      <Table 
        columns={columns} 
        dataSource={products} 
        rowKey="id" 
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} products`
        }}
      />
        
        {/* Add/Edit Product Modal */}
        <Modal
          title={editingId ? 'Edit Product' : 'Add Product'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'Please input product name!' }]}
                  label="Product Name"
                >
                  <Input placeholder="Product Name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="categoryId"
                  rules={[{ required: true, message: 'Please select category!' }]}
                  label="Category"
                >
                  <Select placeholder="Select Category">
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="price"
                  rules={[{ required: true, message: 'Please input price!' }]}
                  label="Price"
                >
                  <Input type="number" placeholder="Price" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="sortOrder"
                  rules={[{ required: true, message: 'Please input sort order!' }]}
                  label="Sort Order"
                >
                  <Input type="number" placeholder="Sort Order" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="isActive"
                  label="Status"
                  valuePropName="checked"
                >
                  <Select placeholder="Select Status">
                    <Option value={true}>Active</Option>
                    <Option value={false}>Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please input description!' }]}
            >
              <Input.TextArea rows={4} placeholder="Product Description" />
            </Form.Item>
            
            <Form.Item
              name="specifications"
              label="Specifications"
            >
              <Input.TextArea rows={4} placeholder="Product Specifications" />
            </Form.Item>
            
            <Form.Item>
              <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                <Text strong>Product Images</Text>
                <Space wrap>
                  {images.map((image, index) => (
                    <div key={index} className="product-image-item">
                      <img src={image.imageUrl} alt={`Product ${index}`} className="product-image" />
                      <Button 
                        type="text" 
                        icon={<CloseOutlined />} 
                        danger
                        size="small"
                        className="image-delete-btn"
                        onClick={() => handleDeleteImage(index)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </Space>
                <Upload
                  listType="picture-card"
                  beforeUpload={handleFileUpload}
                  customRequest={handleFileUpload}
                  maxCount={10}
                  showUploadList={false}
                >
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Space>
            </Form.Item>
            
            <Form.Item>
              <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                <Button type="primary" htmlType="submit" block>
                  Save Product
                </Button>
                <Button onClick={() => setModalVisible(false)} block>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Space>
  );
};

export default ProductManagement;
