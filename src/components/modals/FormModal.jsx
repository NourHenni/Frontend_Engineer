import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Checkbox,
  Button,
  Radio,
  Upload,
  Select,
  DatePicker,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

function FormModal({
  isModalOpen,
  setIsModalOpen,
  formFields = [],
  title,
  onSubmit,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

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
              valuePropName={field.type === "checkbox" ? "checked" : undefined}
            >
              {field.type === "input" && <Input />}
              {field.type === "textarea" && <TextArea rows={4} />}
              {field.type === "checkbox" && (
                <Form.Item
                  key={index}
                  label={field.label}
                  name={field.name}
                  valuePropName="checked"
                  rules={field.rules}
                  style={field.style}
                  wrapperCol={field.wrapperCol}
                >
                  <Checkbox onChange={field.onchange}>Oui</Checkbox>
                </Form.Item>
              )}
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
              {field.type === "rangeDate" && <RangePicker />}
              {field.type === "upload" && (
                <Form.Item
                  name={field.name}
                  valuePropName="fileList"
                  getValueFromEvent={(e) => {
                    if (Array.isArray(e)) {
                      return e;
                    }
                    return e?.fileList;
                  }}
                  noStyle
                  rules={field.rules}
                >
                  <Upload beforeUpload={() => false}>
                    <Button icon={<UploadOutlined />}>
                      Téléverser {field.label}
                    </Button>
                  </Upload>
                </Form.Item>
              )}
              {field.type === "inputChoice" && (
                <Input
                  addonBefore={field.addonBefore}
                  maxLength={field.inputProps?.maxLength}
                  placeholder={field.inputProps?.placeholder}
                />
              )}
              {field.type === "selectStudents" && (
                <Select
                  {...field.selectProps} // Pour passer les props personnalisés comme options, placeholder...
                  showSearch
                  optionFilterProp="label"
                >
                  {field.selectProps?.options?.map((option) => (
                    <Select.Option
                      key={option.value}
                      value={option.value}
                      label={option.label}
                    >
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              )}
              {field.type === "tags" && (
                <Select
                  {...field.selectProps} // Pour passer les props personnalisés comme options, placeholder...
                  mode="tags"
                  style={{ width: "100%" }}
                  tokenSeparators={[","]} // Optionnel: pour séparer les tags par virgules
                />
              )}
            </Form.Item>
          ))}
      </Form>
    </Modal>
  );
}

export default FormModal;
