import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar, Clock, Bell, Shield, Users, Star, Sparkles, Zap, Heart } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Schedule appointments with just a few clicks. Real-time availability checking.'
    },
    {
      icon: Clock,
      title: 'Time Management',
      description: 'Automated scheduling prevents double bookings and manages your time efficiently.'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Get instant notifications and reminders for upcoming appointments.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security and encryption.'
    },
    {
      icon: Users,
      title: 'Multi-User Support',
      description: 'Perfect for businesses with multiple staff members and service providers.'
    },
    {
      icon: Star,
      title: 'Professional',
      description: 'Impress your clients with a professional booking experience.'
    }
  ];

  return (
    <div className="min-h-screen font-[Inter,sans-serif]">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg rounded-b-2xl border-b border-gray-200 sticky top-0 z-30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900 drop-shadow-sm">
                Appointment Scheduler
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg shadow-md transition-all">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg rounded-lg transition-all">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center">
        {/* Wavy SVG Background */}
        <svg className="absolute top-0 left-0 w-full h-64 md:h-96" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="#6366f1" fillOpacity="0.15" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
        </svg>
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        </div>
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/40 rounded-full shadow-md"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -120, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center min-h-[70vh]">
          <div className="w-full flex justify-center">
            {/* Glassmorphism Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full text-center border border-white/20"
            >
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-10 h-10 text-white drop-shadow-lg" />
                </motion.div>
              </div>
              <motion.h1
                className="text-5xl md:text-7xl font-extrabold mb-6 text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Schedule Appointments
                <br />
                <motion.span
                  className="bg-gradient-to-r from-blue-300 via-purple-200 to-pink-400 bg-clip-text text-transparent animate-gradient-x drop-shadow-[0_2px_8px_rgba(99,102,241,0.2)]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Like a Pro
                </motion.span>
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Book smarter. Manage less. Delight your clients with effortless scheduling.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-6 justify-center"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Link to="/register">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-8 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-0"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-8 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-0"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Sign In
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make appointment scheduling effortless
              for both you and your clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-slate-900 to-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of businesses that trust our platform to manage their appointments.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100 font-semibold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold">
                  Appointment Scheduler
                </span>
              </div>
              <p className="mt-4 text-gray-400">
                Professional appointment scheduling made simple.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Online Booking</li>
                <li>Real-time Availability</li>
                <li>Email Notifications</li>
                <li>Calendar Integration</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Appointment Scheduler. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
