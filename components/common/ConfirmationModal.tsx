import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  confirmButtonClass?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  children, 
  confirmText = 'Confirm',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 m-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-white flex items-center">
          <AlertTriangle className="text-red-400 mr-3" />
          {title}
        </h2>
        <div className="text-gray-300 mb-6 space-y-2">
            {children}
        </div>
        <div className="flex justify-end gap-4">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-semibold transition">Cancel</button>
          <button type="button" onClick={handleConfirm} className={`py-2 px-4 rounded-lg text-white font-semibold transition ${confirmButtonClass}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
