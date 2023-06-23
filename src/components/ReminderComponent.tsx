import React, { useEffect, useState } from "react";
import { Form, Table, Button, InputNumber, Input, Typography, Space, Popconfirm, notification, Cascader, TimePicker } from "antd";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { NotificationPlacement } from "antd/es/notification/interface";
import { DeleteOutlined, EditOutlined, SaveOutlined, StopOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface Reminder {
    level: 2;
    key: React.Key;
    uniqueId: number;
    medication: string;
    hour: string;
}

interface ReminderList {
    level: 1;
    key: React.Key;
    uniqueId: number;
    dayOfWeek: string;
    reminders: Reminder[];
}

interface User {
    level: 0;
    key: React.Key;
    uniqueId: number;
    name: string;
    reminderList: ReminderList[];
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    inputType: "number" | "text" | "week" | "hour";
    record: any;
    index: number;
    children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
    let inputNode = <Input />;
    switch (inputType) {
        case "number":
            inputNode = <InputNumber />;
            break;
        case "text":
            inputNode = <Input />;
            break;
        case "week":
            inputNode = (
                <Cascader
                    options={[
                        {
                            value: "Segunda-feira",
                            label: "Segunda-feira",
                        },
                        {
                            value: "Terça-feira",
                            label: "Terça-feira",
                        },
                        {
                            value: "Quarta-feira",
                            label: "Quarta-feira",
                        },
                        {
                            value: "Quinta-feira",
                            label: "Quinta-feira",
                        },
                        {
                            value: "Sexta-feira",
                            label: "Sexta-feira",
                        },
                        {
                            value: "Sábado",
                            label: "Sábado",
                        },
                        {
                            value: "Domingo",
                            label: "Domingo",
                        },
                    ]}
                />
            );
            break;
        case "hour":
            if (dataIndex === "hour") {
                inputNode = <TimePicker format={"HH:mm"} inputReadOnly={true} showNow={false} />;
            }
            break;
    }

    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{ margin: 0 }}
                    rules={[
                        {
                            required: true,
                            message: `Por favor insira: ${title}!`,
                        },
                    ]}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

const daysOfWeekMap: { [key: string]: string } = {
    monday: "Segunda-feira",
    tuesday: "Terça-feira",
    wednesday: "Quarta-feira",
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    saturday: "Sábado",
    sunday: "Domingo",
};

const getPortugueseDayOfWeek = (dayOfWeek: string[] | string) => {
    return daysOfWeekMap[dayOfWeek[0].toLowerCase()] || dayOfWeek;
};

const ReminderComponent: React.FC = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const { getIdTokenClaims } = useAuth0();
    const [editingKey, setEditingKey] = useState("");
    const [editingLevel, setEditingLevel] = useState<number>();
    const [editingRecord, setEditingRecord] = useState<Partial<any>>({});
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [dataSource, setDataSource] = useState<User[]>([]);
    const [api, contextHolder] = notification.useNotification();

    const sucessNotification = (placement: NotificationPlacement, message: string, description: string) => {
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

    const fetchReminders = async () => {
        try {
            setLoading(true);
            const jwtToken = await getIdTokenClaims();
            const response = await axios.get(`${apiUrl}/reminder`, {
                headers: { Authorization: `Bearer ${jwtToken?.__raw}` },
                params: { email: jwtToken?.email },
            });
            const reminders = response.data;
            setDataSource(reminders);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReminders();
    }, []);

    const isEditing = (record: any, level: number) => {
        return record === editingRecord;
    };

    const edit = (record: Partial<any> & { key: React.Key; level: number }) => {
        setEditingRecord(record);
        setEditingKey(record.key as string);
        setEditingLevel(record.level);
        if (record.hour) {
            record.hour = dayjs(record.hour, "HH:mm");
        }
        form.setFieldsValue({ ...record });
    };

    useEffect(() => {
        setLoading(false);
    }, [dataSource]);

    const cancel = () => {
        setEditingKey("");
        setEditingLevel(0);
        setEditingRecord({});
        form.resetFields();
    };

    const columns = [
        {
            title: "Nome",
            dataIndex: "name",
            editable: true,
        },
        {
            title: "Ação",
            dataIndex: "action",
            render: (_: any, record: User) => {
                const editable = isEditing(record, 0);
                return editable ? (
                    <span>
                        <Button icon={<SaveOutlined />} onClick={() => handleSave(record, 0)} style={{ marginRight: 8, color: "green" }}>
                            Salvar
                        </Button>
                        <Button icon={<StopOutlined />} onClick={() => cancel()} style={{ marginRight: 8, color: "red" }}>
                            Cancelar
                        </Button>
                    </span>
                ) : (
                    <Space size="middle">
                        <Popconfirm title="Tem certeza que deseja excluir?" okText="Sim" cancelText="Não" onConfirm={() => handleDelete(record, 0)}>
                            <Button icon={<DeleteOutlined />} danger type="primary">
                                Excluir
                            </Button>
                        </Popconfirm>
                        <Button icon={<EditOutlined />} type="primary" disabled={editingKey !== ""} onClick={() => edit(record)}>
                            Editar
                        </Button>
                    </Space>
                );
            },
        },
    ];

    const mergedColumns = columns.map(col => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: User) => ({
                record,
                inputType: "text",
                dataIndex: col.dataIndex,
                title: col.title,
                editing: editingRecord === record,
            }),
        };
    });

    const firstExpandedColumns = [
        {
            title: "Dia da semana",
            dataIndex: "dayOfWeek",
            editable: true,
            render: (dayOfWeek: string[]) => getPortugueseDayOfWeek(dayOfWeek),
        },
        {
            title: "Ação",
            dataIndex: "action",
            render: (_: any, record: ReminderList) => {
                const editable = isEditing(record, 1);
                return editable ? (
                    <span>
                        <Button icon={<SaveOutlined />} onClick={() => handleSave(record, 1)} style={{ marginRight: 8, color: "green" }}>
                            Salvar
                        </Button>
                        <Button icon={<StopOutlined />} onClick={() => cancel()} style={{ marginRight: 8, color: "red" }}>
                            Cancelar
                        </Button>
                    </span>
                ) : (
                    <Space size="middle">
                        <Popconfirm title="Tem certeza que deseja excluir?" okText="Sim" cancelText="Não" onConfirm={() => handleDelete(record, 1)}>
                            <Button icon={<DeleteOutlined />} danger type="primary">
                                Excluir
                            </Button>
                        </Popconfirm>
                        <Button icon={<EditOutlined />} type="primary" disabled={editingKey !== ""} onClick={() => edit(record)}>
                            Editar
                        </Button>
                    </Space>
                );
            },
        },
    ];

    const mergedFirstExpandedColumns = firstExpandedColumns.map(col => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: ReminderList) => ({
                record,
                inputType: "week",
                dataIndex: col.dataIndex,
                title: col.title,
                editing: editingRecord === record,
            }),
        };
    });

    const secondExpandedColumns = [
        {
            title: "Remédio",
            dataIndex: "medication",
            editable: true,
        },
        {
            title: "Hora",
            dataIndex: "hour",
            editable: true,
        },
        {
            title: "Ação",
            dataIndex: "action",
            render: (_: any, record: Reminder) => {
                const editable = isEditing(record, 2);
                return editable ? (
                    <span>
                        <Button onClick={() => handleSave(record, 2)} style={{ marginRight: 8 }}>
                            Salvar
                        </Button>
                        <Button icon={<StopOutlined />} onClick={() => cancel()} style={{ marginRight: 8, color: "red" }}>
                            Cancelar
                        </Button>
                    </span>
                ) : (
                    <Space size="middle">
                        <Popconfirm title="Tem certeza que deseja excluir?" okText="Sim" cancelText="Não" onConfirm={() => handleDelete(record, 2)}>
                            <Button icon={<DeleteOutlined />} danger type="primary">
                                Excluir
                            </Button>
                        </Popconfirm>
                        <Button icon={<EditOutlined />} type="primary" disabled={editingKey !== ""} onClick={() => edit(record)}>
                            Editar
                        </Button>
                    </Space>
                );
            },
        },
    ];

    const mergedSecondExpandedColumns = secondExpandedColumns.map(col => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: Reminder) => ({
                record,
                inputType: "hour",
                dataIndex: col.dataIndex,
                title: col.title,
                editing: editingRecord === record,
            }),
        };
    });

    const handleSave = async (record: Partial<any>, level: number) => {
        let updatedData: User[] = dataSource;
        let row: any;
        try {
            row = await form.validateFields();
        } catch (error) {
            console.log(error);
        }

        switch (level) {
            case 0: {
                updatedData = dataSource.map(item => {
                    if (item.uniqueId === record.uniqueId && item.key === record.key && item.level === record.level) {
                        return { ...item, name: row.name };
                    } else {
                        return item;
                    }
                });
                setEditingKey("");
                setEditingLevel(0);
                setEditingRecord({});
                break;
            }
            case 1: {
                const weekDay: any[] = [];
                updatedData = dataSource.map(item => {
                    const filteredReminderList = item.reminderList.map(reminder => {
                        if (reminder.key === reminder.key && reminder.dayOfWeek === record.dayOfWeek && reminder.uniqueId === record.uniqueId) {
                            const updatedReminders: Reminder[] = reminder.reminders;
                            let dayOfWeek = row.dayOfWeek;
                            if (typeof dayOfWeek === "object") {
                                dayOfWeek = dayOfWeek[0];
                            }
                            const updatedList: ReminderList = {
                                ...reminder,
                                dayOfWeek: dayOfWeek,
                            };
                            weekDay.push({ ...updatedList, reminders: updatedReminders });
                            return { ...updatedList, reminders: updatedReminders };
                        }
                        weekDay.push(reminder);
                        return reminder;
                    });
                    return { ...item, reminderList: filteredReminderList };
                });

                updatedData.map(item => {
                    const filteredReminderList = item.reminderList.map((reminder, index) => {
                        const weekNameIndex = weekDay.findIndex(item => item.dayOfWeek === reminder.dayOfWeek);
                        if (weekNameIndex !== index) {
                            errorNotification("top", `O dia ${reminder.dayOfWeek} já existe no agendamento!`, "");
                            updatedData = dataSource;
                        }
                        return { ...reminder, reminders: reminder.reminders };
                    });
                    return { ...item, reminderList: filteredReminderList };
                }),
                    setEditingKey("");
                setEditingLevel(0);
                setEditingRecord({});
                break;
            }
            case 2: {
                updatedData = dataSource.map(item => {
                    const filteredReminderList = item.reminderList.map(reminder => {
                        const updatedReminders = reminder.reminders.map(reminderItem => {
                            if (reminderItem.key === record.key && reminderItem.medication === record.medication && reminderItem.hour === record.hour) {
                                return { ...reminderItem, medication: row.medication, hour: dayjs(row.hour).format("HH:mm") };
                            }
                            return reminderItem;
                        });
                        return { ...reminder, reminders: updatedReminders };
                    });
                    return { ...item, reminderList: filteredReminderList };
                });
                setEditingKey("");
                setEditingLevel(0);
                setEditingRecord({});
                break;
            }
        }
        setDataSource(updatedData);
        if (dataSource !== updatedData) {
            getIdTokenClaims().then(token => {
                axios
                    .put(`${apiUrl}/reminder/update`, updatedData, { headers: { Authorization: `Bearer ${token?.__raw}` } })
                    .then(response => {
                        console.log(response.data);
                        sucessNotification("top", "Dados atualizados com sucesso!", "");
                    })
                    .catch(error => {
                        errorNotification("top", "Houve um erro ao atualizar os dados!", error);
                        console.error(error);
                    });
            });
        }
    };

    const handleDelete = (record: Partial<any>, level: number) => {
        let updatedData: User[] = dataSource;

        switch (level) {
            case 0: {
                updatedData = updatedData.filter(item => item !== record);
                break;
            }
            case 1: {
                updatedData = updatedData.map(item => {
                    const filteredReminders = item.reminderList.filter(reminder => reminder !== record);
                    return { ...item, reminderList: filteredReminders };
                });
                break;
            }
            case 2: {
                updatedData = updatedData.map(item => {
                    const filteredReminderList = item.reminderList.map(reminder => {
                        const filteredReminders = reminder.reminders.filter(r => r !== record);
                        return { ...reminder, reminders: filteredReminders };
                    });
                    return { ...item, reminderList: filteredReminderList };
                });
                break;
            }
        }

        setDataSource(updatedData);
        getIdTokenClaims().then(token => {
            axios
                .delete(`${apiUrl}/reminder/delete`, { headers: { Authorization: `Bearer ${token?.__raw}` }, data: updatedData })
                .then(response => {
                    console.log(response.data);
                    sucessNotification("top", "Dados atualizados com sucesso!", "");
                })
                .catch(error => {
                    errorNotification("top", "Houve um erro ao atualizar os dados!", error);
                    console.error(error);
                });
        });
    };

    return (
        <Form form={form} component={false}>
            {contextHolder}
            <Table
                loading={loading}
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
                pagination={{
                    onChange: cancel,
                }}
                dataSource={dataSource}
                columns={mergedColumns}
                style={{ overflow: "auto" }}
                expandable={{
                    expandedRowRender: (record: User) => {
                        return (
                            <Table
                                components={{
                                    body: {
                                        cell: EditableCell,
                                    },
                                }}
                                pagination={{
                                    onChange: cancel,
                                }}
                                columns={mergedFirstExpandedColumns}
                                dataSource={record.reminderList}
                                rowKey={(record: ReminderList) => record.key.toString()}
                                expandable={{
                                    expandedRowRender: (record: ReminderList) => {
                                        return (
                                            <Table
                                                components={{
                                                    body: {
                                                        cell: EditableCell,
                                                    },
                                                }}
                                                pagination={{
                                                    onChange: cancel,
                                                }}
                                                columns={mergedSecondExpandedColumns}
                                                dataSource={record.reminders}
                                                rowKey={(record: Reminder) => record.key.toString()}
                                            />
                                        );
                                    },
                                    rowExpandable: (record: ReminderList) => record.reminders.length > 0,
                                }}
                            />
                        );
                    },
                    rowExpandable: (record: User) => record.reminderList.length > 0,
                }}
            />
        </Form>
    );
};

export default ReminderComponent;
