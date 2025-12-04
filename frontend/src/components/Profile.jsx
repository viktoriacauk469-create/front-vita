import React, { useEffect, useState, useCallback } from 'react';
import { Flex, Layout, Button } from 'antd';
import logo from '/logo.jpg';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
const buttonStyle = {
  background: '#819b57',
  marginLeft: '1300px',
}
const treeStyle = {
  background: '#819b57',
  marginLeft: 'auto',
  marginRight: '20px',
}
const imageStyle = {
  paddingLeft: '1px',
  width: '60px',
  height: '60px',
}
const divstyle = {
  borderRadius: '10px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '30px',
  width: '400px',
  backgroundColor: '#819b57',
  marginTop: '30px',
  fontSize: '14px', 
}
const profilePictureStyle = {
  marginTop: '30px',
  background: '#819b57',
  borderRadius: '90px',
  width: '128px',
  height: '128px',
}


export default function Profile () {
  const navigate = useNavigate();
  const { id } = useParams(); // Get user ID from URL
  const { user: currentUser } = useAuth(); // Get current authenticated user
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    const userId = id || currentUser?.id;
    
    if (!userId) {
      setError('No user ID provided. Please log in or provide a user ID in the URL.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading user with ID:', userId);
      
      const response = await fetch(`http://localhost:8080/api/user/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Profile response status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('Profile response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        setError(`Server error (${response.status}). Please check if backend is running.`);
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Unauthorized, redirecting to login');
          navigate('/login');
          return;
        }
        const errorMsg = data.error || data.details || `Failed to load user (${response.status})`;
        console.error('Profile error:', errorMsg);
        throw new Error(errorMsg);
      }
      
      if (data.user) {
        console.log('User loaded successfully:', data.user);
        setUser(data.user);
      } else {
        throw new Error('User data not found in response');
      }
    } catch (err) {
      console.error('Profile load error:', err);
      setError(err.message || 'Failed to load user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id, currentUser?.id, navigate]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return(
    <Flex gap="middle" wrap>
      <Layout style={layoutStyle}>
        <Header style={headerStyle} >
          <img src={logo} alt='Logo' style={imageStyle}></img>
          <Button style={buttonStyle} onClick={() => navigate('/')}>Головна</Button>
        </Header>
        <Content style={contentStyle}>
          {loading && (
            <div style={divstyle}><p>Завантаження...</p></div>
          )}
          
          {error && (
            <div style={divstyle}><p>Помилка: {error}</p></div>
          )}
          
          {user && !loading && (
            <>
              <div style={profilePictureStyle}></div>
              <div style={divstyle}><p>{user.email || 'Призвіще ім\'я'}</p></div>
              
              <div style={divstyle}>
                <p>Дата народження: {user.dateOfBirth || 'Не вказано'}</p>
              </div>
              <div style={divstyle}>
                <p>Місце проживання: {user.placeOfResidence || 'Не вказано'}</p>
              </div>
              <div style={divstyle}>
                <p>Група крові: {user.bloodType || 'Не вказано'}</p>
              </div>
              <div style={divstyle}>
                <p>Резус-фактор: {
                  user.rhesusFactor === 'PLUS' ? '+' : 
                  user.rhesusFactor === 'MINUS' ? '-' : 
                  user.rhesusFactor || 'Не вказано'
                }</p>
              </div>
              <div style={divstyle}>
                <p>Хвороби: {user.diseases || 'Не вказано'}</p>
              </div>
            </>
          )}
        </Content>
      </Layout>
    </Flex>
  );
}
  
    