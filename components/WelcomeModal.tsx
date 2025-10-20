import React from 'react';
import { User, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
  onConfirm: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700 m-4 text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-white">Welcome to FinQuest AI!</h2>
        <p className="text-gray-300 mb-8 leading-relaxed">
          Hello! My name is <span className="font-bold text-indigo-400">Fin</span>, and I'll help you on your financial adventure.
          To make this experience truly yours, let's start by personalizing your profile. A custom name and picture make tracking your progress much more rewarding!
        </p>
        <button
          onClick={onConfirm}
          className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform hover:scale-105"
        >
          <User className="w-5 h-5" />
          Personalize My Profile
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;
