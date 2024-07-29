import React, { useEffect } from "react";
import useLists from "../hooks/useLists";
import Lista from "./Lista";

export default function Listas() {
  const { getLists, tasks, getSharedLists, sharedTasks } = useLists();

  useEffect(() => {
    getListasCompartidasUser();
    getListasUser();
  }, []);
  const getListasUser = () => {
    getLists();
  };

  const getListasCompartidasUser = () => {
    getSharedLists();
  };

  return (
    <div className="grid grid-cols-2 justify-center">
      <div>
        <h1 className="text-xl font-bold uppercase text-center">Mis listas</h1>
        <div className="grid grid-cols-3 gap-5 cursor-pointer">
          {tasks?.length > 0 ? (
            tasks.map((task, key) => <Lista key={key} lista={task} />)
          ) : (
            <h1 className="p-5 text-lg font-bold text-amber-700">
              No tienes ninguna lista creada
            </h1>
          )}
        </div>
      </div>
      <div>
        <h1 className="text-xl font-bold uppercase text-center">
          Listas compartidas conmigo
        </h1>
        <div className="grid grid-cols-3 gap-5 cursor-pointer">

        {sharedTasks?.length > 0 ? (
            sharedTasks.map((task, key) => <Lista key={key} lista={task} />)
          ) : (
            <h1 className="p-5 text-lg font-bold text-amber-700">
              Ningun usuario compartido listas contigo ...
            </h1>
          )}

        </div>
      </div>
    </div>
  );
}
