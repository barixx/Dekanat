import { useEffect, useState } from 'react';
import axios from 'axios';

type UserRole = 'admin' | 'teacher';

interface LoadData {
  id: number;
  teacherName: string;
  discipline: string;
  hours: number;
  type: string;
  groupName: string;
  semester: string;
}

interface Teacher {
  id: number;
  fullName: string;
}

interface Group {
  id: number;
  name: string;
}

const currentUser = {
  id: 2,
  name: 'Иванов И.И.',
  role: 'admin' as UserRole, // поменяй на 'teacher' для проверки
};

export default function Load() {
  const [loadData, setLoadData] = useState<LoadData[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showNewRow, setShowNewRow] = useState(false);

  const [newLoadRow, setNewLoadRow] = useState({
    teacherId: null,
    discipline: '',
    hours: 0,
    type: '',
    groupId: null,
    semester: '',
  });

  const fetchLoad = async () => {
    const res = await axios.get('/api/loads');
    setLoadData(res.data);
  };

  const fetchTeachers = async () => {
    const res = await axios.get('/api/teachers');
    setTeachers(res.data);
  };

  const fetchGroups = async () => {
    const res = await axios.get('/api/groups');
    setGroups(res.data);
  };

  useEffect(() => {
    fetchLoad();
    if (currentUser.role === 'admin') {
      fetchTeachers();
      fetchGroups();
    }
  }, []);

  const visibleData =
    currentUser.role === 'teacher'
      ? loadData.filter((l) => l.teacherName === currentUser.name)
      : loadData;

  const handleSubmitNewRow = async () => {
    try {
      await axios.post('/api/loads', newLoadRow);
      await fetchLoad();
      setShowNewRow(false);
      setNewLoadRow({
        teacherId: null,
        discipline: '',
        hours: 0,
        type: '',
        groupId: null,
        semester: '',
      });
    } catch (e) {
      console.error('Ошибка добавления:', e);
    }
  };

  return (
    <div className="px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Учебная нагрузка</h2>
        {currentUser.role === 'admin' && (
          <button
            onClick={() => setShowNewRow(true)}
            className="bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800"
          >
            Создать нагрузку
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg shadow-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="py-2 px-4 border-b">Преподаватель</th>
              <th className="py-2 px-4 border-b">Дисциплина</th>
              <th className="py-2 px-4 border-b">Часы</th>
              <th className="py-2 px-4 border-b">Тип</th>
              <th className="py-2 px-4 border-b">Группа</th>
              <th className="py-2 px-4 border-b">Семестр</th>
              {currentUser.role === 'admin' && <th className="py-2 px-4 border-b">Действие</th>}
            </tr>
          </thead>
          <tbody>
            {visibleData.map((load) => (
              <tr key={load.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{load.teacherName}</td>
                <td className="py-2 px-4 border-b">{load.discipline}</td>
                <td className="py-2 px-4 border-b">{load.hours}</td>
                <td className="py-2 px-4 border-b">{load.type}</td>
                <td className="py-2 px-4 border-b">{load.groupName}</td>
                <td className="py-2 px-4 border-b">{load.semester}</td>
                {currentUser.role === 'admin' && <td className="py-2 px-4 border-b">—</td>}
              </tr>
            ))}

            {showNewRow && (
              <tr className="bg-white border-t">
                <td className="px-4 py-2">
                  <select
                    value={newLoadRow.teacherId ?? ''}
                    onChange={(e) =>
                      setNewLoadRow({ ...newLoadRow, teacherId: Number(e.target.value) })
                    }
                    className="border px-2 py-1 rounded w-full"
                  >
                    <option value="">Преподаватель</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={newLoadRow.discipline}
                    onChange={(e) =>
                      setNewLoadRow({ ...newLoadRow, discipline: e.target.value })
                    }
                    className="border px-2 py-1 rounded w-full"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={newLoadRow.hours}
                    onChange={(e) =>
                      setNewLoadRow({ ...newLoadRow, hours: Number(e.target.value) })
                    }
                    className="border px-2 py-1 rounded w-full"
                  />
                </td>
                <td className="px-4 py-2">
                  <select
                    value={newLoadRow.type}
                    onChange={(e) =>
                      setNewLoadRow({ ...newLoadRow, type: e.target.value })
                    }
                    className="border px-2 py-1 rounded w-full"
                  >
                    <option value="">Тип</option>
                    <option value="Лекция">Лекция</option>
                    <option value="Практика">Практика</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <select
                    value={newLoadRow.groupId ?? ''}
                    onChange={(e) =>
                      setNewLoadRow({ ...newLoadRow, groupId: Number(e.target.value) })
                    }
                    className="border px-2 py-1 rounded w-full"
                  >
                    <option value="">Группа</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={newLoadRow.semester}
                    onChange={(e) =>
                      setNewLoadRow({ ...newLoadRow, semester: e.target.value })
                    }
                    className="border px-2 py-1 rounded w-full"
                  />
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={handleSubmitNewRow}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500"
                  >
                    Сохранить
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}