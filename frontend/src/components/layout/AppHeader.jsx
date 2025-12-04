import { Layout, Button } from 'antd';
import ButtonGroup from 'antd/es/button/button-group';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '/logo.jpg';


const headerStyle = {
  textAlign: 'center',
  height: 80,
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  background: '#faf4ea',
};
const buttonStyle = {
  background: '#819b57',
  marginLeft: '20px',
}
const imageStyle = {
  paddingLeft: '1px',
  width: '60px',
  height: '60px',
}
const profileStyle = {
  background: '#819b57',
  marginRight: '10px',
  marginLeft: 'auto',
}


export default function AppHeader(){
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();
    
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Layout.Header style={headerStyle}>
            <img src={logo} alt='Logo' style={imageStyle}></img>
            <Button style={buttonStyle} onClick={() => navigate('/predict')}>Передбачення</Button>
            <Button style={buttonStyle} onClick={() => navigate('/editTree')}>Редагувати дерево</Button>
            
            {isAuthenticated ? (
                <>
                    {user && (
                        <Button 
                            style={profileStyle} 
                            onClick={() => navigate(`/profile/${user.id}`)}
                        >
                            Профіль
                        </Button>
                    )}
                    <Button 
                        style={buttonStyle} 
                        onClick={handleLogout}
                    >
                        Вийти
                    </Button>
                </>
            ) : (
                <>
                    <Button 
                        style={buttonStyle} 
                        onClick={() => navigate('/register')}
                    >
                        Зареєструватися
                    </Button>
                    <Button 
                        style={profileStyle} 
                        onClick={() => navigate('/login')}
                    >
                        Увійти
                    </Button>
                </>
            )}
        </Layout.Header>
    )
}