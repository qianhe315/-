import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Typography, Tag, Row, Col } from 'antd';
const { TextArea } = Input;
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminLayout from '../components/Layout';
import productionProcessService from '../services/productionProcessService';


const { Title, Text } = Typography;
const { Option } = Select;

const ProductionProcessManagement = () => {
  const [productionProcesses, setProductionProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProductionProcesses();
  }, []);

  const fetchProductionProcesses = async () => {
    setLoading(true);
    try {
      const data = await productionProcessService.getAllProductionProcesses();
      setProductionProcesses(data);
    } catch (err) {
      message.error('Failed to fetch production processes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductionProcess = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEditProductionProcess = (productionProcess) => {
    form.setFieldsValue(productionProcess);
    setEditingId(productionProcess.id);
    setModalVisible(true);
  };

  const handleDeleteProductionProcess = async (id) => {
    try {
      await productionProcessService.deleteProductionProcess(id);
      message.success('Production process deleted successfully');
      fetchProductionProcesses();
    } catch (err) {
      message.error('Failed to delete production process');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        // Update production process
        await productionProcessService.updateProductionProcess(editingId, values);
        message.success('Production process updated successfully');
      } else {
        // Create production process
        await productionProcessService.createProductionProcess(values);
        message.success('Production process created successfully');
      }
      setModalVisible(false);
      fetchProductionProcesses();
    } catch (err) {
      message.error('Failed to save production process');
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
            onClick={() => handleEditProductionProcess(record)}
          >
            Edit
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteProductionProcess(record.id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Space direction="vertical" size="large" className="production-process-management-container">
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2}>Production Process Management</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddProductionProcess}
          >
            Add Production Process
          </Button>
        </Col>
      </Row>
      
      <Table 
        columns={columns} 
        dataSource={productionProcesses} 
        rowKey="id" 
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} production processes`
        }}
      />
        
        {/* Add/Edit Production Process Modal */}
        <Modal
          title={editingId ? 'Edit Production Process' : 'Add Production Process'}
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
            <Form.Item
              name="title"
              rules={[{ required: true, message: 'Please input production process title!' }]}
              label="Title"
            >
              <Input placeholder="Production Process Title" />
            </Form.Item>
            
            <Form.Item
              name="description"
              rules={[{ required: true, message: 'Please input production process description!' }]}
              label="Description"
            >
              <TextArea rows={6} placeholder="Production Process Description" />
            </Form.Item>
            
            <Form.Item
              name="imageUrl"
              label="Image URL"
            >
              <Input placeholder="Image URL" />
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
                  Save Production Process
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

export default ProductionProcessManagement;