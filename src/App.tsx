import React, { useEffect, useState } from "react";
import { Layout, Menu, Spin } from "antd";
import { UnorderedListOutlined, PlusOutlined } from "@ant-design/icons";
import "./App.css";
import history from "./utils/History";
import { Route, Router, Switch } from "react-router-dom";
import ReminderComponent from "./components/ReminderComponent";
import RegisterReminderComponent from "./components/RegisterReminderComponent";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const App: React.FC = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [userRegistered, setUserRegistered] = useState<boolean>(false);
  const { isAuthenticated, isLoading, loginWithRedirect, user, getIdTokenClaims } = useAuth0();
  const { Content, Footer, Sider } = Layout;
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleMenuClick = (e: any) => {
    setSelectedMenuItem(e.key);
    if (e.key === "1") {
      history.push("/reminder/new");
    } else if (e.key === "2") {
      history.push("/reminder");
    }
  };

  useEffect(() => {
    const registerUser = async () => {
      const userToken = await getIdTokenClaims();
      if (!userToken) return;

      try {
        await axios.get(`${apiUrl}/user/find`, { headers: { Authorization: `Bearer ${userToken.__raw}` }, params: { email: user?.email } });
        setUserRegistered(true);
      } catch (error) {
        axios.post(`${apiUrl}/user/register`, user, { headers: { Authorization: `Bearer ${userToken.__raw}` }});
        setUserRegistered(true);
      }

      if (userRegistered) {
        await axios.post(`${apiUrl}/user/update`, user, { headers: { Authorization: `Bearer ${userToken.__raw}` } });
      }
    };

    registerUser();
  }, [getIdTokenClaims, apiUrl, user, userRegistered]);

  const handleLogoClick = () => {
    setSelectedMenuItem(null);
    history.push("/");
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    loginWithRedirect();
  }

  return (
    <Router history={history}>
      <Layout style={{ minHeight: "100vh", padding: 0 }}>
        <Sider breakpoint="lg" collapsedWidth="0">
          <div className="logo" onClick={handleLogoClick} style={{ cursor: "pointer" }} />
          <Menu theme="dark" mode="inline" selectedKeys={[selectedMenuItem as string]}>
            <Menu.Item key="1" icon={<PlusOutlined />} onClick={handleMenuClick}>
              Agendar Lembretes
            </Menu.Item>
            <Menu.Item key="2" icon={<UnorderedListOutlined />} onClick={handleMenuClick}>
              Meus Lembretes
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Content style={{ margin: "24px 16px 0", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ background: "#fff", minHeight: 36 }}>
              <Switch>
                <Route exact path="/" component={ReminderComponent} />
                {isAuthenticated && <Route path="/reminder/new" component={RegisterReminderComponent} />}
                {isAuthenticated && <Route path="/reminder" component={ReminderComponent} />}
              </Switch>
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>© 2023 Raphael Carneiro Frajuca. Todos os direitos reservados.</Footer>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
