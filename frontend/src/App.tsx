import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/HomePage';
import LoadPage from './pages/LoadPage';
import LoginPage from './pages/LoginPage';
import DocumentsPage from './pages/DocumentsPage';
import SchedulePage from './pages/SchedulePage'; // Импорт новой страницы

// 🔒 PrivateRoute (можно вынести в отдельный файл, если нужно переиспользование)
function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('access_token'); // Проверка на авторизацию
  return token ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col">
      {!isLoginPage && <Header />} {/* Заголовок скрыт на странице входа */}
      <main className="flex-1">
        <Routes>
          {/* Главная страница */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />

          {/* Нагрузка преподавателей */}
          <Route
            path="/load"
            element={
              <PrivateRoute>
                <LoadPage />
              </PrivateRoute>
            }
          />

          {/* Документы */}
          <Route
            path="/documents"
            element={
              <PrivateRoute>
                <DocumentsPage />
              </PrivateRoute>
            }
          />

          {/* Расписание на новой странице */}
          <Route
            path="/schedule"
            element={
              <PrivateRoute>
                <SchedulePage />
              </PrivateRoute>
            }
          />

          {/* Страница входа */}
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
      {!isLoginPage && <Footer />} {/* Подвал скрыт на странице входа */}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}