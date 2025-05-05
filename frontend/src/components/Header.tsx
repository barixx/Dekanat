import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom"; // Добавлен useNavigate
import { FaBars, FaTimes, FaUniversity } from "react-icons/fa";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // Хук для навигации

  // ✅ Обработчик выхода из аккаунта
  const handleLogout = () => {
    // Очистка данных пользователя
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    // Перенаправление на страницу входа
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Логотип */}
        <div className="flex items-center">
          <FaUniversity className="text-blue-500 text-3xl mr-2" />
          <span className="text-xl font-bold text-gray-800">
            Информационный деканат
          </span>
        </div>

        {/* Навигация для десктопа */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-blue-500 font-medium transition"
          >
            Главная
          </Link>
          <Link
            to="/schedule"
            className="text-sm text-gray-600 hover:text-blue-500 font-medium transition"
          >
            Расписание
          </Link>
          <Link
            to="/documents"
            className="text-sm text-gray-600 hover:text-blue-500 font-medium transition"
          >
            Документы
          </Link>
          <Link
            to="/load"
            className="text-sm text-gray-600 hover:text-blue-500 font-medium transition"
          >
            Нагрузка
          </Link>
          {/* Кнопка выхода */}
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition"
            onClick={handleLogout}
          >
            Выйти
          </button>
        </nav>

        {/* Меню для мобильных устройств */}
        <div className="md:hidden">
          <button
            aria-label="Toggle Menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <FaTimes className="text-gray-800 text-2xl" />
            ) : (
              <FaBars className="text-gray-800 text-2xl" />
            )}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white shadow-md"
          >
            <nav className="flex flex-col p-4 space-y-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-blue-500 font-medium transition"
                onClick={() => setIsMenuOpen(false)} // Закрытие меню при клике на ссылку
              >
                Главная
              </Link>
              <Link
                to="/schedule"
                className="text-gray-600 hover:text-blue-500 font-medium transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Расписание
              </Link>
              <Link
                to="/documents"
                className="text-gray-600 hover:text-blue-500 font-medium transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Документы
              </Link>
              <Link
                to="/workload"
                className="text-gray-600 hover:text-blue-500 font-medium transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Нагрузка
              </Link>
              {/* Кнопка выхода для мобильного меню */}
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition"
                onClick={() => {
                  setIsMenuOpen(false); // Закрываем меню
                  handleLogout(); // Вызываем обработчик выхода
                }}
              >
                Выйти
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;