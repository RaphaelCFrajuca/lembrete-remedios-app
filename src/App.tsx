import React, { useState } from "react";
import { Layout, Menu, Spin } from "antd";
import { UnorderedListOutlined, PlusOutlined } from "@ant-design/icons";
import "./App.css";
import history from "./utils/History";
import { Route, Router, Switch } from "react-router-dom";
import HomeComponent from "./components/HomeComponent";
import RegisterReminderComponent from "./components/RegisterReminderComponent";
import { useAuth0 } from "@auth0/auth0-react";

const App: React.FC = () => {
    const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
    const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0();
    const { Content, Footer, Sider } = Layout;

    const handleMenuClick = (e: any) => {
        setSelectedMenuItem(e.key);
        if (e.key === "1") {
            history.push("/reminder");
        } else if (e.key === "2") {
            // Define o conteúdo como outro componente, se necessário
            // ...
        }
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

    const handleLogoClick = () => {
        setSelectedMenuItem(null);
        history.push("/");
    };

    return (
        <Router history={history}>
            <Layout style={{ minHeight: "100vh", padding: 0 }}>
                <Sider collapsible>
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
                    <Content style={{ margin: "24px 16px 0" }}>
                        <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
                            <Switch>
                                <Route exact path="/" component={HomeComponent} />
                                {isAuthenticated && <Route path="/reminder" component={RegisterReminderComponent} />}
                            </Switch>
                        </div>
                    </Content>
                    <Footer style={{ textAlign: "center" }}>Lembrete de remédios</Footer>
                </Layout>
            </Layout>
        </Router>
    );
};

export default App;
