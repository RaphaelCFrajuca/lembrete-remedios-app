import React, { useState } from "react";
import { Checkbox, Form, Input, InputNumber, Popconfirm, Space, Table, Tag, Typography } from "antd";

interface ReminderDataType {
    key: React.Key;
    name: string;
    medication: string;
    daysOfWeek: Array<string>;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    inputType: "number" | "text";
    record: ReminderDataType;
    index: number;
    children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
    const inputNode = inputType === "number" ? <InputNumber /> : <Input />;

    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{ margin: 0 }}
                    rules={[
                        {
                            required: true,
                            message: `Please Input ${title}!`,
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

const getPortugueseDayOfWeek = (dayOfWeek: string) => {
    return daysOfWeekMap[dayOfWeek.toLowerCase()] || dayOfWeek;
};

const ReminderComponent: React.FC = () => {
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState<ReminderDataType[]>([
        {
            key: 1,
            name: "Raphael Carneiro Frajuca",
            medication: "Dipirona",
            daysOfWeek: ["monday", "thursday", "friday"],
        },
        {
            key: 2,
            name: "Raquel dos Santos Carneiro",
            medication: "Diclofenaco Sódio",
            daysOfWeek: ["monday", "thursday", "friday", "saturday", "sunday"],
        },
        {
            key: 3,
            name: "Maria de Jesus da Silva Carneiro",
            medication: "Clonazepam",
            daysOfWeek: ["monday", "friday"],
        },
        {
            key: 4,
            name: "Jussara dos Santos Barreto",
            medication: "Nimesulida",
            daysOfWeek: ["thursday", "friday", "sunday"],
        },
    ]);
    const [editingKey, setEditingKey] = useState("");

    const isEditing = (record: ReminderDataType) => record.key === editingKey;

    const edit = (record: Partial<ReminderDataType> & { key: React.Key }) => {
        form.setFieldsValue({ name: "", medication: "", daysOfWeek: [""], ...record });
        setEditingKey(record.key as string);
    };

    const cancel = () => {
        setEditingKey("");
    };

    const save = async (key: React.Key) => {
        try {
            const row = (await form.validateFields()) as ReminderDataType;

            const newData = [...dataSource];
            const index = newData.findIndex(item => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                setDataSource(newData);
                setEditingKey("");
            } else {
                newData.push(row);
                setDataSource(newData);
                setEditingKey("");
            }
        } catch (errInfo) {
            console.log("Validate Failed:", errInfo);
        }
    };

    const handleDelete = (key: number) => {
        const newData = dataSource.filter(item => item.key !== key);
        setDataSource(newData);
    };

    const columns = [
        {
            title: "Nome",
            dataIndex: "name",
            editable: true,
        },
        {
            title: "Remédio",
            dataIndex: "medication",
            editable: true,
        },
        {
            title: "Dias da Semana",
            dataIndex: "daysOfWeek",
            editable: false,
            render: (tags: string[]) => {
                return (
                    <>
                        {tags.map(tag => (
                            <Tag color="blue" key={tag}>
                                {getPortugueseDayOfWeek(tag)}
                            </Tag>
                        ))}
                    </>
                );
            },
        },

        {
            title: "Ação",
            dataIndex: "action",
            render: (_: any, record: ReminderDataType) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8 }}>
                            Salvar
                        </Typography.Link>
                        <Typography.Link onClick={() => cancel()} style={{ marginRight: 8 }}>
                            Cancelar
                        </Typography.Link>
                    </span>
                ) : (
                    <Space size="middle">
                        <Popconfirm title="Tem certeza que deseja excluir?" onConfirm={() => handleDelete(Number(record.key))}>
                            <a>Excluir</a>
                        </Popconfirm>
                        <Typography.Link disabled={editingKey !== ""} onClick={() => edit(record)}>
                            Editar
                        </Typography.Link>
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
            onCell: (record: ReminderDataType) => ({
                record,
                inputType: col.dataIndex,
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    return (
        <Form form={form} component={false}>
            <Table
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
                bordered
                dataSource={dataSource}
                columns={mergedColumns}
                rowClassName="editable-row"
                pagination={{
                    onChange: cancel,
                }}
            />
        </Form>
    );
};

export default ReminderComponent;
