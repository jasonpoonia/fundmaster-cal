import React from 'react';
import { User, Mail, Phone, ArrowLeft, Info } from 'lucide-react';
import { FormData } from '../types';

type PersonalInfoProps = {
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function PersonalInfo({ formData, onInputChange, onNext, onBack }: PersonalInfoProps) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-700">
          Personal Information
        </h2>
        <div className="group relative">
          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <Info className="w-5 h-5" />
          </button>
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg p-4 hidden group-hover:block z-10">
            <div className="absolute right-3 -top-2 w-4 h-4 bg-white transform rotate-45"></div>
            <p className="text-sm text-gray-600 leading-relaxed">
              We collect this information to generate your custom mortgage report and send it to you via email. Your data is securely stored and will never be sold or shared with third parties.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <User className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            placeholder="Full Name"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div className="relative">
          <Mail className="absolute top-3 left-3 text-gray-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onInputChange}
            placeholder="Email Address"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div className="relative">
          <Phone className="absolute top-3 left-3 text-gray-400" />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onInputChange}
            placeholder="Phone Number"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>
      <button
        onClick={onNext}
        className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors"
      >
        Show Results
      </button>
    </div>
  );
}