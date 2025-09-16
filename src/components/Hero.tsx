import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onSignUpClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSignUpClick }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Understand your{' '}
              <span className="text-blue-600">insurance</span>{' '}
              in minutes
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Find one overlap to drop and one critical gap to fix. 
              Get personalized insights that could save you money and protect what matters most.
            </p>
            <button
              onClick={onSignUpClick}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
            >
              <span>Sign up now</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          
          <div className="relative">
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/4386372/pexels-photo-4386372.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&dpr=1"
                alt="Professional insurance consultation showing documents and planning"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg border">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Coverage Analyzed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};