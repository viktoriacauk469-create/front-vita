import { Layout } from 'antd';

const footerStyle = {
  textAlign: 'center',
  color: 'black',
  width: '100vw',
  height: 100,
  backgroundColor: '#faf4ea',
};


export default function AppHeader(){
    return (
        <Layout.Footer style={footerStyle}>
          <p>“© 2025 Vita — Моє родинне дерево”</p>
          <p>Виникли запитання пишіть: vitathetree@gmail.com</p>
        </Layout.Footer>

    )
}