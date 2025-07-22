import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';
import { businessApi, serviceApi, appointmentApi } from '../services/api';
import { Calendar, Clock, User, DollarSign, MapPin, Phone } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { toast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const bookingSchema = z.object({
  notes: z.string().optional(),
});

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
  });

  // Fetch businesses
  const { data: businesses } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessApi.getBusinesses(),
  });

  // Fetch services for selected business
  const { data: services } = useQuery({
    queryKey: ['services', selectedBusiness?.id],
    queryFn: () => serviceApi.getServices({ businessId: selectedBusiness?.id }),
    enabled: !!selectedBusiness?.id,
  });

  // Fetch available time slots
  const { data: availability } = useQuery({
    queryKey: ['availability', selectedBusiness?.userId, selectedDate, selectedService?.id],
    queryFn: () => 
      appointmentApi.getAvailability(selectedBusiness.userId, {
        date: selectedDate,
        serviceId: selectedService.id,
      }),
    enabled: !!selectedBusiness?.userId && !!selectedDate && !!selectedService?.id,
  });

  const bookAppointmentMutation = useMutation({
    mutationFn: (appointmentData) => appointmentApi.createAppointment(appointmentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast({
        title: "Success",
        description: "Appointment booked successfully!",
      });
      navigate('/appointments');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to book appointment",
        variant: "destructive",
      });
    },
  });

  const handleBusinessSelect = (business) => {
    setSelectedBusiness(business);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTimeSlot(null);
    setStep(2);
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedDate('');
    setSelectedTimeSlot(null);
    setStep(3);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    setStep(4);
  };

  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setStep(5);
  };

  const onSubmit = (data) => {
    const appointmentData = {
      serviceId: selectedService.id,
      providerId: selectedBusiness.userId,
      date: selectedDate,
      startTime: selectedTimeSlot.startTime,
      notes: data.notes || '',
    };

    bookAppointmentMutation.mutate(appointmentData);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days from today
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      {/* Progress Steps */}
      <Card className="glass-card backdrop-blur-sm border-white/20 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Book an Appointment
          </CardTitle>
          <p className="text-muted-foreground mt-2">Follow the steps below to schedule your appointment</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between relative">
            {[
              { step: 1, label: 'Select Business' },
              { step: 2, label: 'Choose Service' },
              { step: 3, label: 'Pick Date' },
              { step: 4, label: 'Select Time' },
              { step: 5, label: 'Confirm Details' },
            ].map((item, index) => (
              <div key={item.step} className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step >= item.step 
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg transform scale-105' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}>
                  {item.step}
                </div>
                <span className={`mt-2 text-xs font-medium transition-colors duration-300 ${
                  step >= item.step ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </div>
            ))}
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
            <div 
              className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 -z-10 transition-all duration-500"
              style={{ width: `${((step - 1) / 4) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Select Business */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Business</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businesses?.data?.businesses?.map((business) => (
                <div
                  key={business.id}
                  onClick={() => handleBusinessSelect(business)}
                  className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-semibold text-lg mb-2">{business.businessName}</h3>
                  <p className="text-gray-600 mb-3">{business.businessType}</p>
                  {business.description && (
                    <p className="text-sm text-gray-500 mb-3">{business.description}</p>
                  )}
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    {business.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>{business.phone}</span>
                      </div>
                    )}
                    {business.address && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{business.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Choose Service */}
      {step === 2 && selectedBusiness && (
        <Card>
          <CardHeader>
            <CardTitle>Choose a Service</CardTitle>
            <p className="text-gray-600">at {selectedBusiness.businessName}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services?.data?.services?.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                      {service.description && (
                        <p className="text-gray-600 mb-3">{service.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration} minutes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatCurrency(service.price)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Pick Date */}
      {step === 3 && selectedService && (
        <Card>
          <CardHeader>
            <CardTitle>Pick a Date</CardTitle>
            <p className="text-gray-600">for {selectedService.name}</p>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateSelect(e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              className="max-w-xs"
            />
          </CardContent>
        </Card>
      )}

      {/* Step 4: Select Time */}
      {step === 4 && selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>Select Time</CardTitle>
            <p className="text-gray-600">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </CardHeader>
          <CardContent>
            {availability?.data?.availableSlots?.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {availability.data.availableSlots.map((slot, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleTimeSlotSelect(slot)}
                    className="time-slot"
                  >
                    {new Date(slot.startTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No available time slots for this date. Please select a different date.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Confirm Details */}
      {step === 5 && selectedTimeSlot && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Your Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Appointment Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Appointment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Business:</span>
                    <span className="font-medium">{selectedBusiness.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span className="font-medium">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">
                      {new Date(selectedTimeSlot.startTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{selectedService.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium">{formatCurrency(selectedService.price)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    {...register('notes')}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    rows="3"
                    placeholder="Any special requests or notes..."
                  />
                  {errors.notes && (
                    <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={bookAppointmentMutation.isLoading}
                  >
                    {bookAppointmentMutation.isLoading ? 'Booking...' : 'Book Appointment'}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Back Button for other steps */}
      {step > 1 && step < 5 && (
        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
          >
            Back
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
