import { Layout } from 'antd';


const contentStyle = {
  textAlign: 'center',
  minHeight: 'calc(100vh - 80px - 60px)',
  width: '100vw',
  color: '#31261a',
  fontSize: '52px',
  paddingTop: '10px',
  backgroundColor: '#faf4ea',
};


export default function AppContent(){
    return (
       <Layout.Content style={contentStyle}>Твоє родинне дерево</Layout.Content>
    )
}