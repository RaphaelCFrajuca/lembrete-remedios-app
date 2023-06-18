import React, { useEffect, useState } from "react";
import { Form, TimePicker, Button, Spin, notification, Select, AutoComplete, Row, Col } from "antd";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import dayjs from "dayjs";
import type { NotificationPlacement } from "antd/es/notification/interface";

const { Item } = Form;
const { Option } = Select;
const format = "HH:mm";
const daysOfWeekOptions = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

const RegisterReminderComponent: React.FC = () => {
    const [medications, setMedications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { getIdTokenClaims } = useAuth0();
    const apiUrl = process.env.REACT_APP_API_URL;
    const [api, contextHolder] = notification.useNotification();
    const [nameOptions, setNameOptions] = useState<string[]>([]);

    const successNotification = (placement: NotificationPlacement, message: string, description: string) => {
        api.success({
            message: message,
            description: description,
            placement,
        });
    };

    const errorNotification = (placement: NotificationPlacement, message: string, description: string) => {
        api.error({
            message: message,
            description: description,
            placement,
        });
    };

    const fetchNames = async () => {
        try {
            const jwtToken = (await getIdTokenClaims())?.__raw;
            const response = await axios.get(`${apiUrl}/reminder/name`, {
                headers: { Authorization: `Bearer ${jwtToken}` },
            });
            const names = response.data;
            setNameOptions(names);
        } catch (error) {
            console.error(error);
            setNameOptions([]);
        }
    };

    const fetchMedications = async () => {
        try {
            const jwtToken = (await getIdTokenClaims())?.__raw;
            const response = await axios.get(`${apiUrl}/medications`, {
                headers: { Authorization: `Bearer ${jwtToken}` },
            });
            const medications = response.data;
            setMedications(medications);
        } catch (error) {
            errorNotification("top", "Erro ao obter lista de medicamentos!", "");
            console.error("Erro ao obter os dados:", error);
            setMedications([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMedications();
        fetchNames();
    }, []);

    const handleFormSubmit = (values: any) => {
        successNotification("top", "Lembrete salvo com sucesso!", "");
        getIdTokenClaims().then(token => {
            axios
                .post(`${apiUrl}/reminder/new`, { ...values, hour: dayjs(values.hour).format(format) }, { headers: { Authorization: `Bearer ${token?.__raw}` } })
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error(error);
                    errorNotification("top", "Erro ao salvar lembrete!", error);
                });
        });
    };

    if (isLoading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Form onFinish={handleFormSubmit} layout="vertical" style={{ padding: 10 }}>
            {contextHolder}
            <Row gutter={16}>
                <Col span={12}>
                    <Item label="Nome completo" name="fullName" rules={[{ required: true, message: "Por favor, insira o nome completo" }]}>
                        <AutoComplete
                            placeholder="Nome completo"
                            options={nameOptions.map(name => ({ value: name }))}
                            filterOption={(inputValue, option) => option?.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1}
                        />
                    </Item>
                </Col>
                <Col span={12}>
                    <Item label="Nome do remédio" name="medicationName" rules={[{ required: true, message: "Por favor, selecione o nome do remédio" }]}>
                        <Select
                            showSearch
                            style={{ width: "100%" }}
                            placeholder="Remédio"
                            optionFilterProp="children"
                            filterOption={(input, option) => (option?.label?.toLowerCase() ?? "").includes(input?.toLowerCase())}
                            options={[
                                {
                                    value: "Medicamento não identificado",
                                    label: "Outros...",
                                },
                                ...medications,
                            ]}
                        />
                    </Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Item label="Dias da semana" name="daysOfWeek" rules={[{ required: true, message: "Por favor, selecione os dias da semana" }]}>
                        <Select mode="multiple" placeholder="Selecione os dias da semana" allowClear>
                            {daysOfWeekOptions.map(option => (
                                <Option key={option} value={option}>
                                    {option}
                                </Option>
                            ))}
                        </Select>
                    </Item>
                </Col>
                <Col span={12}>
                    <Item label="Horário" name="hour" rules={[{ required: true, message: "Por favor, selecione o horário de lembrete" }]}>
                        <TimePicker format={format} placeholder="12:00" inputReadOnly={true} showNow={false} />
                    </Item>
                </Col>
            </Row>

            <Item>
                <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
                    Agendar Lembrete
                </Button>
            </Item>
        </Form>
    );
};

export default RegisterReminderComponent;
