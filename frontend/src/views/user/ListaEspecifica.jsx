import React, { useEffect, useState } from "react";
import useLists from "../../hooks/useLists";
import Lista from "../../components/Lista";
import { useParams } from "react-router-dom";
import ListaInfo from "../../components/ListaInfo";

export default function ListaEspecifica() {
  const { id } = useParams();
  const { getListById } = useLists();
  const [taskList, setTaskList] = useState(null);

  useEffect(() => {
    const fetchList = async () => {
      const lista = await getListById(id);
      setTaskList(lista);
    };

    fetchList();
  }, [id, getListById]);

  return (
    <div>{taskList ? <ListaInfo lista={taskList} /> : <h1>Loading...</h1>}</div>
  );
}
