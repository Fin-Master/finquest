import React, { useState, useEffect } from 'react';
import { CheckCircle, ShieldCheck, AlertTriangle } from 'lucide-react';

interface DataAnimationOverlayProps {
  isOpen: boolean;
  animationType: 'backup' | 'restore' | 'delete' | null;
  onComplete: () => void;
}

const animationConfig = {
  backup: {
    title: 'Securing Your Data',
    Icon: ShieldCheck,
    color: 'text-blue-400',
    messages: ['Initiating secure connection...', 'Encrypting your quest log...', 'Transferring to vault...', 'Backup Complete!'],
  },
  restore: {
    title: 'Restoring Your Progress',
    Icon: ShieldCheck,
    color: 'text-green-400',
    messages: ['Accessing data vault...', 'Decrypting your quest log...', 'Applying saved data...', 'Restore Complete!'],
  },
  delete: {
    title: 'Deleting All Data',
    Icon: AlertTriangle,
    color: 'text-red-400',
    messages: ['Authorizing deletion...', 'Shredding transaction records...', 'Erasing habit data...', 'Data Permanently Deleted!'],
  },
};

const DataAnimationOverlay: React.FC<DataAnimationOverlayProps> = ({ isOpen, animationType, onComplete }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && animationType) {
      setMessageIndex(0);
      const config = animationConfig[animationType];
      
      const intervals = config.messages.map((_, index) => 
        setTimeout(() => {
          setMessageIndex(index);
        }, index * 1200)
      );

      const completeTimeout = setTimeout(() => {
        onComplete();
      }, config.messages.length * 1200);

      return () => {
        intervals.forEach(clearTimeout);
        clearTimeout(completeTimeout);
      };
    }
  }, [isOpen, animationType, onComplete]);

  if (!isOpen || !animationType) return null;

  const config = animationConfig[animationType];
  const isComplete = messageIndex === config.messages.length - 1;

  const BackupRestoreAnimation = () => (
     <svg viewBox="0 0 200 100" className="w-64 h-32">
        {/* Database */}
        <path d="M50 20 C 50 10, 80 10, 80 20 L 80 80 C 80 90, 50 90, 50 80 Z" fill="none" stroke="#60a5fa" strokeWidth="2" className="opacity-50" />
        <path d="M50 20 C 50 30, 80 30, 80 20" fill="none" stroke="#60a5fa" strokeWidth="2" className="opacity-50" />
        <path d="M50 40 C 50 50, 80 50, 80 40" fill="none" stroke="#60a5fa" strokeWidth="1" className="opacity-30" />
        <path d="M50 60 C 50 70, 80 70, 80 60" fill="none" stroke="#60a5fa" strokeWidth="1" className="opacity-30" />

        {/* Cloud */}
        <path d="M140 50 A 20 20 0 0 1 140 90 A 25 25 0 0 1 100 70 A 15 15 0 0 1 120 40 A 18 18 0 0 1 140 50 Z" fill="none" stroke="#34d399" strokeWidth="2" className="opacity-50" />

        {/* Path */}
        <path id="flowPath" d="M80 50 C 100 50, 110 50, 120 65" fill="none" stroke="none" />

        {/* Data particles */}
        {[...Array(5)].map((_, i) => (
            <circle key={i} r="2" fill={animationType === 'backup' ? '#60a5fa' : '#34d399'} className="animate-flow">
                 <animateMotion dur="2.5s" repeatCount="indefinite" begin={`${i * 0.4}s`}>
                    <mpath href="#flowPath" />
                </animateMotion>
            </circle>
        ))}
        <style>{`
          .animate-flow {
            animation-direction: ${animationType === 'backup' ? 'normal' : 'reverse'};
          }
        `}</style>
    </svg>
  );

  const DeleteAnimation = () => (
     <svg viewBox="0 0 100 100" className="w-40 h-40 animate-delete-shake">
        <path d="M20 10 H 80 L 70 90 H 30 Z" fill="none" stroke="#f87171" strokeWidth="2" className="animate-delete-fade-main" />
        <path d="M30 20 H 70" fill="none" stroke="#f87171" strokeWidth="1.5" className="animate-delete-fade-main" />
        <path d="M35 30 H 65" fill="none" stroke="#f87171" strokeWidth="1.5" className="animate-delete-fade-main" />

        {/* Shatter pieces */}
        <path d="M20 10 L 40 15 L 35 25 Z" fill="#f87171" className="animate-delete-piece" style={{'--dx': '-20px', '--dy': '-15px', '--rot': '-45deg'} as React.CSSProperties} />
        <path d="M80 10 L 60 18 L 65 28 Z" fill="#f87171" className="animate-delete-piece" style={{'--dx': '20px', '--dy': '-12px', '--rot': '50deg'} as React.CSSProperties}/>
        <path d="M30 90 L 40 80 L 45 88 Z" fill="#f87171" className="animate-delete-piece" style={{'--dx': '-15px', '--dy': '25px', '--rot': '-30deg'} as React.CSSProperties}/>
        <path d="M70 90 L 60 85 L 55 92 Z" fill="#f87171" className="animate-delete-piece" style={{'--dx': '25px', '--dy': '18px', '--rot': '40deg'} as React.CSSProperties}/>
        <path d="M50 50 L 55 45 L 60 55 Z" fill="#f87171" className="animate-delete-piece" style={{'--dx': '5px', '--dy': '-5px', '--rot': '180deg'} as React.CSSProperties}/>
    </svg>
  );


  return (
    <div className="fixed inset-0 bg-gray-900/80 flex justify-center items-center z-50 backdrop-blur-md animate-fade-in" role="alertdialog" aria-modal="true" aria-labelledby="animation-title">
        <style>{`
            @keyframes flow {
                from { offset-distance: 0%; opacity: 1; }
                to { offset-distance: 100%; opacity: 0; }
            }
            .animate-flow { animation: flow 2.5s linear infinite; }

            @keyframes delete-fade-main { 
              0% { opacity: 1; } 
              20% { opacity: 0; } 
              100% { opacity: 0; }
            }
            .animate-delete-fade-main { animation: delete-fade-main 4.8s forwards; }

            @keyframes delete-shake {
              0%, 100% { transform: translateX(0) rotate(0); }
              5%, 15% { transform: translateX(-2px) rotate(-1deg); }
              10%, 20% { transform: translateX(2px) rotate(1deg); }
            }
            .animate-delete-shake { animation: delete-shake 0.8s ease-in-out; animation-delay: 0.5s; }

            @keyframes delete-piece {
              0%, 20% { transform: translate(0, 0) rotate(0); opacity: 0; }
              100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 1; }
            }
            .animate-delete-piece { animation: delete-piece 4s forwards; }

        `}</style>

        <div className="text-center p-8 bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="flex justify-center items-center mb-4">
               {isComplete ? (
                    <CheckCircle className={`w-16 h-16 ${config.color} animate-pulse`} />
               ) : (
                    <config.Icon className={`w-12 h-12 ${config.color}`} />
               )}
            </div>

            <h2 id="animation-title" className="text-2xl font-bold text-white mb-4">{config.title}</h2>
            
            <div className="h-40 flex justify-center items-center">
                {animationType === 'delete' ? <DeleteAnimation /> : <BackupRestoreAnimation />}
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                <div 
                    className={`h-2.5 rounded-full transition-all duration-1000 ease-linear ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`}
                    style={{ width: `${(messageIndex + 1) / config.messages.length * 100}%` }}
                ></div>
            </div>

            <p className="text-gray-300 mt-4 min-h-[2em] font-mono">{config.messages[messageIndex]}</p>
        </div>
    </div>
  );
};

export default DataAnimationOverlay;