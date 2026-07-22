import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
// import Dashboard from './pages/Dashboard'; // نبنيها في المرحلة الجاية

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <p>Dashboard (قيد الإنشاء)</p>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-only"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <p>صفحة خاصة بالـ Admin فقط</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
