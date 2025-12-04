import React, { useState, useEffect } from 'react';
import { Flex, Layout, Form, Input, Button, message, Alert } from 'antd';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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

export default function Verify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [form] = Form.useForm();

  // Get email from URL parameter
  const emailFromUrl = searchParams.get('email') || '';

  useEffect(() => {
    if (emailFromUrl) {
      form.setFieldsValue({ email: emailFromUrl });
    }
  }, [emailFromUrl, form]);

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/verify', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          code: values.code,
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
        const errorMsg = data.error || data.details || `Verification failed (${response.status})`;
        setError(errorMsg);
        message.error(errorMsg);
        setLoading(false);
        return;
      }

      // Verification successful
      setSuccess(true);
      message.success('Email підтверджено! Тепер ви можете увійти.');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Verification error:', error);
      const errorMsg = error.message || 'Помилка підтвердження. Спробуйте ще раз.';
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
            <h1 style={titleStyle}>Підтвердження Email</h1>
            
            {success && (
              <Alert
                message="Email підтверджено!"
                description="Тепер ви можете увійти в систему."
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
              name="verify"
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
                label="Код підтвердження"
                name="code"
                rules={[
                  { required: true, message: 'Будь ласка, введіть код підтвердження' },
                ]}
              >
                <Input 
                  placeholder="Введіть код з email" 
                  maxLength={6}
                  style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '8px' }}
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
                  Підтвердити
                </Button>
              </Form.Item>
            </Form>
            
            <div style={linkStyle}>
              <Link to="/login" style={{ color: '#819b57', fontWeight: 'bold' }}>Повернутися до входу</Link>
            </div>
          </div>
        </Content>
      </Layout>
    </Flex>
  );
}

