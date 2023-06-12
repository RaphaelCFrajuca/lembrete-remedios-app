import React, { useEffect, useState } from "react";
import { Form, Checkbox, TimePicker, Button, Row, Select, Spin } from "antd";
import axios from "axios";

const { Item } = Form;
const format = "HH:mm";

const RegisterReminderComponent: React.FC = () => {
    const [medications, setMedications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMedications = async () => {
        try {
            const response = await axios.get("https://bedi-lembrete-remedios.rj.r.appspot.com/medications");
            const medications = response.data;
            setMedications(medications);
        } catch (error) {
            console.error("Erro ao obter os dados:", error);
            setMedications([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMedications();
    }, []);

    const handleFormSubmit = (values: any) => {
        console.log("Form values:", values);
        // Faça a requisição para a API com os dados do formulário aqui
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
            <Item label="Nome do remédio" name="medicationName" rules={[{ required: true, message: "Por favor, insira o nome do remédio" }]}>
                <Select
                    showSearch
                    style={{ width: 400 }}
                    placeholder="Remédio"
                    optionFilterProp="children"
                    filterOption={(input, option) => (option?.label ?? "").includes(input)}
                    //filterSort={(optionA, optionB) => (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())}
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
                <Checkbox.Group>
                    <Row>
                        <Checkbox value="monday">Segunda-feira</Checkbox>
                        <Checkbox value="tuesday">Terça-feira</Checkbox>
                        <Checkbox value="wednesday">Quarta-feira</Checkbox>
                        <Checkbox value="thursday">Quinta-feira</Checkbox>
                        <Checkbox value="friday">Sexta-feira</Checkbox>
                        <Checkbox value="saturday">Sábado</Checkbox>
                        <Checkbox value="sunday">Domingo</Checkbox>
                    </Row>
                </Checkbox.Group>
            </Form.Item>

            <Item label="Horário" name="reminders" rules={[{ required: true, message: "Por favor, selecione o horário de lembrete" }]}>
                <TimePicker format={format} placeholder="12:00" />
            </Item>

            <Item>
                <Button type="primary" htmlType="submit">
                    Agendar Lembrete
                </Button>
            </Item>
        </Form>
    );
};

export default RegisterReminderComponent;
