import React, { useEffect, useState } from "react";
import { Form, Checkbox, TimePicker, Button, Row, Select, Spin, Input, notification, AutoComplete } from "antd";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import dayjs from "dayjs";
import type { NotificationPlacement } from "antd/es/notification/interface";

const { Item } = Form;
const { Option } = Select;
const format = "HH:mm";
const daysOfWeekOptions = [
    { label: "Segunda-feira", value: "Segunda-feira" },
    { label: "Terça-feira", value: "Terça-feira" },
    { label: "Quarta-feira", value: "Quarta-feira" },
    { label: "Quinta-feira", value: "Quinta-feira" },
    { label: "Sexta-feira", value: "Sexta-feira" },
    { label: "Sábado", value: "Sábado" },
    { label: "Domingo", value: "Domingo" },
];

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
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Form onFinish={handleFormSubmit} layout="vertical" style={{ padding: 10 }}>
            {contextHolder}
            <Item label="Nome completo" name="fullName" rules={[{ required: true, message: "Por favor, insira o nome completo" }]}>
                <AutoComplete
                    placeholder="Nome completo"
                    options={nameOptions.map(name => ({ value: name }))}
                    filterOption={(inputValue, option) => option?.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1}
                />
            </Item>

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

            <Form.Item label="Dias da semana" name="daysOfWeek" rules={[{ required: true, message: "Por favor, selecione os dias da semana" }]}>
                <Checkbox.Group style={{ width: "100%" }}>
                    <Row>
                        {daysOfWeekOptions.map(option => (
                            <Checkbox key={option.value} value={option.value} style={{ margin: "0 8px 8px 0" }}>
                                {option.label}
                            </Checkbox>
                        ))}
                    </Row>
                </Checkbox.Group>
            </Form.Item>

            <Item label="Horário" name="hour" rules={[{ required: true, message: "Por favor, selecione o horário de lembrete" }]}>
                <TimePicker format={format} placeholder="12:00" inputReadOnly={true} showNow={false} />
            </Item>

            <Item>
                <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
                    Agendar Lembrete
                </Button>
            </Item>
        </Form>
    );
};

export default RegisterReminderComponent;
