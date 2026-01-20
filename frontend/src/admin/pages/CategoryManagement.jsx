import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Upload, Space, Typography, Tag, Row, Col, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, CloseOutlined } from '@ant-design/icons';
import AdminLayout from '../components/Layout';
import categoryService from '../services/categoryService';
import adminApi from '../services/adminApi';
import '../styles/CategoryManagement.scss';

const { Title, Text } = Typography;

const CategoryManagement = () => {
  const { message } = App.useApp();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAllCategoriesIncludingInactive();
      setCategories(data);
    } catch (err) {
      message.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    form.resetFields();
    setEditingId(null);
    setImages([]);
    setModalVisible(true);
  };

  const handleEditCategory = (category) => {
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      sortOrder: category.sortOrder
    });
    setEditingId(category.id);
    setImages(category.category_images || []);
    setModalVisible(true);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await categoryService.deleteCategory(id);
      message.success('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      message.error('Failed to delete category');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const categoryData = {
        ...values,
        images: images
      };
      
      if (editingId) {
        await categoryService.updateCategory(editingId, categoryData);
        message.success('Category updated successfully');
      } else {
        await categoryService.createCategory(categoryData);
        message.success('Category created successfully');
      }
      setModalVisible(false);
      fetchCategories();
    } catch (err) {
      message.error('Failed to save category');
    }
  };

  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Uploading file:', file.name, file.size, file.type);
      
      const response = await adminApi.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Upload response:', response);
      
      const newImage = {
        imageUrl: response.filePath,
        isPrimary: images.length === 0,
        sortOrder: images.length
      };
      
      setImages([...images, newImage]);
      return false;
    } catch (err) {
      console.error('Upload error:', err);
      message.error(`Failed to upload image: ${err.response?.data?.message || err.message}`);
      return false;
    }
  };

  const handleDeleteImage = async (index) => {
    try {
      const newImages = [...images];
      newImages.splice(index, 1);
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc) => <Text ellipsis={{ tooltip: desc }}>{desc}</Text>
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
      dataIndex: 'category_images',
      key: 'images',
      render: (images) => (
        <Space>
          {images?.slice(0, 2).map((image) => (
            <img 
              key={image.id} 
              src={image.imageUrl} 
              alt="Category" 
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
            onClick={() => handleEditCategory(record)}
          >
            Edit
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteCategory(record.id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Space orientation="vertical" size="large" className="category-management-container">
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2}>Category Management</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddCategory}
          >
            Add Category
          </Button>
        </Col>
      </Row>
      
      <Table 
        columns={columns} 
        dataSource={categories} 
        rowKey="id" 
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} categories`
        }}
      />
        
        {/* Add/Edit Category Modal */}
        <Modal
          title={editingId ? 'Edit Category' : 'Add Category'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please input category name!' }]}
              label="Category Name"
            >
              <Input placeholder="Category Name" />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="Description"
            >
              <Input.TextArea rows={3} placeholder="Category Description" />
            </Form.Item>
            
            <Form.Item>
              <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                <Text strong>Category Images</Text>
                <Space wrap>
                  {images.map((image, index) => (
                    <div key={index} className="category-image-item">
                      <img src={image.imageUrl} alt={`Category ${index}`} className="category-image" />
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
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="isActive"
                  label="Status"
                  initialValue={true}
                >
                  <select className="ant-input">
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="sortOrder"
                  label="Sort Order"
                  initialValue={0}
                >
                  <Input type="number" placeholder="Sort Order" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item>
              <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                <Button type="primary" htmlType="submit" block>
                  Save Category
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

export default CategoryManagement;
