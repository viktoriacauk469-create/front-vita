import { Layout } from 'antd';

const footerStyle = {
  textAlign: 'center',
  color: 'black',
  width: '100vw',
  height: 60,
  backgroundColor: '#faf4ea',
};


export default function AppHeader(){
    return (
        <Layout.Footer style={footerStyle}>“© 2025 Vita — Моє родинне дерево”</Layout.Footer>

    )
}