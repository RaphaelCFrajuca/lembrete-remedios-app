import React from "react";
import { Space, Table, Tag, Alert } from "antd";
import { Link } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import Column from "antd/es/table/Column";

const ReminderComponent: React.FC = () => {
  const reminderData = [
    {
      name: "Raphael Carneiro Frajuca",
      medication: "Dipirona",
      daysOfWeek: ["monday", "thursday", "friday"],
    },
    {
      name: "Raquel dos Santos Carneiro",
      medication: "Diclofenaco Sódio",
      daysOfWeek: ["monday", "thursday", "friday", "saturday", "sunday"],
    },
    {
      name: "Maria de Jesus da Silva Carneiro",
      medication: "Clonazepam",
      daysOfWeek: ["monday", "friday"],
    },
    {
      name: "Jussara dos Santos Barreto",
      medication: "Nimesulida",
      daysOfWeek: ["thursday", "friday", "sunday"],
    },
  ];

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

  return (
    <>
      {reminderData.length === 0 ? (
        <Alert
          message="Nenhum lembrete de remédio cadastrado"
          description={
            <>
              Acesse{" "}
              <Link to="/reminder/new">Agendar Lembretes</Link> para criar um novo lembrete.
            </>
          }
          type="info"
          showIcon
        />
      ) : (
        <Table dataSource={reminderData}>
          <Column title="Nome" dataIndex="name" key="name" />
          <Column title="Remédio" dataIndex="medication" key="medication" />
          <Column
            title="Dias da Semana"
            dataIndex="daysOfWeek"
            key="daysOfWeek"
            render={(tags: string[]) => (
              <>
                {tags.map((tag) => (
                  <Tag color="blue" key={tag}>
                    {getPortugueseDayOfWeek(tag)}
                  </Tag>
                ))}
              </>
            )}
          />
        </Table>
      )}
    </>
  );
};

export default ReminderComponent;
