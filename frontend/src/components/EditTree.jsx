import {Input, Form, Flex, Layout, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

const buttonStyle = {
  background: '#819b57',
  marginRight: 'auto',
}
const button2Style = {
  background: '#819b57',
  marginRight: 'auto',
}
const button1Style = {
  background: '#819b57',
  marginRight: '20px',
}
const { Header,  Content } = Layout;
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
  flexDirection: 'column',
  textAlign: 'center',
  minHeight: 'calc(100vh - 80px)',
  width: '100vw',
  color: '#31261a',
  fontSize: '52px',
  paddingTop: '10px',
  backgroundColor: '#faf4ea',
};
const layoutStyle = {
  borderRadius: 8,
  overflow: 'hidden',
};
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  popup: {
    background: "white",
    padding: 20,
    borderRadius: 8,
    minWidth: 300
  }
};

export default function Profile () {
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [open1, setOpen1] = useState(false);
    const [open2, setOpen2] = useState(false);
    const navigate = useNavigate();
    return(
      <Flex>
          <Layout  style={layoutStyle}>
            <Header  style={headerStyle}>
        <Button style={buttonStyle} onClick={() => navigate('/')}>Головна</Button>
        <Button style={button1Style} onClick={() => {if(!open1 && !open2)setOpen(true)}}>Додати родича</Button>
        {open && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <Form
              form={form}
              name="register"
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

             
            </Form>
            <button onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
        <Button style={button1Style} onClick={() => {if(!open && !open2)setOpen1(true)}}>Видалити родича</Button>
         {open1 && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <Form
              form={form}
              name="register"
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

             
            </Form>
            <button onClick={() => setOpen1(false)}>Close</button>
          </div>
        </div>
      )}
        
        <Button style={button2Style} onClick={() => {if(!open && !open1)setOpen2(true)}}>Редагувати родича</Button>
         {open2 && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <Form
              form={form}
              name="register"
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

             
            </Form>
            <button onClick={() => setOpen2(false)}>Close</button>
          </div>
        </div>
      )}
            </Header>
            <Content  style={contentStyle}>wtynh</Content>
          </Layout>
        </Flex>
    );
  

  
  
}
