import React, { useEffect, useState } from "react";
import { Layout, Menu, Spin } from "antd";
import { UnorderedListOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import "./App.css";
import history from "./utils/History";
import { Route, Router, Switch } from "react-router-dom";
import ReminderComponent from "./components/ReminderComponent";
import RegisterReminderComponent from "./components/RegisterReminderComponent";
import { User, useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import UserComponent from "./components/UserComponent";

const App: React.FC = () => {
    const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
    const [userRegistered, setUserRegistered] = useState<boolean>(false);
    const { isAuthenticated, isLoading, loginWithRedirect, user, getIdTokenClaims } = useAuth0();
    const [apiUser, setApiUser] = useState<User>(user!);
    const { Content, Footer, Sider } = Layout;
    const apiUrl = process.env.REACT_APP_API_URL;

    const handleMenuClick = (e: any) => {
        setSelectedMenuItem(e.key);
        if (e.key === "1") {
            history.push("/user");
        } else if (e.key === "2") {
            history.push("/reminder/new");
        } else if (e.key === "3") {
            history.push("/reminder");
        }
    };

    useEffect(() => {
        const checkUserRegistration = async () => {
            const userToken = await getIdTokenClaims();
            if (!userToken) return;

            try {
                await axios.get(`${apiUrl}/user/validate`, { headers: { Authorization: `Bearer ${userToken.__raw}` }, params: { email: user?.email } });
                setUserRegistered(true);
            } catch (error) {
                await axios.post(`${apiUrl}/user/new`, user, { headers: { Authorization: `Bearer ${userToken.__raw}` } });
                setUserRegistered(false);
            }

            setApiUser((await axios.get(`${apiUrl}/user`, { headers: { Authorization: `Bearer ${userToken.__raw}` }, params: { email: user?.email } })).data);
        };

        checkUserRegistration();
    }, [getIdTokenClaims, apiUrl, user]);

    useEffect(() => {
        const updateUser = async () => {
            const userToken = await getIdTokenClaims();
            if (!userToken) return;

            if (!userRegistered) {
                try {
                    await axios.post(`${apiUrl}/user/new`, user, { headers: { Authorization: `Bearer ${userToken.__raw}` } });
                    setUserRegistered(true);
                } catch (error) {
                    console.error("Erro ao registrar usuário:", error);
                }
            }
        };

        if (userRegistered) {
            updateUser();
        }
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
                        <Menu.Item key="1" icon={<UserOutlined />} onClick={handleMenuClick}>
                            Meu Usuário
                        </Menu.Item>
                        <Menu.Item key="2" icon={<PlusOutlined />} onClick={handleMenuClick}>
                            Agendar Lembretes
                        </Menu.Item>
                        <Menu.Item key="3" icon={<UnorderedListOutlined />} onClick={handleMenuClick}>
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
                                {isAuthenticated && (
                                    <Route
                                        path="/user"
                                        render={() => (
                                            <UserComponent
                                                user={{
                                                    name: apiUser?.name ?? "",
                                                    picture: apiUser?.picture ?? "",
                                                    email: apiUser?.email ?? "",
                                                    email_verified: apiUser?.email_verified ?? false,
                                                }}
                                            />
                                        )}
                                    />
                                )}
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
