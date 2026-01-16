import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Typography, Tag, Row, Col } from 'antd';
const { TextArea } = Input;
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminLayout from '../components/Layout';
import qualityCertificationService from '../services/qualityCertificationService';

const { Title, Text } = Typography;
const { Option } = Select;

const QualityCertificationManagement = () => {
  const [qualityCertifications, setQualityCertifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchQualityCertifications();
  }, []);

  const fetchQualityCertifications = async () => {
    setLoading(true);
    try {
      const data = await qualityCertificationService.getAllQualityCertifications();
      setQualityCertifications(data);
    } catch (err) {
      message.error('Failed to fetch quality certifications');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQualityCertification = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEditQualityCertification = (qualityCertification) => {
    form.setFieldsValue(qualityCertification);
    setEditingId(qualityCertification.id);
    setModalVisible(true);
  };

  const handleDeleteQualityCertification = async (id) => {
    try {
      await qualityCertificationService.deleteQualityCertification(id);
      message.success('Quality certification deleted successfully');
      fetchQualityCertifications();
    } catch (err) {
      message.error('Failed to delete quality certification');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        // Update quality certification
        await qualityCertificationService.updateQualityCertification(editingId, values);
        message.success('Quality certification updated successfully');
      } else {
        // Create quality certification
        await qualityCertificationService.createQualityCertification(values);
        message.success('Quality certification created successfully');
      }
      setModalVisible(false);
      fetchQualityCertifications();
    } catch (err) {
      message.error('Failed to save quality certification');
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
      render: (description) => <Text ellipsis={{ tooltip: description }}>{description}</Text>
    },
    {
      title: 'Certifying Body',
      dataIndex: 'certifyingBody',
      key: 'certifyingBody'
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
            onClick={() => handleEditQualityCertification(record)}
          >
            Edit
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteQualityCertification(record.id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Space direction="vertical" size="large" className="quality-certification-management-container">
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2}>Quality Certification Management</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddQualityCertification}
          >
            Add Quality Certification
          </Button>
        </Col>
      </Row>
      
      <Table 
        columns={columns} 
        dataSource={qualityCertifications} 
        rowKey="id" 
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} quality certifications`
        }}
      />
        
        {/* Add/Edit Quality Certification Modal */}
        <Modal
          title={editingId ? 'Edit Quality Certification' : 'Add Quality Certification'}
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
                  rules={[{ required: true, message: 'Please input certification name!' }]}
                  label="Name"
                >
                  <Input placeholder="Certification Name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="imageUrl"
                  rules={[{ required: true, message: 'Please input image URL!' }]}
                  label="Image URL"
                >
                  <Input placeholder="Image URL" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="description"
              label="Description"
            >
              <TextArea rows={4} placeholder="Certification Description" />
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
                  Save Quality Certification
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

export default QualityCertificationManagement;