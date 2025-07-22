import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { appointmentApi } from '../services/api';
import { Calendar, Clock, User, DollarSign, Plus, CheckCircle, XCircle, TrendingUp, Activity } from 'lucide-react';
import { formatDate, formatTime, getStatusColor } from '../lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['my-appointments'],
    queryFn: () => appointmentApi.getMyAppointments({ limit: 5 }),
  });

  const { data: businessAppointments } = useQuery({
    queryKey: ['business-appointments'],
    queryFn: () => appointmentApi.getAppointments({ limit: 5 }),
    enabled: user?.role === 'BUSINESS_OWNER',
  });

  const upcomingAppointments = appointments?.data?.appointments?.filter(
    apt => new Date(apt.startTime) > new Date()
  ) || [];

  const pastAppointments = appointments?.data?.appointments?.filter(
    apt => new Date(apt.startTime) <= new Date()
  ) || [];

  const stats = [
    {
      title: 'Total Appointments',
      value: appointments?.data?.pagination?.total || 0,
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      title: 'Upcoming',
      value: upcomingAppointments.length,
      icon: Clock,
      color: 'text-green-600',
    },
    {
      title: 'Completed',
      value: pastAppointments.length,
      icon: CheckCircle,
      color: 'text-purple-600',
    },
    {
      title: 'This Month',
      value: appointments?.data?.appointments?.filter(apt => 
        new Date(apt.startTime).getMonth() === new Date().getMonth()
      ).length || 0,
      icon: DollarSign,
      color: 'text-orange-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-20"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-3 tracking-tight">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-white/90 text-lg font-medium">
            Here's what's happening with your appointments today.
          </p>
        </div>
        <div className="absolute top-4 right-4 opacity-10">
          <Calendar className="w-24 h-24" />
        </div>
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">{stat.title}</CardTitle>
                <div className={`p-3 rounded-xl ${stat.color.includes('blue') ? 'bg-blue-50' : stat.color.includes('green') ? 'bg-green-50' : stat.color.includes('purple') ? 'bg-purple-50' : 'bg-orange-50'}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color} group-hover:scale-110 transition-transform duration-200`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <p className="text-xs text-gray-500 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-600">
              Get things done quickly with these shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/book-appointment">
                <Button className="w-full h-24 flex flex-col items-center justify-center rounded-2xl group bg-gradient-to-br from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 shadow-lg">
                  <Plus className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">Book Appointment</span>
                </Button>
              </Link>
              <Link to="/appointments">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center rounded-2xl group border-gray-300 hover:border-gray-400 hover:bg-gray-50">
                  <Calendar className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">View All Appointments</span>
                </Button>
              </Link>
              {user?.role === 'BUSINESS_OWNER' && (
                <Link to="/services">
                  <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center rounded-2xl group border-gray-300 hover:border-gray-400 hover:bg-gray-50">
                    <User className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Manage Services</span>
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>
                Your next scheduled appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.slice(0, 3).map((appointment, index) => (
                    <motion.div 
                      key={appointment.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {appointment.service.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(appointment.startTime)} at {formatTime(appointment.startTime)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.provider.businessProfile?.businessName}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No upcoming appointments
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent appointment activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments?.data?.appointments?.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {appointment.status === 'COMPLETED' ? (
                      <CheckCircle className="h-10 w-10 text-green-500" />
                    ) : appointment.status === 'CANCELLED' ? (
                      <XCircle className="h-10 w-10 text-red-500" />
                    ) : (
                      <Clock className="h-10 w-10 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.service.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(appointment.startTime)} at {formatTime(appointment.startTime)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {appointment.provider.businessProfile?.businessName}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-8">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Owner Section */}
      {user?.role === 'BUSINESS_OWNER' && (
        <Card>
          <CardHeader>
            <CardTitle>Business Overview</CardTitle>
            <CardDescription>
              Recent appointments for your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {businessAppointments?.data?.appointments?.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.user.firstName} {appointment.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.service.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(appointment.startTime)} at {formatTime(appointment.startTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-8">
                  No recent appointments
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
