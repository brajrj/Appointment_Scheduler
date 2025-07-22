import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-primary text-white px-4 py-2">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-lg font-bold">
          <Link to="/">Appointment Scheduler</Link>
        </h1>
        <div>
          {user ? (
            <>
              <Link to="/dashboard" className="p-2">
                Dashboard
              </Link>
              <Button variant="link" onClick={logout} className="p-2">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="p-2">
                Login
              </Link>
              <Link to="/register" className="p-2">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
