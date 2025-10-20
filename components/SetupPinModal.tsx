import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';

interface SetupPinModalProps {
    onClose: () => void;
    onPinSet: (pin: string) => void;
}

const SetupPinModal: React.FC<SetupPinModalProps> = ({ onClose, onPinSet }) => {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const pinInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        pinInputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (pin.length !== 4) {
            setError('Your PIN must be exactly 4 digits.');
            return;
        }
        if (pin !== confirmPin) {
            setError('The PINs do not match. Try again!');
            return;
        }
        onPinSet(pin);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 m-4" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <ShieldCheck className="mx-auto text-indigo-400 mb-4" size={40} />
                    <h2 className="text-2xl font-bold mb-3 text-white">Set Your Action PIN</h2>
                    <p className="text-gray-300 mb-6">
                        Hey adventurer! To keep your quest log safe, let's set up a secret 4-digit PIN. You'll need it for important actions like editing or deleting entries. This keeps your treasure map secure!
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="pin" className="block text-sm font-medium text-gray-400 mb-1">New 4-Digit PIN</label>
                            <input
                                ref={pinInputRef}
                                id="pin" type="password" value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0,4))}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white tracking-widest text-center"
                                maxLength={4} required
                            />
                         </div>
                         <div>
                            <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-400 mb-1">Confirm PIN</label>
                            <input
                                id="confirmPin" type="password" value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0,4))}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white tracking-widest text-center"
                                maxLength={4} required
                            />
                         </div>
                     </div>
                     {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                     <div className="flex justify-end gap-4 pt-4">
                         <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-semibold transition">Cancel</button>
                         <button type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold transition">Set PIN</button>
                     </div>
                </form>
            </div>
        </div>
    );
};

export default SetupPinModal;