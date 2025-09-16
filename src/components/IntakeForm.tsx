import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Intake } from '../types';

interface IntakeFormProps {
  onSubmit: (data: Intake) => void;
}

const EXAMPLE_POLICIES = [
  "auto: state-min liability",
  "credit-card: rental car coverage",
  "renters",
  "disability",
  "life: basic 1x salary",
  "homeowners",
  "umbrella: 1M",
  "travel insurance",
  "credit-card: phone coverage"
];

export const IntakeForm: React.FC<IntakeFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Intake>({});
  const [newPolicy, setNewPolicy] = useState('');
  const [showPolicyExamples, setShowPolicyExamples] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addPolicy = (policy: string) => {
    if (policy.trim() && !formData.existing_policies?.includes(policy.trim())) {
      setFormData(prev => ({
        ...prev,
        existing_policies: [...(prev.existing_policies || []), policy.trim()]
      }));
      setNewPolicy('');
      setShowPolicyExamples(false);
    }
  };

  const removePolicy = (policyToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      existing_policies: prev.existing_policies?.filter(p => p !== policyToRemove) || []
    }));
  };

  const handleAssetChange = (asset: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assets: checked 
        ? [...(prev.assets || []), asset as any]
        : prev.assets?.filter(a => a !== asset) || []
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-8 py-6">
          <h2 className="text-3xl font-bold text-white">Coverage Assessment</h2>
          <p className="text-blue-100 mt-2">Help us understand your current situation</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                min="18"
                max="100"
                value={formData.age || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your age"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Household Size
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.household || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, household: parseInt(e.target.value) || undefined }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Number of people (including you)"
              />
            </div>
          </div>

          {/* Income and Employment */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Income Range
              </label>
              <select
                value={formData.income_range || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, income_range: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select income range</option>
                <option value="<50k">Less than $50,000</option>
                <option value="50–100k">$50,000 - $100,000</option>
                <option value="100–200k">$100,000 - $200,000</option>
                <option value=">200k">More than $200,000</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Employment Status
              </label>
              <select
                value={formData.employment || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, employment: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select employment status</option>
                <option value="W2">W-2 Employee</option>
                <option value="self-employed">Self-employed</option>
                <option value="contractor">Contractor</option>
                <option value="student">Student</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </div>
          </div>

          {/* Assets */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Assets & Property
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["car", "home", "renting", "valuable_electronics", "pets", "bike"].map(asset => (
                <label key={asset} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.assets?.includes(asset as any) || false}
                    onChange={(e) => handleAssetChange(asset, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {asset === 'valuable_electronics' ? 'Electronics' : asset}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Location and Risk Preference */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                State or Country
              </label>
              <input
                type="text"
                value={formData.state_or_country || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, state_or_country: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., California or United Kingdom"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Risk Preference
              </label>
              <select
                value={formData.risk_preference || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, risk_preference: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select preference</option>
                <option value="frugal">Frugal (minimal coverage)</option>
                <option value="balanced">Balanced (moderate coverage)</option>
                <option value="safety-first">Safety-first (comprehensive)</option>
              </select>
            </div>
          </div>

          {/* Existing Policies */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Insurance Policies
            </label>
            <div className="relative">
              <input
                type="text"
                value={newPolicy}
                onChange={(e) => setNewPolicy(e.target.value)}
                onFocus={() => setShowPolicyExamples(true)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPolicy(newPolicy);
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                placeholder="Type a policy or select from examples below"
              />
              <button
                type="button"
                onClick={() => addPolicy(newPolicy)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {showPolicyExamples && (
              <div className="mt-3 bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-3">Common examples (click to add):</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_POLICIES.map(policy => (
                    <button
                      key={policy}
                      type="button"
                      onClick={() => addPolicy(policy)}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    >
                      {policy}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {formData.existing_policies && formData.existing_policies.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Your policies:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.existing_policies.map(policy => (
                    <span
                      key={policy}
                      className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{policy}</span>
                      <button
                        type="button"
                        onClick={() => removePolicy(policy)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Any specific concerns or additional context..."
            />
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
            >
              Check my coverage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};