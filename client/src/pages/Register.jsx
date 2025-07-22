import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['USER', 'BUSINESS_OWNER']).default('USER'),
});

const Register = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'USER'
    }
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Clean up phone number - remove if empty
      const submitData = {
        ...data,
        phone: data.phone?.trim() || undefined
      };
      
      console.log('Submitting registration data:', submitData);
      
      const result = await authRegister(submitData);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different types of errors
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 animate-gradient-x relative overflow-hidden">
      {/* Animated Gradient Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-20 rounded-full blur-3xl animate-pulse-slow z-0"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-pink-400 via-purple-400 to-blue-400 opacity-20 rounded-full blur-3xl animate-pulse-slow z-0"></div>
      <Card className="w-full max-w-md glass-card p-8 fade-in relative z-10 shadow-2xl border border-white/30 backdrop-blur-xl bg-white/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 drop-shadow">Create Account</CardTitle>
          <CardDescription className="text-gray-600">Join us and start managing your appointments</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{errorMessage}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input 
                  type="text" 
                  {...register('firstName')} 
                  placeholder="John"
                  className={`transition-all focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.firstName ? 'border-red-500' : ''}`}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input 
                  type="text" 
                  {...register('lastName')} 
                  placeholder="Doe"
                  className={`transition-all focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.lastName ? 'border-red-500' : ''}`}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <Input 
                type="email" 
                {...register('email')} 
                placeholder="you@example.com"
                className={`transition-all focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <Input 
                type="password" 
                {...register('password')} 
                placeholder="••••••••"
                className={`transition-all focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.password ? 'border-red-500' : ''}`}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (Optional)
              </label>
              <Input 
                type="tel" 
                {...register('phone')} 
                placeholder="+1 (555) 123-4567"
                className={`transition-all focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.phone ? 'border-red-500' : ''}`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type <span className="text-red-500">*</span>
              </label>
              <select 
                {...register('role')} 
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all ${
                  errors.role ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="USER">Customer</option>
                <option value="BUSINESS_OWNER">Business Owner</option>
              </select>
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border-0"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </Button>
            <p className="text-sm text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;