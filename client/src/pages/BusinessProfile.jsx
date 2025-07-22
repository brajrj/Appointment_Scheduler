import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { businessApi } from '../services/api';
import { Building, Clock, MapPin, Phone, Mail, Save } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const businessSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

const BusinessProfile = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  const { data: businessProfile, isLoading } = useQuery({
    queryKey: ['business-profile'],
    queryFn: () => businessApi.getBusinessProfile(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(businessSchema),
  });

  const [workingHours, setWorkingHours] = useState({
    monday: { start: '09:00', end: '17:00', isOpen: true },
    tuesday: { start: '09:00', end: '17:00', isOpen: true },
    wednesday: { start: '09:00', end: '17:00', isOpen: true },
    thursday: { start: '09:00', end: '17:00', isOpen: true },
    friday: { start: '09:00', end: '17:00', isOpen: true },
    saturday: { start: '09:00', end: '17:00', isOpen: false },
    sunday: { start: '09:00', end: '17:00', isOpen: false },
  });

  React.useEffect(() => {
    if (businessProfile?.data?.businessProfile) {
      const profile = businessProfile.data.businessProfile;
      reset({
        businessName: profile.businessName || '',
        businessType: profile.businessType || '',
        description: profile.description || '',
        address: profile.address || '',
        phone: profile.phone || '',
        email: profile.email || '',
      });

      if (profile.workingHours) {
        setWorkingHours(profile.workingHours);
      }
    }
  }, [businessProfile, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => businessApi.createBusinessProfile({
      ...data,
      workingHours: JSON.stringify(workingHours),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['business-profile']);
      toast({
        title: "Success",
        description: "Business profile updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      }
    }));
  };

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Business Profile</h1>
        <Button onClick={handleSubmit(onSubmit)} disabled={updateProfileMutation.isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('hours')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'hours'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Working Hours
          </button>
        </nav>
      </div>

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <Input
                    type="text"
                    {...register('businessName')}
                    placeholder="Enter your business name"
                  />
                  {errors.businessName && (
                    <p className="text-red-500 text-sm mt-1">{errors.businessName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <Input
                    type="text"
                    {...register('businessType')}
                    placeholder="e.g., Clinic, Salon, Consultancy"
                  />
                  {errors.businessType && (
                    <p className="text-red-500 text-sm mt-1">{errors.businessType.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Describe your business and services..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Address
                  </label>
                  <Input
                    type="text"
                    {...register('address')}
                    placeholder="Business address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    {...register('phone')}
                    placeholder="Business phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Business Email
                </label>
                <Input
                  type="email"
                  {...register('email')}
                  placeholder="Business email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Working Hours Tab */}
      {activeTab === 'hours' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Working Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {days.map((day) => (
                <div key={day.key} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-20">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={workingHours[day.key].isOpen}
                        onChange={(e) => handleWorkingHoursChange(day.key, 'isOpen', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="font-medium">{day.label}</span>
                    </label>
                  </div>
                  
                  {workingHours[day.key].isOpen ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={workingHours[day.key].start}
                        onChange={(e) => handleWorkingHoursChange(day.key, 'start', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="time"
                        value={workingHours[day.key].end}
                        onChange={(e) => handleWorkingHoursChange(day.key, 'end', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-500">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit(onSubmit)} disabled={updateProfileMutation.isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default BusinessProfile;
