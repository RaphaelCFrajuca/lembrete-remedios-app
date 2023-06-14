import React, { useEffect, useState } from "react";
import { Card, Avatar, Form, Input, Button, message, Popconfirm, Spin } from "antd";
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, DeleteOutlined, LogoutOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const { Meta } = Card;

interface User {
    name: string;
    picture: string;
    email: string;
    email_verified: boolean;
}

interface UserInfoProps {
    user: User;
}

const UserComponent: React.FC<UserInfoProps> = ({ user }) => {
    const [editing, setEditing] = useState(false);
    const [form] = Form.useForm();
    const { logout, getIdTokenClaims } = useAuth0();
    const [isLoading, setIsLoading] = useState(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const [currentUser, setCurrentUser] = useState(user);

    const fetchUser = async () => {
        try {
            const jwtToken = await getIdTokenClaims();
            const response = await axios.get(`${apiUrl}/user`, { headers: { Authorization: `Bearer ${jwtToken?.__raw}` }, params: { email: jwtToken?.email } });
            const user = response.data;
            setCurrentUser(user);
        } catch (error) {
            console.error("Erro ao obter os dados:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleEdit = () => {
        form.setFieldsValue({ name: currentUser.name });
        setEditing(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const newUser = await updateUser(values);
            message.success("Usuário atualizado com sucesso!");

            setCurrentUser(newUser);

            setEditing(false);
        } catch (error) {
            message.error("Erro ao atualizar o usuário!");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteUser();
            logout();
        } catch (error) {
            message.error("Erro ao excluir o usuário!");
        }
    };

    const handleLogout = () => {
        logout();
    };

    const updateUser = async (values: { name: string }) => {
        try {
            const userToken = await getIdTokenClaims();
            const newUser: User = {
                ...currentUser,
                name: values.name,
            };
            await axios.put(`${apiUrl}/user/update`, newUser, { headers: { Authorization: `Bearer ${userToken!.__raw}` } });
            return newUser;
        } catch (error) {
            throw new Error("Erro ao atualizar o usuário!");
        }
    };

    const deleteUser = async () => {
        try {
            const userToken = await getIdTokenClaims();
            await axios.delete(`${apiUrl}/user/delete`, { headers: { Authorization: `Bearer ${userToken?.__raw}` }, data: userToken });
        } catch (error) {
            throw new Error("Erro ao excluir o usuário!");
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Card
            style={{ width: "100%" }}
            //cover={<img alt="user-cover" src={currentUser.picture} style={{ objectFit: "cover", height: 300 }} />}
            actions={[
                <Button type="primary" icon={<EditOutlined />} onClick={handleEdit} />,
                <Popconfirm title="Tem certeza que deseja excluir o usuário?" onConfirm={handleDelete} okText="Sim" cancelText="Não">
                    <Button type="primary" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
            ]}
        >
            <Meta
                avatar={<Avatar src={<img alt="user-cover" src={currentUser.picture} style={{ objectFit: "cover" }} />} size={"large"} />}
                title={
                    editing ? (
                        <Form form={form} onFinish={handleSave} initialValues={{ name: currentUser.name }}>
                            <Form.Item name="name" rules={[{ required: true, message: "Por favor, insira o nome." }]}>
                                <Input />
                            </Form.Item>
                        </Form>
                    ) : (
                        <span>{currentUser.name}</span>
                    )
                }
                description={currentUser.email}
            />
            {!editing && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                    <Button type="default" icon={<LogoutOutlined />} onClick={handleLogout}>
                        Sair
                    </Button>
                </div>
            )}
        </Card>
    );
};

export default UserComponent;
