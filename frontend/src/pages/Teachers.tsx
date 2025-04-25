import { useEffect, useState } from 'react';
import axios from 'axios';

interface Teacher {
  id: number;
  fullName: string;
  maxHours: number;
}

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    axios.get('http://localhost:3000/teachers')
      .then(res => setTeachers(res.data))
      .catch(err => console.error('Ошибка загрузки преподавателей:', err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Преподаватели</h1>
      <div className="grid gap-4">
        {teachers.map(teacher => (
          <div key={teacher.id} className="border p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold">{teacher.fullName}</h2>
            <p className="text-gray-600">Максимум часов: {teacher.maxHours}</p>
          </div>
        ))}
      </div>
    </div>
  );
}