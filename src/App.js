import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UpdateProfile from './pages/UpdateProfile';
import ArticleCreate from './pages/ArticleCreate';
import ArticleList from './pages/ArticleList';
import ArticleEdit from './pages/ArticleEdit';
import ArticleDetail from './pages/ArticleDetail';
import Profile from './pages/Profile';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Header />}>
            <Route index element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="update-profile" element={
              <ProtectedRoute>
                <UpdateProfile />
              </ProtectedRoute>
            } />
            <Route path="articles">
              <Route path="create" element={
                <ProtectedRoute>
                  <ArticleCreate />
                </ProtectedRoute>
              } />
              <Route path="list" element={
                <ProtectedRoute>
                  <ArticleList />
                </ProtectedRoute>
              } />
              <Route path="edit/:id" element={
                <ProtectedRoute>
                  <ArticleEdit />
                </ProtectedRoute>
              } />
              <Route path=":id" element={
                <ProtectedRoute>
                  <ArticleDetail />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
