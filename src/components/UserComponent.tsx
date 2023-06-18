import React, { useEffect, useState } from "react";
import { Card, Avatar, Form, Input, Button, message, Popconfirm, Spin, Radio } from "antd";
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, DeleteOutlined, LogoutOutlined, StopOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const { Meta } = Card;

interface User {
    name: string;
    picture: string;
    email: string;
    email_verified: boolean;
    phone: string;
    reminderChannel: "EMAIL" | "SMS" | "VOICEMAIL";
}

export const validatePhoneNumber = (_: any, value: string, callback: any) => {
    const phoneNumberRegex = /^\+55 \d{2} \d{5}-\d{4}$/;
    if (!phoneNumberRegex.test("+55 " + value)) {
        callback("Por favor, insira um número de telefone válido no formato +55 99 99999-9999");
    } else {
        callback();
    }
};

export const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, "");

    const match = cleaned.match(/^(\d{2})(\d{2})(\d{5})(\d{4})$/);
    if (match) {
        return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
    }

    return phoneNumber;
};

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
    const [phoneNumber, setPhoneNumber] = React.useState("");

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

    const formatPhoneNumberInput = (phoneNumber: string) => {
        const cleaned = phoneNumber.replace(/\D/g, "");

        if (cleaned.length === 11) {
            const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
            if (match) {
                return `${match[1]} ${match[2]}-${match[3]}`;
            }
        } else if (cleaned.length === 10) {
            const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
            if (match) {
                return `${match[1]} ${match[2]}-${match[3]}`;
            }
        }

        setPhoneNumber(phoneNumber);

        return phoneNumber;
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleEdit = () => {
        form.setFieldsValue({
            name: currentUser.name,
            reminderChannel: currentUser.reminderChannel,
            phone: formatPhoneNumberInput(currentUser.phone.replaceAll("+55", "")),
        });
        setEditing(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const newUser = await updateUser({ ...values, phone: "+55" + values.phone.replaceAll(" ", "").replaceAll("-", "") });
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

    const updateUser = async (values: { name: string; reminderChannel: "EMAIL" | "SMS" | "VOICEMAIL"; phone?: string }) => {
        try {
            const userToken = await getIdTokenClaims();
            const newUser: User = {
                ...currentUser,
                name: values.name,
                reminderChannel: values.reminderChannel,
                phone: values.phone || "",
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
            actions={
                editing
                    ? [
                          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} style={{ marginRight: 8 }}>
                              Salvar
                          </Button>,
                          <Button
                              icon={<StopOutlined />}
                              onClick={() => {
                                  form.resetFields();
                                  setEditing(false);
                              }}
                              style={{ marginRight: 8, color: "red" }}
                          >
                              Cancelar
                          </Button>,
                      ]
                    : [
                          <Button type="primary" icon={<EditOutlined />} onClick={handleEdit} />,
                          <Popconfirm title="Tem certeza que deseja excluir o usuário?" onConfirm={handleDelete} okText="Sim" cancelText="Não">
                              <Button type="primary" danger icon={<DeleteOutlined />} />
                          </Popconfirm>,
                      ]
            }
        >
            <Meta
                avatar={<Avatar src={<img alt="user-cover" src={currentUser.picture} style={{ objectFit: "cover" }} />} size={"large"} />}
                title={
                    editing ? (
                        <Form
                            form={form}
                            onFinish={handleSave}
                            initialValues={{ name: currentUser.name, reminderChannel: currentUser.reminderChannel, phone: currentUser.phone.replace("+55", "") }}
                        >
                            <Form.Item name="name" rules={[{ required: true, message: "Por favor, insira o nome." }]}>
                                <Input prefix={<UserOutlined />} placeholder="Nome" />
                            </Form.Item>
                            <Form.Item name="reminderChannel" rules={[{ required: true, message: "Por favor, selecione o canal de lembrete." }]}>
                                <Radio.Group>
                                    <Radio.Button value="EMAIL">E-mail</Radio.Button>
                                    <Radio.Button value="SMS">SMS</Radio.Button>
                                    <Radio.Button value="VOICEMAIL">Torpedo de voz</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item name="phone" rules={[{ required: true, message: "Por favor, insira o número de telefone." }, { validator: validatePhoneNumber }]}>
                                <Input addonBefore="+55" placeholder="Número de telefone" value={phoneNumber} onChange={e => formatPhoneNumberInput(e.target.value)} />
                            </Form.Item>
                        </Form>
                    ) : (
                        <span>{currentUser.name}</span>
                    )
                }
                description={
                    <>
                        {!editing && <div>{currentUser.email}</div>}
                        {!editing && <div>{formatPhoneNumber(currentUser.phone)}</div>}
                        {!editing && <div>Canal de Lembretes: {currentUser.reminderChannel.replace("VOICEMAIL", "Torpedo de voz").replace("EMAIL", "E-mail")}</div>}
                    </>
                }
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
