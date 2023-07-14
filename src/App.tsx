import React, { useEffect, useState } from "react";
import { Form, Input, Layout, Menu, Modal, Spin } from "antd";
import { UnorderedListOutlined, UserOutlined, CalendarOutlined, QuestionCircleFilled, ClockCircleOutlined } from "@ant-design/icons";
import "./App.css";
import history from "./utils/History";
import { Route, Router, Switch } from "react-router-dom";
import ReminderComponent from "./components/ReminderComponent";
import RegisterReminderComponent from "./components/RegisterReminderComponent";
import { User, useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import UserComponent, { validatePhoneNumber } from "./components/UserComponent";

const { Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

const App: React.FC = () => {
    const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
    const [userRegistered, setUserRegistered] = useState<boolean>(false);
    const { isAuthenticated, isLoading, loginWithRedirect, user, getIdTokenClaims } = useAuth0();
    const [apiUser, setApiUser] = useState<User>(user!);
    const { confirm } = Modal;
    const [form] = Form.useForm();
    const apiUrl = process.env.REACT_APP_API_URL;

    const handleMenuClick = (e: any) => {
        setSelectedMenuItem(e.key);
        if (e.key === "1-1") {
            history.push("/user");
        } else if (e.key === "2-1") {
            history.push("/reminder/new");
        } else if (e.key === "2-2") {
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
                confirm({
                    title: "Insira seu número de telefone",
                    icon: <QuestionCircleFilled />,
                    cancelButtonProps: {
                        disabled: true,
                    },
                    content: (
                        <Form form={form}>
                            <Form.Item name="phone" rules={[{ required: true, message: "Por favor, insira o número de telefone." }, { validator: validatePhoneNumber }]}>
                                <Input addonBefore="+55" placeholder="Número de telefone" />
                            </Form.Item>
                        </Form>
                    ),
                    onOk() {
                        return new Promise<void>((resolve, reject) => {
                            setTimeout(() => {
                                form.validateFields()
                                    .then(values => {
                                        values.phone = "+55" + values.phone.replaceAll(" ", "").replaceAll("-", "");
                                        axios
                                            .post(
                                                `${apiUrl}/user/new`,
                                                { ...user, phone: values.phone, reminderChannel: "SMS" },
                                                { headers: { Authorization: `Bearer ${userToken.__raw}` } },
                                            )
                                            .then(() => {
                                                setUserRegistered(false);
                                                axios
                                                    .get(`${apiUrl}/user`, { headers: { Authorization: `Bearer ${userToken.__raw}` }, params: { email: user?.email } })
                                                    .then(data => {
                                                        setApiUser(data.data);
                                                    });
                                                resolve();
                                            });
                                    })
                                    .catch(error => {
                                        reject(error);
                                    });
                            });
                        });
                    },
                });
            }
        };

        checkUserRegistration();
    }, [getIdTokenClaims, apiUrl, user, form]);

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
        return null;
    }

    return (
        <Router history={history}>
            <Layout style={{ minHeight: "100vh", padding: 0 }}>
                <Sider breakpoint="lg" collapsedWidth="70" width={225}>
                    <div className="logo" onClick={handleLogoClick} style={{ cursor: "pointer" }} />
                    <Menu theme="dark" mode="inline" selectedKeys={[selectedMenuItem as string]}>
                        <Menu.Item key="1-1" icon={<UserOutlined />} onClick={handleMenuClick}>
                            Meu Usuário
                        </Menu.Item>
                        <SubMenu key="2" icon={<ClockCircleOutlined />} title="Lembretes">
                            <Menu.Item key="2-1" onClick={handleMenuClick} icon={<CalendarOutlined />}>
                                Agendar Lembretes
                            </Menu.Item>
                            <Menu.Item key="2-2" onClick={handleMenuClick} icon={<UnorderedListOutlined />}>
                                Meus Lembretes
                            </Menu.Item>
                        </SubMenu>
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
                                                    phone: apiUser?.phone ?? "",
                                                    reminderChannel: apiUser?.reminderChannel ?? "EMAIL",
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
