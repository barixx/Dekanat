import { useEffect, useState } from "react";
import { apiFetch } from '../utils/apiFetch'; // Используем ваш `apiFetch`
import { motion } from "framer-motion"; // Для анимации
import { AiOutlineWarning, AiOutlinePlus, AiOutlineSave,AiOutlineMinus} from "react-icons/ai"; // Для иконок


interface Teacher {
  id: number;
  fullName: string;
  maxHours: number;
}

interface Discipline {
  id: number;
  name: string;
}

interface Group {
  id: number;
  name: string;
}

interface TypeOfLesson {
  id: number;
  name: string;
  hours: number;
}

interface TeacherDiscipline {
  id: number;
  teacherId: number;
  disciplineId: number;
}

interface DisciplineGroup {
  id: number;
  disciplineId: number;
  groupId: number;
}

interface LoadRow {
  teacherName: string;
  disciplineName: string;
  typeOfLesson: string;
  groupName: string;
  hours: number;
}

export default function LoadPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [typeOfLessons, setTypeOfLessons] = useState<TypeOfLesson[]>([]);
  const [teacherDisciplines, setTeacherDisciplines] = useState<TeacherDiscipline[]>([]);
  const [disciplineGroups, setDisciplineGroups] = useState<DisciplineGroup[]>([]);
  const [loadData, setLoadData] = useState<LoadRow[]>([]);
  const [newLoadRows, setNewLoadRows] = useState<LoadRow[]>([]);
  const [overloadTeachers, setOverloadTeachers] = useState<string[]>([]);
  const [fullName, setFullName] = useState<string | null>(null);
   const [role, setRole] = useState<string | null>(null);
   console.log("role from localStorage:", role);
    const isAdmin = role === "admin";
   useEffect(() => {
     setRole(localStorage.getItem("role")); // Загружаем роль из localStorage
     setFullName(localStorage.getItem("fullName"));
     fetchInitialData();
     fetchLastLoad();
   }, []);

   useEffect(() => {
     checkOverloads();
   }, [newLoadRows]);

   const fetchInitialData = async () => {
     try {
       const [
         teachersRes,
         disciplinesRes,
         groupsRes,
         typeOfLessonsRes,
         teacherDisciplinesRes,
         disciplineGroupsRes
       ] = await Promise.all([
         apiFetch("http://localhost:3000/teachers"),
         apiFetch("http://localhost:3000/disciplines"),
         apiFetch("http://localhost:3000/groups"),
         apiFetch("http://localhost:3000/type-of-lessons"),
         apiFetch("http://localhost:3000/teacher-disciplines"),
         apiFetch("http://localhost:3000/discipline-groups"),
       ]);

       setTeachers(await teachersRes.json());
       setDisciplines(await disciplinesRes.json());
       setGroups(await groupsRes.json());
       setTypeOfLessons(await typeOfLessonsRes.json());
       setTeacherDisciplines(await teacherDisciplinesRes.json());
       setDisciplineGroups(await disciplineGroupsRes.json());
     } catch (error) {
       console.error('Ошибка загрузки данных:', error);
     }
   };

   const fetchLastLoad = async () => {
     try {
       const res = await apiFetch("http://localhost:3000/loads/last");
       const data = await res.json();
       if (data) {
         setLoadData(data.data);
       }
     } catch (error) {
       console.error('Ошибка загрузки последней нагрузки:', error);
     }
   };

   const addNewRow = () => {
     setNewLoadRows([...newLoadRows, {
       teacherName: "",
       disciplineName: "",
       typeOfLesson: "",
       groupName: "",
       hours: 0,
     }]);
   };

   const handleNewRowChange = (index: number, field: keyof LoadRow, value: any) => {
     const updated = [...newLoadRows];
     updated[index][field] = value;

     if (field === "typeOfLesson") {
       const selectedType = typeOfLessons.find(t => t.name === value);
       updated[index].hours = selectedType ? selectedType.hours : 0;
     }

     setNewLoadRows(updated);
   };

   const saveNewLoad = async () => {
     const invalidRows = newLoadRows.filter(row => !isRowValid(row));

     if (invalidRows.length > 0) {
         alert("Пожалуйста, заполните все поля в каждой строке перед сохранением.");
         return;
       }
    if (!areAllDisciplinesCovered()) {
       alert("Каждая дисциплина должна быть выбрана хотя бы один раз.");
       return;
     }

     if (overloadTeachers.length > 0) {
       alert("Есть преподаватели с превышением лимита часов! Сначала исправьте ошибки.");
       return;
     }

     try {
       const response = await apiFetch("http://localhost:3000/loads", {
         method: 'POST',
         body: JSON.stringify({ data: newLoadRows }),
       });

       if (response?.ok) {
         alert("Нагрузка успешно сохранена!");
         fetchLastLoad();
         setNewLoadRows([]);
       } else {
         alert("Ошибка при сохранении нагрузки");
       }
     } catch (error) {
       console.error('Ошибка при сохранении нагрузки:', error);
       alert("Ошибка при сохранении нагрузки");
     }
   };

   const getAvailableDisciplines = (teacherName: string, groupName: string) => {
     const teacher = teachers.find(t => t.fullName === teacherName);
     const group = groups.find(g => g.name === groupName);

     let teacherDisciplineIds: number[] = [];
     let groupDisciplineIds: number[] = [];

     if (teacher) {
       teacherDisciplineIds = teacherDisciplines
         .filter(td => td.teacherId === teacher.id)
         .map(td => td.disciplineId);
     }

     if (group) {
       groupDisciplineIds = disciplineGroups
         .filter(dg => dg.groupId === group.id)
         .map(dg => dg.disciplineId);
     }

     const availableDisciplineIds = teacher && group
       ? teacherDisciplineIds.filter(id => groupDisciplineIds.includes(id))
       : teacher
         ? teacherDisciplineIds
         : group
           ? groupDisciplineIds
           : disciplines.map(d => d.id);

     return disciplines.filter(d => availableDisciplineIds.includes(d.id));
   };
    const removeRow = (index: number) => {
      const updated = [...newLoadRows];
      updated.splice(index, 1);
      setNewLoadRows(updated);
    };
   const checkOverloads = () => {
     const overloads: string[] = [];

     teachers.forEach(teacher => {
       const teacherRows = newLoadRows.filter(row => row.teacherName === teacher.fullName);
       const totalHours = teacherRows.reduce((sum, row) => sum + row.hours, 0);

       if (totalHours > teacher.maxHours) {
         overloads.push(teacher.fullName);
       }
     });

     setOverloadTeachers(overloads);
   };
   const isRowValid = (row: LoadRow) => {
     return (
       row.teacherName.trim() !== "" &&
       row.disciplineName.trim() !== "" &&
       row.typeOfLesson.trim() !== "" &&
       row.groupName.trim() !== ""
     );
   };
   const isTeacherOverloaded = (teacherName: string) => {
     return overloadTeachers.includes(teacherName);
   };
   const areAllDisciplinesCovered = () => {
     const selectedDisciplineNames = newLoadRows.map(row => row.disciplineName);
     const requiredDisciplineNames = disciplines.map(d => d.name);

     return requiredDisciplineNames.every(name => selectedDisciplineNames.includes(name));
   };
   const handlePrintLoad = () => {
     const printContent = document.getElementById("print-section");
     const printWindow = window.open("", "_blank");

     if (printWindow && printContent) {
       printWindow.document.write(`
         <html>
           <head>
             <title>Печать нагрузки</title>
             <style>
               table { width: 100%; border-collapse: collapse; }
               th, td { border: 1px solid #333; padding: 8px; text-align: left; }
               th { background-color: #f3f3f3; }
             </style>
           </head>
           <body>
             ${printContent.innerHTML}
           </body>
         </html>
       `);
       printWindow.document.close();
       printWindow.print();
     }
   };
   const getAvailableGroups = (disciplineName: string, teacherName: string) => {
     const discipline = disciplines.find(d => d.name === disciplineName);
     const teacher = teachers.find(t => t.fullName === teacherName);

     let disciplineGroupIds: number[] = [];

     if (discipline) {
       disciplineGroupIds = disciplineGroups
         .filter(dg => dg.disciplineId === discipline.id)
         .map(dg => dg.groupId);
     }

     return groups.filter(g => disciplineGroupIds.includes(g.id));
   };

    const canBeSupervisor = (teacherName: string) => {
      const teacher = teachers.find(t => t.fullName === teacherName);
      if (!teacher || !teacher.allowedUntil) return false;

      return new Date(teacher.allowedUntil) >= new Date();
    };
   if (role === null) {
     return <div className="p-6 text-center text-gray-600">Загрузка...</div>;
   }
     const visibleLoadData = isAdmin
       ? loadData
       : loadData.filter(row => row.teacherName === fullName);
    return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Заголовок */}
      <motion.h1
        className="text-3xl font-extrabold text-gray-800 mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Нагрузка преподавателей
      </motion.h1>

      {/* Последняя сохраненная нагрузка */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-700">
          Последняя сохранённая нагрузка
        </h2>
        <div id="print-section">
        <table className="w-full mb-10 bg-white shadow-sm border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left text-gray-700">Преподаватель</th>
              <th className="border px-4 py-2 text-left text-gray-700">Дисциплина</th>
              <th className="border px-4 py-2 text-left text-gray-700">Тип занятия</th>
              <th className="border px-4 py-2 text-left text-gray-700">Группа</th>
              <th className="border px-4 py-2 text-left text-gray-700">Часы</th>
              <th className="border px-4 py-2 text-center text-gray-700">Дипломники</th>
            </tr>
          </thead>
          <tbody>
            {visibleLoadData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{row.teacherName}</td>
                <td className="border px-4 py-2">{row.disciplineName}</td>
                <td className="border px-4 py-2">{row.typeOfLesson}</td>
                <td className="border px-4 py-2">{row.groupName}</td>
                <td className="border px-4 py-2">{row.hours}</td>
                <td className="border px-4 py-2">{row.graduateCount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>

        </div >
        <button
          className="mt-4 mb-6 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
          onClick={handlePrintLoad}
        >
          Печать нагрузки
        </button>
      </motion.div>

      {/* Добавление новой строки (только для админа) */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            Добавить новую нагрузку
          </h2>

          <button
            className="flex items-center gap-2 px-4 py-2 mb-6 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={addNewRow}
          >
            <AiOutlinePlus className="text-lg" />
            Добавить строку
          </button>

          <table className="w-full bg-white shadow-sm border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left text-gray-700">Преподаватель</th>
                <th className="border px-4 py-2 text-left text-gray-700">Дисциплина</th>
                <th className="border px-4 py-2 text-left text-gray-700">Тип занятия</th>
                <th className="border px-4 py-2 text-left text-gray-700">Группа</th>
                <th className="border px-4 py-2 text-left text-gray-700">Часы</th>
                <th className="border px-4 py-2 text-center text-gray-700">Дипломники</th>
                <th className="border px-4 py-2 text-center text-gray-700">Удалить</th>
              </tr>
            </thead>
            <tbody>
              {newLoadRows.map((row, index) => (
                <tr key={index} className={isTeacherOverloaded(row.teacherName) ? "bg-red-100" : ""}>
                  <td className="border px-4 py-2">
                    <select
                      className="border rounded px-2 py-1 w-full"
                      value={row.teacherName}
                      onChange={(e) => handleNewRowChange(index, "teacherName", e.target.value)}
                    >
                      <option value="">Выберите</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.fullName}>
                          {teacher.fullName}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border px-4 py-2">
                    <select
                      className="border rounded px-2 py-1 w-full"
                      value={row.disciplineName}
                      onChange={(e) => handleNewRowChange(index, "disciplineName", e.target.value)}
                    >
                      <option value="">Выберите</option>
                      {getAvailableDisciplines(row.teacherName, row.groupName).map(discipline => (
                        <option key={discipline.id} value={discipline.name}>
                          {discipline.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border px-4 py-2">
                    <select
                      className="border rounded px-2 py-1 w-full"
                      value={row.typeOfLesson}
                      onChange={(e) => handleNewRowChange(index, "typeOfLesson", e.target.value)}
                    >
                      <option value="">Выберите</option>
                      {typeOfLessons.map(type => (
                        <option key={type.id} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border px-4 py-2">
                    <select
                      className="border rounded px-2 py-1 w-full"
                      value={row.groupName}
                      onChange={(e) => handleNewRowChange(index, "groupName", e.target.value)}
                    >
                      <option value="">Выберите</option>
                      {getAvailableGroups(row.disciplineName, row.teacherName).map(group => (
                        <option key={group.id} value={group.name}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {row.hours}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {canBeSupervisor(row.teacherName) ? (
                      <input
                        type="number"
                        min={0}
                        className="border px-2 py-1 w-20 rounded text-center"
                        value={row.graduateCount ?? 0}
                        onChange={(e) =>
                          handleNewRowChange(index, "graduateCount", Number(e.target.value))
                        }
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => removeRow(index)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Удалить строку"
                    >
                      <AiOutlineMinus />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Превышение лимита (только для админа) */}
      {isAdmin && overloadTeachers.length > 0 && (
        <motion.div
          className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <strong className="font-bold">Ошибка!</strong>
          <ul className="list-disc list-inside">
            {overloadTeachers.map(name => (
              <li key={name}>Превышение лимита часов у преподавателя: {name}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Кнопка сохранения (только для админа) */}
      {isAdmin && (
        <motion.div
          className="flex justify-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <button
            className={`flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition ${
              overloadTeachers.length > 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={saveNewLoad}
            disabled={overloadTeachers.length > 0}
          >
            <AiOutlineSave className="text-lg" />
            Сохранить нагрузку
          </button>
        </motion.div>
      )}
    </div>
    );
  }