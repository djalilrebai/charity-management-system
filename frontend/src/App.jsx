import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Families from './pages/Families';
import FamilyDetails from './pages/FamilyDetails';
import Activities from './pages/Activities';
import Finance from './pages/Finance';

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
            path="/families"
            element={
              <ProtectedRoute>
                <Families />
              </ProtectedRoute>
            }
          />
          <Route
            path="/families/:id"
            element={
              <ProtectedRoute>
                <FamilyDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities"
            element={
              <ProtectedRoute>
                <Activities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance"
            element={
              <ProtectedRoute>
                <Finance />
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
