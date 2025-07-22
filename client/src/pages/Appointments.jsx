import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';
import { appointmentApi } from '../services/api';
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Filter,
  Search
} from 'lucide-react';
import { formatDate, formatTime, getStatusColor } from '../lib/utils';
import { toast } from '../hooks/use-toast';
import { motion } from 'framer-motion';

const Appointments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Load all appointments without any filters in the API call
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => {
      const params = {
        page: 1,
        limit: 1000, // Load all appointments
      };
      return user?.role === 'BUSINESS_OWNER'
        ? appointmentApi.getAppointments(params)
        : appointmentApi.getMyAppointments(params);
    },
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: (appointmentId) =>
      appointmentApi.updateAppointment(appointmentId, {
        status: 'CANCELLED',
        cancelReason: 'Cancelled by user',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast({
        title: 'Success',
        description: 'Appointment cancelled successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to cancel appointment',
        variant: 'destructive',
      });
    },
  });

  const confirmAppointmentMutation = useMutation({
    mutationFn: (appointmentId) =>
      appointmentApi.updateAppointment(appointmentId, { status: 'CONFIRMED' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast({
        title: 'Success',
        description: 'Appointment confirmed successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to confirm appointment',
        variant: 'destructive',
      });
    },
  });

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      cancelAppointmentMutation.mutate(appointmentId);
    }
  };

  const handleConfirmAppointment = (appointmentId) => {
    confirmAppointmentMutation.mutate(appointmentId);
  };

  // Client-side filtering and pagination
  const filteredAppointments = appointments?.data?.appointments?.filter((appointment) => {
    const matchesSearch =
      searchTerm === '' ||
      appointment.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user?.role === 'BUSINESS_OWNER' &&
        `${appointment.user.firstName} ${appointment.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === '' || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  // Client-side pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.role === 'BUSINESS_OWNER' ? 'Business Appointments' : 'My Appointments'}
          </h1>
          <p className="text-gray-600">Manage and track all your appointments</p>
        </div>
        <Button asChild className="shadow-lg hover:shadow-xl">
          <a href="/book-appointment">Book New Appointment</a>
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-1" />
                  Search
                </label>
                <Input
                  type="text"
                  placeholder="Search by service or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appointments List */}
      <div className="space-y-6">
        {paginatedAppointments.length > 0 ? (
          paginatedAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.service.name}
                          </h3>
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatDate(appointment.startTime)} at {formatTime(appointment.startTime)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>
                              {user?.role === 'BUSINESS_OWNER'
                                ? `${appointment.user.firstName} ${appointment.user.lastName}`
                                : appointment.provider?.businessProfile?.businessName || 'Business'}
                            </span>
                          </div>
                          {appointment.user.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4" />
                              <span>{appointment.user.phone}</span>
                            </div>
                          )}
                          {appointment.provider?.businessProfile?.address && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>{appointment.provider.businessProfile.address}</span>
                            </div>
                          )}
                        </div>

                        {appointment.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">
                              <strong>Notes:</strong> {appointment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      {user?.role === 'BUSINESS_OWNER' && appointment.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => handleConfirmAppointment(appointment.id)}
                          disabled={confirmAppointmentMutation.isLoading}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm
                        </Button>
                      )}
                      {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancelAppointment(appointment.id)}
                          disabled={cancelAppointmentMutation.isLoading}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter
                  ? 'Try adjusting your filters to see more results.'
                  : "You haven't booked any appointments yet."}
              </p>
              {!searchTerm && !statusFilter && (
                <Button asChild>
                  <a href="/book-appointment">Book Your First Appointment</a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="flex justify-between items-center p-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAppointments.length)} of {filteredAppointments.length} appointments
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Appointments;