import React from 'react';
import { Shield } from 'lucide-react';

interface HeaderProps {
  onSignInClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSignInClick }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">PolicyPilot</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Home
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              How it works
            </a>
            <button
              onClick={onSignInClick}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Sign in
            </button>
          </nav>

          <button
            onClick={onSignInClick}
            className="md:hidden text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
};