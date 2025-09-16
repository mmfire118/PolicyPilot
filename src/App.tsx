import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AuthPanel } from './components/AuthPanel';
import { IntakeForm } from './components/IntakeForm';
import { Results } from './components/Results';
import { Footer } from './components/Footer';
import { analyzeWithLLM } from './utils/analysisEngine';
import { AppState, Intake, Output } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [results, setResults] = useState<Output | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for saved results on app load
  useEffect(() => {
    const savedResults = localStorage.getItem('policyPilotLastResult');
    if (savedResults) {
      try {
        const parsedResults = JSON.parse(savedResults);
        // Could show a "restore last session" option here
      } catch (e) {
        console.warn('Failed to parse saved results');
      }
    }
  }, []);

  const handleSignInClick = () => {
    setShowAuth(true);
  };

  const handleSignUpClick = () => {
    setShowAuth(true);
  };

  const handleAuth = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
    setAppState('intake');
  };

  const handleAuthClose = () => {
    setShowAuth(false);
  };

  const handleIntakeSubmit = async (intakeData: Intake) => {
    setIsLoading(true);
    try {
      const analysisResults = await analyzeWithLLM(intakeData);
      setResults(analysisResults);
      setAppState('results');
    } catch (error) {
      console.error('Analysis failed:', error);
      // Could show error state here
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setResults(null);
    setAppState('landing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Analyzing Your Coverage</h2>
          <p className="text-gray-600">This may take a few moments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSignInClick={handleSignInClick} />
      
      {appState === 'landing' && (
        <>
          <Hero onSignUpClick={handleSignUpClick} />
          <div id="how-it-works" className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">How PolicyPilot Works</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Get personalized insurance insights in three simple steps
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold text-xl">1</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Share Your Info</h3>
                  <p className="text-gray-600">Tell us about your assets, income, and current coverage</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-teal-600 font-bold text-xl">2</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Get Analysis</h3>
                  <p className="text-gray-600">Our system identifies overlaps and gaps in your coverage</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-orange-600 font-bold text-xl">3</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Take Action</h3>
                  <p className="text-gray-600">Follow our prioritized recommendations to optimize your coverage</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {appState === 'intake' && <IntakeForm onSubmit={handleIntakeSubmit} />}
      
      {appState === 'results' && results && (
        <Results results={results} onStartOver={handleStartOver} />
      )}
      
      {showAuth && <AuthPanel onAuth={handleAuth} onClose={handleAuthClose} />}
      
      <Footer />
    </div>
  );
}

export default App;