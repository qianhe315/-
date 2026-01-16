import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Typography, Tag, Row, Col } from 'antd';
const { TextArea } = Input;
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminLayout from '../components/Layout';
import companyInfoService from '../services/companyInfoService';


const { Title, Text } = Typography;
const { Option } = Select;

const CompanyInfoManagement = () => {
  const [companyInfos, setCompanyInfos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCompanyInfos();
  }, []);

  const fetchCompanyInfos = async () => {
    setLoading(true);
    try {
      const data = await companyInfoService.getAllCompanyInfo();
      setCompanyInfos(data);
    } catch (err) {
      message.error('Failed to fetch company info');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompanyInfo = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEditCompanyInfo = (companyInfo) => {
    form.setFieldsValue(companyInfo);
    setEditingId(companyInfo.id);
    setModalVisible(true);
  };

  const handleDeleteCompanyInfo = async (id) => {
    try {
      await companyInfoService.deleteCompanyInfo(id);
      message.success('Company info deleted successfully');
      fetchCompanyInfos();
    } catch (err) {
      message.error('Failed to delete company info');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        // Update company info
        await companyInfoService.updateCompanyInfo(editingId, values);
        message.success('Company info updated successfully');
      } else {
        // Create company info
        await companyInfoService.createCompanyInfo(values);
        message.success('Company info created successfully');
      }
      setModalVisible(false);
      fetchCompanyInfos();
    } catch (err) {
      message.error('Failed to save company info');
    }
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => text
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      render: (content) => <Text ellipsis={{ tooltip: content }}>{content}</Text>
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
            onClick={() => handleEditCompanyInfo(record)}
          >
            Edit
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteCompanyInfo(record.id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Space direction="vertical" size="large" className="company-info-management-container">
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2}>Company Info Management</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddCompanyInfo}
          >
            Add Company Info
          </Button>
        </Col>
      </Row>
      
      <Table 
        columns={columns} 
        dataSource={companyInfos} 
        rowKey="id" 
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} company info items`
        }}
      />
        
        {/* Add/Edit Company Info Modal */}
        <Modal
          title={editingId ? 'Edit Company Info' : 'Add Company Info'}
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
                  name="type"
                  rules={[{ required: true, message: 'Please select company info type!' }]}
                  label="Type"
                >
                  <Select placeholder="Select Company Info Type">
                    <Option value="brand_story">Brand Story</Option>
                    <Option value="about_us">About Us</Option>
                    <Option value="mission_vision">Mission & Vision</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="title"
                  rules={[{ required: true, message: 'Please input company info title!' }]}
                  label="Title"
                >
                  <Input placeholder="Company Info Title" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="content"
              rules={[{ required: true, message: 'Please input company info content!' }]}
              label="Content"
            >
              <TextArea rows={6} placeholder="Company Info Content" />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="isActive"
                  label="Status"
                  initialValue={true}
                >
                  <Select placeholder="Select Status">
                    <Option value={true}>Active</Option>
                    <Option value={false}>Inactive</Option>
                  </Select>
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
                  Save Company Info
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

export default CompanyInfoManagement;