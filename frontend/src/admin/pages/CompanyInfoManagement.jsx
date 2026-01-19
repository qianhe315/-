import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Upload, message, Space, Typography, Tag, Row, Col } from 'antd';
const { TextArea } = Input;
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, CloseOutlined } from '@ant-design/icons';
import AdminLayout from '../components/Layout';
import companyInfoService from '../services/companyInfoService';
import adminApi from '../services/adminApi';


const { Title, Text } = Typography;
const { Option } = Select;

const CompanyInfoManagement = () => {
  const [companyInfos, setCompanyInfos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

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
    setImageUrl('');
    setModalVisible(true);
  };

  const handleEditCompanyInfo = (companyInfo) => {
    form.setFieldsValue(companyInfo);
    setEditingId(companyInfo.id);
    setImageUrl(companyInfo.imageUrl || '');
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
      const companyInfoData = {
        ...values,
        imageUrl: imageUrl
      };
      
      if (editingId) {
        await companyInfoService.updateCompanyInfo(editingId, companyInfoData);
        message.success('Company info updated successfully');
      } else {
        await companyInfoService.createCompanyInfo(companyInfoData);
        message.success('Company info created successfully');
      }
      setModalVisible(false);
      fetchCompanyInfos();
    } catch (err) {
      message.error('Failed to save company info');
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
      
      setImageUrl(response.filePath);
      return false;
    } catch (err) {
      console.error('Upload error:', err);
      message.error(`Failed to upload image: ${err.response?.data?.message || err.message}`);
      return false;
    }
  };

  const handleDeleteImage = () => {
    setImageUrl('');
    message.success('Image deleted successfully');
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
            
            <Form.Item label="Image">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {imageUrl ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={imageUrl} alt="Company Info" style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 4 }} />
                    <Button 
                      type="text" 
                      icon={<CloseOutlined />} 
                      danger
                      size="small"
                      style={{ position: 'absolute', top: -8, right: -8, background: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', minWidth: 24, height: 24, padding: 0 }}
                      onClick={handleDeleteImage}
                    >
                      Delete
                    </Button>
                  </div>
                ) : (
                  <Upload
                    listType="picture-card"
                    beforeUpload={handleFileUpload}
                    customRequest={handleFileUpload}
                    maxCount={1}
                    showUploadList={false}
                  >
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                )}
              </Space>
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