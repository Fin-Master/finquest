import React, { useState, useRef } from 'react';
import { User, TimePeriod, Transaction, BackupData, SavingsGoal } from '../types';
import { ArrowLeft, User as UserIcon, Mail, Camera, Save, DollarSign, BarChartHorizontal, CheckCircle, DownloadCloud, UploadCloud, AlertTriangle, FileSpreadsheet, Trash2, KeyRound, ShieldQuestion, Archive } from 'lucide-react';
import { Currency, CURRENCIES, SECURITY_QUESTIONS } from '../constants';
import Spinner from './common/Spinner';
import ConfirmationModal from './common/ConfirmationModal';
import DataAnimationOverlay from './common/DataAnimationOverlay';
import PinPromptModal from './PinPromptModal';
import SetupPinModal from './SetupPinModal';
import ResetPinModal from './ResetPinModal';
import ArchivedQuestsPage from './ArchivedQuestsPage';


interface SettingsPageProps {
  user: User;
  onUpdateUser: (user: Partial<User>) => void;
  onBack: () => void;
  onRestoreData: (data: BackupData) => void;
  onDeleteAllData: () => void;
  onDeleteAccount: () => void;
  savingsGoals: SavingsGoal[];
  onUpdateSavingsGoals: (goals: SavingsGoal[]) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onUpdateUser, onBack, onRestoreData, onDeleteAllData, onDeleteAccount, savingsGoals, onUpdateSavingsGoals }) => {
  const [name, setName] = useState(user.name);
  const [imageUrl, setImageUrl] = useState(user.imageUrl);
  const [currency, setCurrency] = useState(user.settings?.currency || 'USD');
  const [defaultView, setDefaultView] = useState(user.settings?.defaultDashboardView || TimePeriod.MONTHLY);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreFileRef = useRef<HTMLInputElement>(null);

  const [backupStart, setBackupStart] = useState('');
  const [backupEnd, setBackupEnd] = useState('');
  const [backupStatus, setBackupStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [pendingRestoreFile, setPendingRestoreFile] = useState<File | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isFarewellModalOpen, setIsFarewellModalOpen] = useState(false);

  const [animationState, setAnimationState] = useState<{ isOpen: boolean; type: 'backup' | 'restore' | 'delete' | null }>({ isOpen: false, type: null });
  const [postAnimationAction, setPostAnimationAction] = useState<(() => void) | null>(null);

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState(user.settings?.securityQuestion || SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState('');
  
  const [isPinPromptOpen, setIsPinPromptOpen] = useState(false);
  const [isSetupPinModalOpen, setIsSetupPinModalOpen] = useState(false);
  const [isResetPinModalOpen, setIsResetPinModalOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<(() => void) | null>(null);
  
  const [settingsView, setSettingsView] = useState<'main' | 'archived'>('main');


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    const updatedUserData: Partial<User> = {
      name,
      imageUrl,
      settings: {
        ...user.settings,
        currency,
        defaultDashboardView: defaultView,
      }
    };
    onUpdateUser(updatedUserData);
    
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };
  
  const handleSetPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (pin.length !== 4) {
        setPinError('PIN must be exactly 4 digits.');
        return;
    }
    if (pin !== confirmPin) {
        setPinError('PINs do not match.');
        return;
    }
    if (!securityAnswer.trim()) {
        setPinError('Please provide an answer to the security question.');
        return;
    }
    onUpdateUser({ settings: { ...user.settings, actionPin: pin, securityQuestion, securityAnswer } });
    setPin('');
    setConfirmPin('');
    setSecurityAnswer('');
    showStatusMessage('success', 'Action PIN has been set successfully!');
  };
  
  const handleSetSecurityQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
     if (!securityAnswer.trim()) {
        setPinError('Please provide an answer to the security question.');
        return;
    }
    onUpdateUser({ settings: { ...user.settings, securityQuestion, securityAnswer }});
    setSecurityAnswer('');
    showStatusMessage('success', 'PIN Recovery info saved!');
  }
  
  const handleProtectedAction = (action: () => void) => {
    if (!user.settings?.actionPin) {
      setActionToConfirm(() => action);
      setIsSetupPinModalOpen(true);
      return;
    }
    setActionToConfirm(() => action);
    setIsPinPromptOpen(true);
  };
  
  const handlePinSetupComplete = (newPin: string) => {
    onUpdateUser({ settings: { ...user.settings, actionPin: newPin } });
    setIsSetupPinModalOpen(false);

    if (actionToConfirm) {
      setIsPinPromptOpen(true);
    }
  };

  const showStatusMessage = (type: 'success' | 'error', message: string) => {
    setBackupStatus({ type, message });
    setTimeout(() => setBackupStatus({ type: 'idle', message: '' }), 4000);
  };

  const handleManualBackup = () => {
    setAnimationState({ isOpen: true, type: 'backup' });
  };

  const executeBackup = () => {
     try {
      const transactionsJSON = localStorage.getItem('finquest_transactions');
      const habitsJSON = localStorage.getItem('finquest_habits');
      const savingsGoalsJSON = localStorage.getItem('finquest_savings_goals');
      
      let allTransactions: Transaction[] = transactionsJSON ? JSON.parse(transactionsJSON) : [];
      const allHabits: string[] = habitsJSON ? JSON.parse(habitsJSON) : [];
      const allSavingsGoals: SavingsGoal[] = savingsGoalsJSON ? JSON.parse(savingsGoalsJSON) : [];

      if (backupStart || backupEnd) {
          allTransactions = allTransactions.filter(t => {
              const tDate = new Date(t.date).getTime();
              const startDate = backupStart ? new Date(backupStart + 'T00:00:00').getTime() : 0;
              const endDate = backupEnd ? new Date(backupEnd + 'T23:59:59').getTime() : Date.now();
              return tDate >= startDate && tDate <= endDate;
          });
      }

      const backupData: BackupData = {
        transactions: allTransactions,
        habitCheckIns: allHabits,
        savingsGoals: allSavingsGoals,
        exportedAt: new Date().toISOString(),
        version: '2.0.0',
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finquest-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showStatusMessage('success', 'Backup successful! Check your downloads.');
    } catch (error) {
      console.error("Backup failed:", error);
      showStatusMessage('error', 'Backup failed. Please try again.');
    }
  }

  const executeFullBackup = (showSuccessMessage = true) => {
    try {
      const transactionsJSON = localStorage.getItem('finquest_transactions');
      const habitsJSON = localStorage.getItem('finquest_habits');
      const savingsGoalsJSON = localStorage.getItem('finquest_savings_goals');
      
      const allTransactions: Transaction[] = transactionsJSON ? JSON.parse(transactionsJSON) : [];
      const allHabits: string[] = habitsJSON ? JSON.parse(habitsJSON) : [];
      const allSavingsGoals: SavingsGoal[] = savingsGoalsJSON ? JSON.parse(savingsGoalsJSON) : [];

      const backupData: BackupData = {
        transactions: allTransactions,
        habitCheckIns: allHabits,
        savingsGoals: allSavingsGoals,
        exportedAt: new Date().toISOString(),
        version: '2.0.0',
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finquest-final-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (showSuccessMessage) {
        showStatusMessage('success', 'Final backup saved! Check your downloads.');
      }
    } catch (error) {
      console.error("Backup failed:", error);
      if (showSuccessMessage) {
        showStatusMessage('error', 'Backup failed. Please try again.');
      }
    }
  };
  
  const executeDownloadCSV = () => {
    try {
        const transactionsJSON = localStorage.getItem('finquest_transactions');
        if (!transactionsJSON) {
            showStatusMessage('error', 'No transaction data found to export.');
            return;
        }
        
        let allTransactions: Transaction[] = JSON.parse(transactionsJSON);

        if (backupStart || backupEnd) {
            allTransactions = allTransactions.filter(t => {
                const tDate = new Date(t.date).getTime();
                const startDate = backupStart ? new Date(backupStart + 'T00:00:00').getTime() : 0;
                const endDate = backupEnd ? new Date(backupEnd + 'T23:59:59').getTime() : Date.now();
                return tDate >= startDate && tDate <= endDate;
            });
        }

        if (allTransactions.length === 0) {
            showStatusMessage('error', 'No transactions found for the selected period.');
            return;
        }

        const headers = ['id', 'type', 'category', 'amount', 'date', 'description'];
        const csvRows = [headers.join(',')];

        const escapeCsvCell = (cellData: any): string => {
            const cell = String(cellData ?? '');
            if (/[",\n]/.test(cell)) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        };

        for (const t of allTransactions) {
            const row = [
                escapeCsvCell(t.id),
                escapeCsvCell(t.type),
                escapeCsvCell(t.category),
                escapeCsvCell(t.amount),
                escapeCsvCell(t.date),
                escapeCsvCell(t.description),
            ].join(',');
            csvRows.push(row);
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finquest-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showStatusMessage('success', 'CSV export successful! Check your downloads.');
    } catch (error) {
        console.error("CSV export failed:", error);
        showStatusMessage('error', 'CSV export failed. Please try again.');
    }
  };

  const handleRestoreFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingRestoreFile(file);
      setIsRestoreModalOpen(true);
      if (e.target) e.target.value = '';
    }
  };

  const confirmRestore = () => {
    setIsRestoreModalOpen(false);
    if (!pendingRestoreFile) return;
    handleProtectedAction(() => {
        setAnimationState({ isOpen: true, type: 'restore' });
    });
  };

  const executeRestore = () => {
    if (!pendingRestoreFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const data: BackupData = JSON.parse(result);

        if (data && (data.version?.startsWith('1.0') || data.version?.startsWith('2.0')) && Array.isArray(data.transactions) && Array.isArray(data.habitCheckIns)) {
          onRestoreData(data);
          showStatusMessage('success', 'Restore successful! Your data has been updated.');
        } else {
          throw new Error("Invalid backup file format.");
        }
      } catch (error) {
        console.error("Restore failed:", error);
        showStatusMessage('error', 'Restore failed. The file may be invalid or corrupted.');
      } finally {
        setPendingRestoreFile(null);
      }
    };
    reader.readAsText(pendingRestoreFile);
  }
  
  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false);
    setPostAnimationAction(() => executeDelete);
    setAnimationState({ isOpen: true, type: 'delete' });
  };
  
  const triggerDeleteAccountAnimation = () => {
    setPostAnimationAction(() => executeDeleteAccount);
    setAnimationState({ isOpen: true, type: 'delete' });
  };
  
  const handleSaveAndExit = () => {
    setIsFarewellModalOpen(false);
    executeFullBackup(false);
    triggerDeleteAccountAnimation();
  };

  const handleDeleteWithoutSaving = () => {
    setIsFarewellModalOpen(false);
    triggerDeleteAccountAnimation();
  };

  const executeDelete = () => {
    onDeleteAllData();
    showStatusMessage('success', 'All application data has been deleted.');
  }

  const executeDeleteAccount = () => {
    onDeleteAccount();
  };
  
  const handleRemovePinRequest = () => {
    setActionToConfirm(() => () => {
      onUpdateUser({ settings: { ...user.settings, actionPin: undefined, securityQuestion: undefined, securityAnswer: undefined } });
      showStatusMessage('success', 'PIN has been removed.');
    });
    setIsPinPromptOpen(true);
  };

  const handleAnimationComplete = () => {
    switch (animationState.type) {
      case 'backup':
        executeBackup();
        break;
      case 'restore':
        executeRestore();
        break;
      case 'delete':
        if (postAnimationAction) {
          postAnimationAction();
        }
        break;
    }
    setPostAnimationAction(null);
    setAnimationState({ isOpen: false, type: null });
  };


  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 transition mr-4">
          <ArrowLeft className="text-gray-300" />
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">{settingsView === 'main' ? 'Settings' : 'Archived Quests'}</h2>
      </div>

      {settingsView === 'main' ? (
      <>
        <form onSubmit={handleSaveChanges}>
          {/* Profile Settings Card */}
          <div className="bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-700 mb-8">
            <h3 className="text-xl font-semibold mb-6 text-gray-200">Profile Settings</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <img src={imageUrl} alt={name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-indigo-500 object-cover" />
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full hover:bg-indigo-700 transition-transform hover:scale-110"
                  aria-label="Change profile picture"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="flex-grow w-full">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                      id="email"
                      type="email"
                      value={user.email}
                      className="w-full pl-10 p-2 bg-gray-900/50 border border-gray-700 rounded-md text-gray-400 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Settings Card */}
          <div className="bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-700 mb-8">
            <h3 className="text-xl font-semibold mb-6 text-gray-200">Financial Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-400 mb-1">Primary Currency</label>
                  <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
                      <select
                          id="currency"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value as Currency)}
                          className="w-full pl-10 p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                      >
                          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="defaultView" className="block text-sm font-medium text-gray-400 mb-1">Default Dashboard View</label>
                  <div className="relative">
                      <BarChartHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
                      <select
                          id="defaultView"
                          value={defaultView}
                          onChange={(e) => setDefaultView(e.target.value as TimePeriod)}
                          className="w-full pl-10 p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                      >
                          {Object.values(TimePeriod).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                  </div>
                </div>
            </div>
          </div>

          <div className="flex justify-end items-center mb-8">
              <button 
                  type="submit" 
                  className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 disabled:bg-green-400 disabled:cursor-wait min-w-[150px]"
                  disabled={saveStatus === 'saving'}
              >
                  {saveStatus === 'saving' && <Spinner size="sm" color="white" />}
                  {saveStatus === 'saved' && <CheckCircle size={20} />}
                  <span className="ml-2">
                      {saveStatus === 'idle' && 'Save Changes'}
                      {saveStatus === 'saving' && 'Saving...'}
                      {saveStatus === 'saved' && 'Saved!'}
                  </span>
              </button>
          </div>
        </form>
        
        {/* Security Settings */}
        <div className="bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold mb-2 text-gray-200">Security</h3>
          
          {user.settings?.actionPin ? (
              <div>
                  <div className="text-center">
                      <p className="text-green-400 font-semibold flex items-center justify-center gap-2"><CheckCircle size={20}/> Your Action PIN is set.</p>
                      <button 
                          onClick={handleRemovePinRequest}
                          className="mt-2 text-sm text-indigo-400 hover:underline"
                      >
                          Remove PIN
                      </button>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-700">
                      <h4 className="font-semibold text-gray-300 mb-2 text-center">PIN Recovery</h4>
                      {user.settings.securityQuestion ? (
                          <div className="text-center text-sm text-gray-400">
                            <p>Your recovery question is set. You can use the "Forgot PIN?" link if you get locked out.</p>
                            <p className="font-mono mt-2 p-2 bg-gray-900/50 rounded-md text-indigo-300">"{user.settings.securityQuestion}"</p>
                          </div>
                      ) : (
                          <form onSubmit={handleSetSecurityQuestion} className="max-w-md mx-auto">
                              <p className="text-sm text-yellow-300 text-center mb-4">For enhanced security, please set up a recovery question for your PIN.</p>
                              <div>
                                  <label htmlFor="securityQuestion" className="block text-sm font-medium text-gray-400 mb-1">Security Question</label>
                                  <select id="securityQuestion" value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                                      {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                                  </select>
                              </div>
                              <div className="mt-4">
                                <label htmlFor="securityAnswer" className="block text-sm font-medium text-gray-400 mb-1">Your Answer</label>
                                <input id="securityAnswer" type="password" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required />
                              </div>
                              {pinError && <p className="text-red-400 text-sm mt-2 text-center">{pinError}</p>}
                              <div className="mt-4 flex justify-center">
                                <button type="submit" className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition">
                                    Save Recovery Info
                                </button>
                              </div>
                          </form>
                      )}
                  </div>
              </div>
          ) : (
              <form onSubmit={handleSetPin} className="max-w-md mx-auto">
                  <p className="text-sm text-gray-400 mb-6 text-center">Set a 4-digit PIN and a recovery question to protect sensitive actions like deleting or editing transactions.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="pin" className="block text-sm font-medium text-gray-400 mb-1">New 4-Digit PIN</label>
                          <input id="pin" type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0,4))} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white tracking-widest text-center" maxLength={4} required/>
                      </div>
                      <div>
                          <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-400 mb-1">Confirm PIN</label>
                          <input id="confirmPin" type="password" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0,4))} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white tracking-widest text-center" maxLength={4} required />
                      </div>
                  </div>
                  <div className="mt-4">
                      <label htmlFor="securityQuestionSetup" className="block text-sm font-medium text-gray-400 mb-1">Security Question</label>
                      <select id="securityQuestionSetup" value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                          {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                      </select>
                  </div>
                  <div className="mt-4">
                      <label htmlFor="securityAnswerSetup" className="block text-sm font-medium text-gray-400 mb-1">Your Answer</label>
                      <input id="securityAnswerSetup" type="password" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required />
                  </div>
                  {pinError && <p className="text-red-400 text-sm mt-2 text-center">{pinError}</p>}
                  <div className="mt-6 flex justify-center">
                      <button type="submit" className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition">
                          <KeyRound className="mr-2" size={18}/> Set PIN & Recovery
                      </button>
                  </div>
              </form>
          )}
        </div>
        
        {/* Quest Management */}
        <div className="bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-700 mb-8">
           <h3 className="text-xl font-semibold mb-4 text-gray-200">Quest Management</h3>
           <button onClick={() => setSettingsView('archived')} className="flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
               <Archive className="mr-2 h-5 w-5" /> View Archived Quests
           </button>
        </div>


        <div className="bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-200">Data Management</h3>
          <div className="mb-6 pb-6 border-b border-gray-700">
              <h4 className="font-semibold text-gray-300 mb-2">Manual Backup & Export</h4>
              <p className="text-sm text-gray-400 mb-4">Download your data as a JSON (for backup/restore) or CSV (for spreadsheets). You can optionally select a date range.</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input type="date" value={backupStart} onChange={e => setBackupStart(e.target.value)} className="bg-gray-700 text-white text-sm rounded-md p-2 border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-auto"/>
                  <span className="text-gray-400">to</span>
                  <input type="date" value={backupEnd} onChange={e => setBackupEnd(e.target.value)} className="bg-gray-700 text-white text-sm rounded-md p-2 border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-auto"/>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <button onClick={() => handleProtectedAction(handleManualBackup)} className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 w-full">
                          <DownloadCloud className="mr-2 h-5 w-5" /> Backup (JSON)
                      </button>
                      <button onClick={() => handleProtectedAction(executeDownloadCSV)} className="flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 w-full">
                          <FileSpreadsheet className="mr-2 h-5 w-5" /> Export (CSV)
                      </button>
                  </div>
              </div>
          </div>
          
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-red-400 flex items-center"><AlertTriangle className="mr-2"/> Danger Zone</h4>
              <p className="text-sm text-red-300/80 mt-2 mb-4">These actions are irreversible and require your PIN. Proceed with extreme caution.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input type="file" accept=".json" ref={restoreFileRef} onChange={handleRestoreFileSelect} className="hidden" />
                <button onClick={() => restoreFileRef.current?.click()} className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                    <UploadCloud className="mr-2 h-5 w-5" /> Restore from Backup
                </button>
                <button onClick={() => handleProtectedAction(() => setIsDeleteModalOpen(true))} className="flex items-center justify-center bg-red-800 hover:bg-red-900 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                    <Trash2 className="mr-2 h-5 w-5" /> Delete All Data
                </button>
                <button onClick={() => handleProtectedAction(() => setIsDeleteAccountModalOpen(true))} className="flex items-center justify-center bg-red-900 hover:bg-red-950 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                    <UserIcon className="mr-2 h-5 w-5" /> Delete Account
                </button>
              </div>
          </div>
        </div>
      </>
      ) : (
        <ArchivedQuestsPage
          user={user}
          goals={savingsGoals}
          onUpdateGoals={onUpdateSavingsGoals}
          onUpdateUser={onUpdateUser}
          onBack={() => setSettingsView('main')}
        />
      )}
      
      {backupStatus.type !== 'idle' && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg text-white font-semibold z-50 animate-fade-in-out ${backupStatus.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {backupStatus.message}
        </div>
      )}

      {isPinPromptOpen && (
        <PinPromptModal
            onClose={() => {
                setIsPinPromptOpen(false);
                setActionToConfirm(null);
            }}
            onConfirm={(pin) => {
                if (pin === user.settings?.actionPin) {
                    actionToConfirm?.();
                    setIsPinPromptOpen(false);
                    setActionToConfirm(null);
                    return true;
                }
                return false;
            }}
            onForgotPin={user.settings?.securityQuestion ? () => {
                setIsPinPromptOpen(false);
                setIsResetPinModalOpen(true);
            } : undefined}
        />
      )}

      {isSetupPinModalOpen && (
        <SetupPinModal
            onClose={() => {
                setIsSetupPinModalOpen(false);
                setActionToConfirm(null);
            }}
            onPinSet={handlePinSetupComplete}
        />
      )}
      
      {isResetPinModalOpen && (
        <ResetPinModal
            user={user}
            onClose={() => setIsResetPinModalOpen(false)}
            onPinReset={(newPin) => {
                onUpdateUser({ settings: { ...user.settings, actionPin: newPin } });
                setIsResetPinModalOpen(false);
                if (actionToConfirm) {
                    setIsPinPromptOpen(true);
                }
            }}
        />
      )}

      <ConfirmationModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onConfirm={confirmRestore}
        title="Confirm Data Restore"
        confirmText="Yes, Overwrite My Data"
      >
        <p>You are about to restore from the file: <strong className="font-mono text-indigo-300">{pendingRestoreFile?.name}</strong>.</p>
        <p className="mt-2 text-red-300">This will <strong className="font-bold">completely replace</strong> all of your current transactions and habit data. This action cannot be undone.</p>
        <p className="mt-4">Are you sure you wish to proceed?</p>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm All Data Deletion"
        confirmText="Yes, Delete Everything"
        confirmButtonClass="bg-red-800 hover:bg-red-900"
      >
        <p>You are about to <strong className="font-bold text-red-300">permanently delete all</strong> of your application data.</p>
        <p className="mt-2">This includes all transactions, habit check-ins, and streaks. This action cannot be undone.</p>
        <p className="mt-4">Are you absolutely sure you want to proceed?</p>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        onConfirm={() => {
            setIsDeleteAccountModalOpen(false);
            setIsFarewellModalOpen(true);
        }}
        title="Confirm Account Deletion"
        confirmText="Yes, Delete My Account"
        confirmButtonClass="bg-red-800 hover:bg-red-900"
      >
        <p>You are about to <strong className="font-bold text-red-300">permanently delete your account.</strong></p>
        <p className="mt-2">This includes all transactions, habits, profile settings, and streaks. You will be logged out immediately.</p>
        <p className="mt-2 text-yellow-300">This action is irreversible and your data cannot be recovered.</p>
        <p className="mt-4">Are you absolutely sure you want to delete your account?</p>
      </ConfirmationModal>
      
      {isFarewellModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 m-4">
                <h2 className="text-2xl font-bold mb-4 text-white">It's sad to see you go...</h2>
                <div className="text-gray-300 mb-6 space-y-2">
                    <p>Before you leave, would you like to save your data just in case you change your mind?</p>
                    <p className="text-sm text-gray-400">This will download a JSON file with all your transactions and habits that you can use to restore your progress if you return.</p>
                </div>
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={handleDeleteWithoutSaving} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-semibold transition">No, Just Delete</button>
                    <button type="button" onClick={handleSaveAndExit} className="py-2 px-4 rounded-lg text-white font-semibold transition bg-blue-600 hover:bg-blue-700">
                        Yes, Save My Data
                    </button>
                </div>
            </div>
        </div>
      )}

      <DataAnimationOverlay 
        isOpen={animationState.isOpen}
        animationType={animationState.type}
        onComplete={handleAnimationComplete}
      />

    </div>
  );
};

export default SettingsPage;