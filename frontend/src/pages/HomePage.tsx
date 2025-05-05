import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaFileAlt, FaChartBar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const HomePage = () => {
  const [userInfo, setUserInfo] = useState<{ email: string; role: string } | null>(null);
  const [displayName, setDisplayName] = useState("Пользователь");
  const navigate = useNavigate();

  // ✅ Получаем текущего пользователя по токену
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.warn("Нет токена");
      return;
    }

    axios
      .get("http://localhost:3000/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("Данные пользователя:", res.data);
        setUserInfo(res.data);
        localStorage.setItem("role", res.data.role); 
      })
      .catch((err) => {
        console.error("Ошибка /auth/me:", err);
      });
  }, []);

  // 🧠 Определяем отображаемое имя: админ или преподаватель
   useEffect(() => {
      if (!userInfo?.email) return;

      if (userInfo.role === "admin") {
        setDisplayName("Администратор");
        return;
      }

      // ✅ Запрос к /teachers/by-email
      axios
        .get(`http://localhost:3000/teachers/by-email?email=${userInfo.email}`)
        .then((res) => {
          if (res.data?.fullName) {
            localStorage.setItem("fullName", res.data.fullName); setDisplayName(res.data.fullName); // ← вот оно!
          } else {
            setDisplayName("Преподаватель");
          }
        })
        .catch((err) => {
          console.error("Ошибка загрузки ФИО преподавателя:", err);
          setDisplayName("Преподаватель");
        });
    }, [userInfo]);

  const handleNavigate = (path: string) => navigate(path);
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">
          Добро пожаловать, {displayName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Работайте с нужной информацией быстро и удобно.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center cursor-pointer hover:shadow-lg transition"
          onClick={() => handleNavigate("/schedule")}
        >
          <FaCalendarAlt className="text-blue-500 text-4xl mb-4" />
          <h2 className="text-lg font-semibold text-gray-800">Расписание</h2>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center cursor-pointer hover:shadow-lg transition"
          onClick={() => handleNavigate("/documents")}
        >
          <FaFileAlt className="text-green-500 text-4xl mb-4" />
          <h2 className="text-lg font-semibold text-gray-800">Документы</h2>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center cursor-pointer hover:shadow-lg transition"
          onClick={() => handleNavigate("/load")}
        >
          <FaChartBar className="text-purple-500 text-4xl mb-4" />
          <h2 className="text-lg font-semibold text-gray-800">Нагрузка</h2>
        </motion.div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-200 pb-2">
          Новости
        </h2>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-start bg-white p-4 rounded-lg shadow-md mb-4 hover:shadow-lg transition"
        >
          <div className="w-1 bg-blue-500 rounded-full mr-4"></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Новая рабочая программа опубликована
            </h3>
            <p className="text-gray-600 text-sm">
              Ознакомьтесь с новой версией материала по курсу "Программирование".
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-start bg-white p-4 rounded-lg shadow-md mb-4 hover:shadow-lg transition"
        >
          <div className="w-1 bg-green-500 rounded-full mr-4"></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Изменения в расписании
            </h3>
            <p className="text-gray-600 text-sm">
              Проверьте изменения в расписании на следующий месяц.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
