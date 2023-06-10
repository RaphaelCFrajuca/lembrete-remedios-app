import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { UnorderedListOutlined, PlusOutlined } from '@ant-design/icons';
import RegisterReminderComponent from './components/RegisterReminderComponent';
import './App.css'

const App: React.FC = () => {
  const [content, setContent] = useState<React.ReactNode | null>(null);
  const [menuItemSelected, setMenuItemSelected] = useState(false);

  const { Header, Content, Footer, Sider } = Layout;

  const handleMenuClick = (e: any) => {
    if (e.key === '1') {
      // Define o conteúdo como o componente ReminderForm
      setContent(<RegisterReminderComponent />);
    } else if (e.key === '2') {
      // Define o conteúdo como outro componente, se necessário
      // ...
    }
    setMenuItemSelected(true);
  };

  return (
    <Layout style={{ minHeight: '100vh', padding: 0 }}>
      <Sider collapsible>
        <div className="logo" />
        <Menu theme="dark" mode="inline">
          <Menu.Item key="1" icon={<PlusOutlined />} onClick={handleMenuClick}>
            Agendar Lembretes
          </Menu.Item>
          <Menu.Item key="2" icon={<UnorderedListOutlined />} onClick={handleMenuClick}>
            Meus Lembretes
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            {menuItemSelected ? (
              content
            ) : (
              <div>
                <h1>Página Padrão</h1>
                <p>Selecione um item do menu para exibir o conteúdo correspondente.</p>
              </div>
            )}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Lembrete de remédios</Footer>
      </Layout>
    </Layout>
  );
};

export default App;
