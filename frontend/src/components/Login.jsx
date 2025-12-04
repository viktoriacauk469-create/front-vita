import React, { useState, useEffect } from 'react';
import { Flex, Layout, Form, Input, Button, message, Alert } from 'antd';
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
  maxWidth: '400px',
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

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    try {
      const result = await login(values.email, values.password);
      
      if (result.success) {
        message.success('Вхід успішний!');
        navigate('/');
      } else {
        // Show specific error message from backend
        const errorMsg = result.error || 'Помилка входу';
        setError(errorMsg);
        message.error(errorMsg);
        
        // If user not verified, suggest verification
        if (errorMsg.toLowerCase().includes('not verified') || 
            errorMsg.toLowerCase().includes('verify') ||
            errorMsg.toLowerCase().includes('not registered')) {
          message.warning('Будь ласка, спочатку підтвердіть ваш email');
        }
      }
    } catch (error) {
      const errorMsg = 'Помилка входу. Спробуйте ще раз.';
      setError(errorMsg);
      message.error(errorMsg);
      console.error('Login error:', error);
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
            <h1 style={titleStyle}>Вхід</h1>
            {error && (
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
              name="login"
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
                ]}
              >
                <Input.Password placeholder="Пароль" />
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
                  Увійти
                </Button>
              </Form.Item>
            </Form>
            
            <div style={linkStyle}>
              Немає акаунта? <Link to="/register" style={{ color: '#819b57', fontWeight: 'bold' }}>Зареєструватися</Link>
            </div>
          </div>
        </Content>
      </Layout>
    </Flex>
  );
}

