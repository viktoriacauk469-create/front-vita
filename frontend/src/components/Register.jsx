import React, { useState, useEffect } from 'react';
import { Flex, Layout, Form, Input, Button, message, Alert, DatePicker, Select } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '/logo.jpg';

const { Header, Content } = Layout;

const headerStyle = {
  textAlign: 'center',
  height: 80,
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  background: '#faf4ea',
};

const contentStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  minHeight: 'calc(100vh - 80px)',
  width: '100vw',
  backgroundColor: '#faf4ea',
  padding: '20px',
};

const layoutStyle = {
  borderRadius: 8,
  overflow: 'hidden',
};

const imageStyle = {
  paddingLeft: '1px',
  width: '60px',
  height: '60px',
};

const formStyle = {
  width: '100%',
  maxWidth: '500px',
  backgroundColor: 'white',
  padding: '40px',
  borderRadius: '10px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const titleStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#31261a',
  marginBottom: '30px',
  textAlign: 'center',
};

const linkStyle = {
  textAlign: 'center',
  marginTop: '20px',
  color: '#819b57',
};

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const [form] = Form.useForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          bloodType: values.bloodType,
          rhesusFactor: values.rhesusFactor,
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
          placeOfResidence: values.placeOfResidence,
          diseases: values.diseases,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        setError(`Server error (${response.status}). Please check if backend is running.`);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorMsg = data.error || data.details || `Registration failed (${response.status})`;
        setError(errorMsg);
        message.error(errorMsg);
        setLoading(false);
        return;
      }

      // Registration successful
      setSuccess(true);
      setRegisteredEmail(values.email);
      message.success('Реєстрація успішна! Перевірте email для коду підтвердження.');
      
      // Redirect to verification page after 2 seconds
      setTimeout(() => {
        navigate(`/verify?email=${encodeURIComponent(values.email)}`);
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.message || 'Помилка реєстрації. Спробуйте ще раз.';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex gap="middle" wrap>
      <Layout style={layoutStyle}>
        <Header style={headerStyle}>
          <img src={logo} alt="Logo" style={imageStyle}></img>
        </Header>
        <Content style={contentStyle}>
          <div style={formStyle}>
            <h1 style={titleStyle}>Реєстрація</h1>
            
            {success && (
              <Alert
                message="Реєстрація успішна!"
                description={`Код підтвердження відправлено на ${registeredEmail}. Перевірте email.`}
                type="success"
                showIcon
                style={{ marginBottom: '20px' }}
              />
            )}
            
            {error && !success && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
                style={{ marginBottom: '20px' }}
              />
            )}
            
            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              layout="vertical"
              autoComplete="off"
              size="large"
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Будь ласка, введіть email' },
                  { type: 'email', message: 'Введіть коректний email' },
                ]}
              >
                <Input placeholder="your@email.com" />
              </Form.Item>

              <Form.Item
                label="Пароль"
                name="password"
                rules={[
                  { required: true, message: 'Будь ласка, введіть пароль' },
                  { min: 6, message: 'Пароль повинен містити мінімум 6 символів' },
                ]}
              >
                <Input.Password placeholder="Пароль" />
              </Form.Item>

              <Form.Item
                label="Підтвердження пароля"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Будь ласка, підтвердіть пароль' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Паролі не співпадають'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Підтвердіть пароль" />
              </Form.Item>

              <Form.Item
                label="Дата народження"
                name="dateOfBirth"
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  placeholder="Оберіть дату народження"
                />
              </Form.Item>

              <Form.Item
                label="Місце проживання"
                name="placeOfResidence"
              >
                <Input placeholder="Введіть місце проживання" />
              </Form.Item>

              <Form.Item
                label="Група крові"
                name="bloodType"
              >
                <Select placeholder="Оберіть групу крові" allowClear>
                  <Select.Option value="A">A</Select.Option>
                  <Select.Option value="B">B</Select.Option>
                  <Select.Option value="AB">AB</Select.Option>
                  <Select.Option value="O">O</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Резус-фактор"
                name="rhesusFactor"
              >
                <Select placeholder="Оберіть резус-фактор" allowClear>
                  <Select.Option value="PLUS">+ (Позитивний)</Select.Option>
                  <Select.Option value="MINUS">- (Негативний)</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Хвороби"
                name="diseases"
              >
                <Input.TextArea 
                  rows={3}
                  placeholder="Введіть інформацію про хвороби (необов'язково)"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    backgroundColor: '#819b57',
                    borderColor: '#819b57',
                    height: '45px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  Зареєструватися
                </Button>
              </Form.Item>
            </Form>
            
            <div style={linkStyle}>
              Вже маєте акаунт? <Link to="/login" style={{ color: '#819b57', fontWeight: 'bold' }}>Увійти</Link>
            </div>
          </div>
        </Content>
      </Layout>
    </Flex>
  );
}

