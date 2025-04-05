import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Checkbox, Radio, Select, DatePicker } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

function FormModal({
  isModalOpen,
  setIsModalOpen,
  formFields = [],
  title,
  onSubmit,
  formData,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Utilisation de useEffect pour initialiser les valeurs du formulaire
  useEffect(() => {
    if (isModalOpen) {
      form.setFieldsValue(formData); // Remplir le formulaire avec formData
    }
  }, [isModalOpen, formData, form]);

  const handleOk = () => {
    setLoading(true);
    form
      .validateFields()
      .then((values) => {
        onSubmit(values);
        setIsModalOpen(false);
        form.resetFields();
        setLoading(false);
      })
      .catch((errorInfo) => {
        console.log("Erreur de validation :", errorInfo);
        setLoading(false);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal
      title={title}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Valider"
      cancelText="Annuler"
      width={700}
      confirmLoading={loading}
    >
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        layout="horizontal"
      >
        {Array.isArray(formFields) &&
          formFields.map((field, index) => (
            <Form.Item
              key={index}
              label={field.label}
              name={field.name}
              rules={field.rules}
            >
              {field.type === "input" && <Input />}
              {field.type === "textarea" && <TextArea rows={4} />}
              {field.type === "checkbox" && <Checkbox>Oui</Checkbox>}
              {field.type === "radio" && (
                <Radio.Group>
                  {field.options?.map((option) => (
                    <Radio key={option.value} value={option.value}>
                      {option.label}
                    </Radio>
                  ))}
                </Radio.Group>
              )}
              {field.type === "select" && (
                <Select>
                  {field.options?.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              )}
              {field.type === "date" && <DatePicker />}
              {field.type === "rangeDate" && (
                <RangePicker format="YYYY-MM-DD" />
              )}
              {field.type === "inputChoice" && (
                <Input
                  addonBefore={field.addonBefore}
                  maxLength={field.inputProps?.maxLength}
                  placeholder={field.inputProps?.placeholder}
                />
              )}
            </Form.Item>
          ))}
      </Form>
    </Modal>
  );
}

export default FormModal;
