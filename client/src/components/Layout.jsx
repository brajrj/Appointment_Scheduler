import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import {
  Calendar,
  Home,
  Settings,
  User,
  Building,
  Wrench,
  Bell,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Book Appointment', href: '/book-appointment', icon: Calendar },
    ...(user?.role === 'BUSINESS_OWNER' ? [
      { name: 'Business Profile', href: '/business-profile', icon: Building },
      { name: 'Services', href: '/services', icon: Wrench },
    ] : []),
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-64 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 flex flex-col h-full fixed left-0 top-0 z-10"
        >
          {/* Logo Section */}
          <div className="p-6 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                AppointmentPro
              </h2>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 overflow-y-auto">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <motion.div
                  key={item.name}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link
                    to={item.href}
                    className={`nav-item mb-2 flex items-center px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gray-100 text-gray-900 font-semibold'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-600 rounded-full flex items-center justify-center ring-2 ring-white shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role?.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-64">
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50 flex-shrink-0"
          >
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                    {navigation.find(nav => nav.href === location.pathname)?.name || 'Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    Welcome back, {user?.firstName}! Here's what's happening today.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative p-3 hover:bg-gray-100 rounded-xl transition-all duration-200"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  </Button>
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-50/50 to-slate-100/50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;