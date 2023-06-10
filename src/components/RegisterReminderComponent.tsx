import React from "react";
import { Form, Input, Checkbox, TimePicker, Button, Space } from "antd";
import dayjs from "dayjs";

const { Item } = Form;
const format = "HH:mm";

const RegisterReminderComponent: React.FC = () => {
    const handleFormSubmit = (values: any) => {
        console.log("Form values:", values);
        // Faça a requisição para a API com os dados do formulário aqui
    };

    return (
        <Form onFinish={handleFormSubmit} layout="vertical">
            <Item label="Nome do remédio" name="medicationName" rules={[{ required: true, message: "Por favor, insira o nome do remédio" }]}>
                <Input placeholder="Nome do remédio" />
            </Item>

            <Item label="Dias da semana" name="daysOfWeek" rules={[{ required: true, message: "Por favor, selecione os dias da semana" }]}>
                <Space direction="vertical">
                    <Checkbox.Group>
                        <Checkbox value="segunda">Segunda-feira</Checkbox>
                        <Checkbox value="terca">Terça-feira</Checkbox>
                        <Checkbox value="quarta">Quarta-feira</Checkbox>
                        <Checkbox value="quinta">Quinta-feira</Checkbox>
                        <Checkbox value="sexta">Sexta-feira</Checkbox>
                        <Checkbox value="sabado">Sábado</Checkbox>
                        <Checkbox value="domingo">Domingo</Checkbox>
                    </Checkbox.Group>
                </Space>
            </Item>

            <Item label="Horário" name="reminders" rules={[{ required: true, message: "Por favor, selecione o horário de lembrete" }]}>
                <TimePicker format={format} defaultValue={dayjs("12:00", format)} />
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
