import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { ShieldQuestion, KeyRound } from 'lucide-react';

interface ResetPinModalProps {
    user: User;
    onClose: () => void;
    onPinReset: (newPin: string) => void;
}

const ResetPinModal: React.FC<ResetPinModalProps> = ({ user, onClose, onPinReset }) => {
    const [step, setStep] = useState(1); // 1: Verify Answer, 2: Reset PIN
    const [answer, setAnswer] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmNewPin, setConfirmNewPin] = useState('');
    const [error, setError] = useState('');
    const answerInputRef = useRef<HTMLInputElement>(null);
    const newPinInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (step === 1) {
            answerInputRef.current?.focus();
        } else {
            newPinInputRef.current?.focus();
        }
    }, [step]);

    const handleVerifyAnswer = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (answer.trim().toLowerCase() === user.settings?.securityAnswer?.trim().toLowerCase()) {
            setStep(2);
        } else {
            setError('That answer doesn\'t seem right. Please try again.');
        }
    };

    const handleResetPin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (newPin.length !== 4) {
            setError('Your new PIN must be exactly 4 digits.');
            return;
        }
        if (newPin !== confirmNewPin) {
            setError('The new PINs do not match. Please re-enter them.');
            return;
        }
        onPinReset(newPin);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 m-4" onClick={e => e.stopPropagation()}>
                {step === 1 ? (
                    <div>
                        <div className="text-center">
                            <ShieldQuestion className="mx-auto text-indigo-400 mb-4" size={32} />
                            <h2 className="text-xl font-bold mb-2 text-white">PIN Recovery</h2>
                            <p className="text-gray-400 mb-4 text-sm">To reset your PIN, please answer your security question.</p>
                            <p className="font-semibold text-gray-300 mb-6 p-2 bg-gray-900/50 rounded-md">"{user.settings?.securityQuestion}"</p>
                        </div>
                        <form onSubmit={handleVerifyAnswer}>
                            <div>
                                <label htmlFor="securityAnswer" className="block text-sm font-medium text-gray-400 mb-1">Your Answer</label>
                                <input
                                    ref={answerInputRef}
                                    id="securityAnswer"
                                    type="password"
                                    value={answer}
                                    onChange={(e) => { setAnswer(e.target.value); setError(''); }}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                    required
                                />
                            </div>
                            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-semibold transition">Cancel</button>
                                <button type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold transition">Verify</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div>
                        <div className="text-center">
                            <KeyRound className="mx-auto text-green-400 mb-4" size={32} />
                            <h2 className="text-xl font-bold mb-2 text-white">Set New PIN</h2>
                            <p className="text-gray-400 mb-6 text-sm">Verification successful! Please set your new 4-digit PIN.</p>
                        </div>
                        <form onSubmit={handleResetPin}>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="newPin" className="block text-sm font-medium text-gray-400 mb-1">New 4-Digit PIN</label>
                                    <input
                                        ref={newPinInputRef}
                                        id="newPin" type="password" value={newPin}
                                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0,4))}
                                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white tracking-widest text-center"
                                        maxLength={4} required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirmNewPin" className="block text-sm font-medium text-gray-400 mb-1">Confirm New PIN</label>
                                    <input
                                        id="confirmNewPin" type="password" value={confirmNewPin}
                                        onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, '').slice(0,4))}
                                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white tracking-widest text-center"
                                        maxLength={4} required
                                    />
                                </div>
                            </div>
                            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-semibold transition">Cancel</button>
                                <button type="submit" className="py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition">Reset PIN</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPinModal;