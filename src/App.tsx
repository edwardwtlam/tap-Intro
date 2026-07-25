import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PublicProfile from './pages/PublicProfile';
import VCardPage from './pages/VCardPage';
import ClaimPage from './pages/ClaimPage';
import AdminPage from './pages/AdminPage';
import OrderProcess from './pages/OrderProcess';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/order" element={<OrderProcess />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route path="/vcard/:id" element={<VCardPage />} />
          <Route path="/claim/:code" element={<ClaimPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
