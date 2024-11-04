import React, { useEffect, useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full animate-fade-in-up">
        <h2 className="text-xl font-semibold text-primary-800 dark:text-primary-200 mb-4">
          Confirm Logout
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to logout?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token');
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    setShowLogoutModal(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-900 shadow-lg transition-colors duration-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-primary font-bold text-xl tracking-wide">
                4BLOGS
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Navigation Links */}
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="nav-link"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/articles/create')}
                    className="nav-link"
                  >
                    Create Article
                  </button>
                  <button
                    onClick={() => navigate('/articles/list')}
                    className="nav-link"
                  >
                    My Articles
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="nav-link"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="nav-link"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="nav-link"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="nav-link"
                  >
                    Register
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-primary-700 dark:bg-slate-700 text-white"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-white"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu - Update styles */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-2 fixed inset-0 top-16 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-primary-700 dark:text-primary-300 
                                 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate('/articles/create');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-primary-700 dark:text-primary-300 
                                 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md"
                    >
                      Create Article
                    </button>
                    <button
                      onClick={() => {
                        navigate('/articles/list');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-primary-700 dark:text-primary-300 
                                 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md"
                    >
                      My Articles
                    </button>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-primary-700 dark:text-primary-300 
                                 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogoutClick();
                      }}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-primary-700 dark:text-primary-300 
                                 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        navigate('/login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-primary-700 dark:text-primary-300 
                                 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        navigate('/register');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-primary-700 dark:text-primary-300 
                                 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Adjust main content padding */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        <div className="container mx-auto">
          <div className="my-4">
            <Outlet />
          </div>
        </div>
      </main>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};

export default Header;