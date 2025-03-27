import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Modal,
  Cascader,
  Checkbox,
  ColorPicker,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Rate,
  Select,
  Slider,
  Switch,
  TreeSelect,
  Upload,
} from 'antd';
import "./FormModal.css"; // Importation du fichier CSS

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const normFile = e => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

function FormModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm(); // Création du formulaire

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        console.log('Données du formulaire :', values);
        setIsModalOpen(false);
        form.resetFields(); // Réinitialiser le formulaire après soumission
      })
      .catch(errorInfo => {
        console.log('Erreur de validation :', errorInfo);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="modal-container">
      <Button className="modal-button" type="primary" onClick={showModal}>
        Open Modal
      </Button>
      <Modal title="Formulaire" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width={700}>
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          layout="horizontal"
          style={{ maxWidth: '100%' }}
        >
          <Form.Item label="Nom" name="name" rules={[{ required: true, message: 'Veuillez entrer votre nom !' }]}>
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Veuillez entrer votre email !' },
              { type: 'email', message: 'Format email invalide !' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Checkbox" name="checkbox" valuePropName="checked">
            <Checkbox>Accepter les conditions</Checkbox>
          </Form.Item>

          <Form.Item label="Radio" name="radio">
            <Radio.Group>
              <Radio value="option1"> Option 1 </Radio>
              <Radio value="option2"> Option 2 </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="Input simple" name="simpleInput">
            <Input />
          </Form.Item>

          <Form.Item label="Sélection" name="select" rules={[{ required: true, message: 'Veuillez choisir une option !' }]}>
            <Select>
              <Select.Option value="option1">Option 1</Select.Option>
              <Select.Option value="option2">Option 2</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="TreeSelect" name="treeSelect">
            <TreeSelect
              treeData={[{ title: 'Light', value: 'light', children: [{ title: 'Bamboo', value: 'bamboo' }] }]}
            />
          </Form.Item>

          <Form.Item label="Cascader" name="cascader">
            <Cascader
              options={[
                {
                  value: 'zhejiang',
                  label: 'Zhejiang',
                  children: [{ value: 'hangzhou', label: 'Hangzhou' }],
                },
              ]}
            />
          </Form.Item>

          <Form.Item label="Date de naissance" name="date" rules={[{ required: true, message: 'Veuillez sélectionner une date !' }]}>
            <DatePicker />
          </Form.Item>

          <Form.Item label="Plage de dates" name="rangeDate">
            <RangePicker />
          </Form.Item>

          <Form.Item label="Nombre" name="inputNumber">
            <InputNumber min={1} max={100} />
          </Form.Item>

          <Form.Item label="Message" name="message">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item label="Interrupteur" name="switch" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item
            label="Téléversement"
            name="upload"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload action="/upload.do" listType="picture-card">
              <button style={{ color: 'inherit', cursor: 'inherit', border: 0, background: 'none' }} type="button">
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default FormModal;
