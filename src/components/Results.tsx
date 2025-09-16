import React, { useState, useEffect } from 'react';
import { Copy, Download, ToggleLeft, ToggleRight, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Output } from '../types';

interface ResultsProps {
  results: Output;
  onStartOver: () => void;
}

export const Results: React.FC<ResultsProps> = ({ results, onStartOver }) => {
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('policyPilotLastResult', JSON.stringify(results));
  }, [results]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(results.json, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatSummary = (text: string) => {
    return text.split('\n\n').map((section, index) => {
      const lines = section.trim().split('\n');
      const heading = lines[0];
      const content = lines.slice(1).join('\n');
      
      return (
        <div key={index} className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
            {heading}
          </h3>
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {content}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Analysis Complete</h1>
        </div>
        <p className="text-green-100 text-lg">
          We've analyzed your coverage and identified key opportunities to optimize your insurance portfolio.
        </p>
      </div>

      {/* Key Findings Cards */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Overlap Card */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-200 overflow-hidden">
          <div className="bg-orange-50 px-6 py-4 border-b border-orange-200">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-orange-600" />
              <h3 className="text-xl font-bold text-orange-900">Potential Overlap</h3>
            </div>
          </div>
          <div className="p-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              {results.json.overlap.title}
            </h4>
            <p className="text-gray-700 mb-4">{results.json.overlap.reason}</p>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm font-medium text-orange-800 mb-2">What to verify:</p>
              <ul className="text-sm text-orange-700 space-y-1">
                {results.json.overlap.what_to_verify.map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Gap Card */}
        <div className="bg-white rounded-xl shadow-lg border border-red-200 overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-200">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-red-600" />
              <h3 className="text-xl font-bold text-red-900">Critical Gap</h3>
            </div>
          </div>
          <div className="p-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              {results.json.gap.title}
            </h4>
            <p className="text-gray-700 mb-4">{results.json.gap.reason}</p>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 mb-1">Next step:</p>
              <p className="text-sm text-red-700">{results.json.gap.suggested_next_step}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Review */}
      <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
          <h3 className="text-xl font-bold text-blue-900">Priority Review List</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {results.json.priority_review.map((item, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{item.coverage}</h4>
                  <p className="text-gray-700 text-sm">{item.why}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Analysis */}
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Detailed Analysis</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowJson(!showJson)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {showJson ? <ToggleRight className="h-5 w-5 text-blue-600" /> : <ToggleLeft className="h-5 w-5" />}
              <span>View JSON</span>
            </button>
            <button
              onClick={copyToClipboard}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                copied 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              <Copy className="h-4 w-4" />
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {showJson ? (
            <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(results.json, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="prose max-w-none">
              {formatSummary(results.humanSummary)}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onStartOver}
          className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
        >
          Start Over
        </button>
        <button
          onClick={copyToClipboard}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          Save Results
        </button>
      </div>
    </div>
  );
};