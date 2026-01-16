import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Typography, Tag, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminLayout from '../components/Layout';
import categoryService from '../services/categoryService';
import '../styles/CategoryManagement.scss';

const { Title, Text } = Typography;

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

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
      if (editingId) {
        // Update category
        await categoryService.updateCategory(editingId, values);
        message.success('Category updated successfully');
      } else {
        // Create category
        await categoryService.createCategory(values);
        message.success('Category created successfully');
      }
      setModalVisible(false);
      fetchCategories();
    } catch (err) {
      message.error('Failed to save category');
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
    <Space direction="vertical" size="large" className="category-management-container">
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
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
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
