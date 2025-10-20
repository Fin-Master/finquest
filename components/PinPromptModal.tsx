import React, { useState, useRef, useEffect } from 'react';
import { KeyRound } from 'lucide-react';

interface PinPromptModalProps {
    onClose: () => void;
    onConfirm: (pin: string) => boolean | void; // Return true on success, false on failure
    onForgotPin?: () => void;
}

const PinPromptModal: React.FC<PinPromptModalProps> = ({ onClose, onConfirm, onForgotPin }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(false);
        const value = e.target.value.replace(/\D/g, '');
        setPin(value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length === 4) {
            const success = onConfirm(pin);
            if (!success) {
                setError(true);
                setPin('');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-xs border border-gray-700 m-4" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <KeyRound className="mx-auto text-yellow-400 mb-4" size={32} />
                    <h2 className="text-xl font-bold mb-2 text-white">Enter PIN</h2>
                    <p className="text-gray-400 mb-6 text-sm">Please enter your 4-digit PIN to authorize this action.</p>
                    <form onSubmit={handleSubmit}>
                        <input
                            ref={inputRef}
                            type="password"
                            value={pin}
                            onChange={handlePinChange}
                            maxLength={4}
                            className={`w-full p-3 bg-gray-700 border-2 rounded-md text-white tracking-[1.5em] text-center text-2xl transition duration-300 ${error ? 'border-red-500 animate-shake' : 'border-gray-600 focus:border-indigo-500'}`}
                        />
                         {error && <p className="text-red-400 text-sm mt-2">Incorrect PIN. Please try again.</p>}
                        <div className="flex justify-between items-center mt-6">
                            <div>
                                {onForgotPin && (
                                    <button type="button" onClick={onForgotPin} className="text-sm text-indigo-400 hover:underline">
                                        Forgot PIN?
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-semibold transition">Cancel</button>
                                <button type="submit" disabled={pin.length !== 4} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold transition disabled:bg-gray-500 disabled:cursor-not-allowed">
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <style>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                        20%, 40%, 60%, 80% { transform: translateX(5px); }
                    }
                    .animate-shake { animation: shake 0.5s ease-in-out; }
                `}</style>
            </div>
        </div>
    );
};

export default PinPromptModal;