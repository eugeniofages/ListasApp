import React from "react";
import { useNavigate } from "react-router-dom";
const Lista = ({ lista }) => {
  const navigate = useNavigate();
  const navigateToList = (idList) => {
    navigate(`/panel/lista/${idList}`);

  };
  return (
    <div
      onClick={() => navigateToList(lista.id)}
      className="max-w-sm rounded overflow-hidden shadow-lg"
    >
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{lista.name}</div>
        <p className="text-gray-700 text-base">{lista.description}</p>
      </div>
      <div className="flex flex-col px-6 pt-4 pb-2">
        {lista.tasks.length > 0 ? (
          lista.tasks.map((task, i) => (
            <span
              key={i}
              className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
            >
              {task.name}
            </span>
          ))
        ) : (
          <h2>Esta lista esta sin tareas. Agrega una</h2>
        )}
      </div>
    </div>
  );
};

export default Lista;
