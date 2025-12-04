import React from 'react';
import { Flex, Layout, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const buttonStyle = {
  background: '#819b57',
  marginRight: '20px',
}

export default function Profile () {
  const navigate = useNavigate();
  <Button style={buttonStyle} onClick={() => navigate('/')}>Головна</Button>
}
