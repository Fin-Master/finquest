import React, { useState, useCallback, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import LoginScreen from './components/LoginScreen';
import TermsScreen from './components/TermsScreen';
import PrivacyPolicyScreen from './components/PrivacyPolicyScreen';
import { User, TimePeriod, Transaction, BackupData, SavingsGoal } from './types';
import Spinner from './components/common/Spinner';
import { Currency, DEFAULT_SAVINGS_GOAL_ID } from './constants';

type View = 'login' | 'dashboard' | 'terms' | 'privacy';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('login');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [habitCheckIns, setHabitCheckIns] = useState<string[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user session and all data on initial mount
  useEffect(() => {
    const storedUser = localStorage.getItem('finquest_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      parsedUser.settings = {
        currency: 'USD',
        defaultDashboardView: TimePeriod.MONTHLY,
        ...parsedUser.settings,
      };
      setUser(parsedUser);
      setView('dashboard'); // If user exists, go to dashboard
    }

    const storedTransactions = localStorage.getItem('finquest_transactions');
    const loadedTransactions = storedTransactions ? JSON.parse(storedTransactions) : [];
    setTransactions(loadedTransactions);

    const storedCheckIns = localStorage.getItem('finquest_habits');
    if (storedCheckIns) {
      setHabitCheckIns(JSON.parse(storedCheckIns));
    }

    const storedActivityLog = localStorage.getItem('finquest_activity_log');
    if (storedActivityLog) {
      setActivityLog(JSON.parse(storedActivityLog));
    }
    
    const storedSavingsGoals = localStorage.getItem('finquest_savings_goals');
    let userSavingsGoals: SavingsGoal[] = storedSavingsGoals ? JSON.parse(storedSavingsGoals) : [];
    
    // Ensure default savings goal exists
    const hasDefaultGoal = userSavingsGoals.some(goal => goal.id === DEFAULT_SAVINGS_GOAL_ID);
    if (!hasDefaultGoal) {
        const defaultGoal: SavingsGoal = {
            id: DEFAULT_SAVINGS_GOAL_ID,
            name: 'General Savings',
            targetAmount: 1000000, // A high, symbolic target
            currentAmount: 0,
            emoji: '💰',
            createdAt: new Date().toISOString(),
            isDeletable: false,
        };
        userSavingsGoals.unshift(defaultGoal); // Add to the beginning
    }
    
    setSavingsGoals(userSavingsGoals);

    setLoading(false);
  }, []);
  
  // Recalculate savings goals and validate transaction chains whenever transactions change
  useEffect(() => {
    const goalIds = new Set(transactions.filter(t => t.goalId).map(t => t.goalId!));
    let transactionsHaveChanged = false;
    const validatedTransactions = JSON.parse(JSON.stringify(transactions)); // Deep copy to avoid mutation issues
    const goalBalances = new Map<string, number>();

    // Step 1: Validate transaction chains and mark inconsistencies
    goalIds.forEach(goalId => {
        let runningBalance = 0;
        const goalTransactions = validatedTransactions
            .filter((t: Transaction) => t.goalId === goalId)
            .sort((a: Transaction, b: Transaction) => new Date(a.date).getTime() - new Date(b.date).getTime());

        goalTransactions.forEach((t: Transaction) => {
            let currentIsValid = true;
            let currentInvalidationReason = '';

            if (t.savingsMeta) {
                // Check if the transaction's recorded previous amount matches the calculated running balance
                if (Math.abs(t.savingsMeta.previousAmount - runningBalance) > 0.001) { // Use a tolerance for float comparison
                    currentIsValid = false;
                    currentInvalidationReason = `Historical data mismatch. Expected previous balance of ${runningBalance.toFixed(2)}, but transaction was based on ${t.savingsMeta.previousAmount.toFixed(2)}. This can happen if a prior transaction was deleted.`;
                }
            }

            // If validity has changed, mark it for state update
            if ((t.isValid ?? true) !== currentIsValid) {
                transactionsHaveChanged = true;
                t.isValid = currentIsValid;
                t.invalidationReason = currentInvalidationReason;
            } else if (currentIsValid && (t.isValid === false || t.invalidationReason)) {
                // If it's now valid, clear the invalid status
                transactionsHaveChanged = true;
                t.isValid = true;
                delete t.invalidationReason;
            }

            // Update running balance for the next transaction in the chain
            if (t.category === 'Savings Contribution') {
                runningBalance += t.amount;
            } else if (t.category === 'Savings Withdrawal') {
                runningBalance -= t.amount;
            }
        });
        goalBalances.set(goalId, runningBalance);
    });

    if (transactionsHaveChanged) {
        // Use the callback function to ensure we don't trigger an infinite loop easily
        handleUpdateTransactions(validatedTransactions);
    }
    
    // Step 2: Update the master savings goals state with fresh balances
    setSavingsGoals(currentGoals => {
        let goalsHaveChanged = false;
        const newGoals = currentGoals.map(goal => {
            const newAmount = goalBalances.get(goal.id) ?? (goal.id === DEFAULT_SAVINGS_GOAL_ID ? 0 : goal.currentAmount);
            if (Math.abs(goal.currentAmount - newAmount) > 0.001) {
                goalsHaveChanged = true;
                return { ...goal, currentAmount: newAmount };
            }
            return goal;
        });

        if (goalsHaveChanged) {
            localStorage.setItem('finquest_savings_goals', JSON.stringify(newGoals));
            return newGoals;
        }
        return currentGoals;
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);


  const handleUpdateTransactions = useCallback((newTransactions: Transaction[]) => {
    const sorted = newTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(sorted);
    localStorage.setItem('finquest_transactions', JSON.stringify(sorted));
  }, []);

  const handleUpdateHabits = useCallback((newHabits: string[]) => {
    setHabitCheckIns(newHabits);
    localStorage.setItem('finquest_habits', JSON.stringify(newHabits));
  }, []);

  const handleUpdateActivityLog = useCallback((newLog: string[]) => {
    setActivityLog(newLog);
    localStorage.setItem('finquest_activity_log', JSON.stringify(newLog));
  }, []);
  
  const handleUpdateSavingsGoals = useCallback((newGoals: SavingsGoal[]) => {
    setSavingsGoals(newGoals);
    localStorage.setItem('finquest_savings_goals', JSON.stringify(newGoals));
  }, []);

  const handleLogin = useCallback((loggedInUser: User) => {
    const userWithSettings = {
      ...loggedInUser,
      settings: {
        currency: 'USD' as Currency,
        defaultDashboardView: TimePeriod.MONTHLY,
        ...loggedInUser.settings,
      },
    };
    setUser(userWithSettings);
    localStorage.setItem('finquest_user', JSON.stringify(userWithSettings));
    localStorage.setItem(`finquest_profile_${loggedInUser.id}`, JSON.stringify(userWithSettings));
    setView('dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('finquest_user');
    setView('login');
  }, []);

  const handleUpdateUser = useCallback((updatedData: Partial<User>) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      const updatedUser = {
        ...currentUser,
        ...updatedData,
        settings: { ...currentUser.settings, ...updatedData.settings }
      };
      localStorage.setItem('finquest_user', JSON.stringify(updatedUser));
      localStorage.setItem(`finquest_profile_${currentUser.id}`, JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);
  
  const handleRestoreData = useCallback((data: BackupData) => {
    let finalTransactions = data.transactions;
    let finalSavingsGoals: SavingsGoal[];
    
    // Check if savings goals are included in the backup (new format)
    if (data.savingsGoals) {
        finalSavingsGoals = data.savingsGoals;
    } else {
        // Handle legacy backup format: reconstruct goals from transactions
        console.log("Legacy backup detected. Reconstructing savings goals...");
        const reconstructedGoals: SavingsGoal[] = [];
        const goalNameMap = new Map<string, SavingsGoal>();

        // Ensure default goal exists
        const existingDefaultGoal = savingsGoals.find(g => g.id === DEFAULT_SAVINGS_GOAL_ID)!;
        reconstructedGoals.push(existingDefaultGoal);
        goalNameMap.set(existingDefaultGoal.name.toLowerCase(), existingDefaultGoal);
        
        const goalRegex1 = /\(Goal: (.*?)\)/i;
        const goalRegex2 = /new goal: "(.*?)"/i;

        finalTransactions = data.transactions.map(t => {
            if (t.category === 'Savings Contribution' || t.category === 'Savings Withdrawal') {
                let goalName: string | null = null;
                const match1 = t.description.match(goalRegex1);
                const match2 = t.description.match(goalRegex2);
                
                if (match1) goalName = match1[1].trim();
                else if (match2) goalName = match2[1].trim();
                
                if (goalName) {
                    let goal = goalNameMap.get(goalName.toLowerCase());
                    if (!goal) {
                        // Create a new goal if it doesn't exist
                        goal = {
                            id: crypto.randomUUID(),
                            name: goalName,
                            targetAmount: 500, // A sensible default
                            currentAmount: 0, // Will be recalculated
                            emoji: '🎯', // Default emoji
                            createdAt: t.date,
                            isDeletable: true,
                        };
                        reconstructedGoals.push(goal);
                        goalNameMap.set(goalName.toLowerCase(), goal);
                    }
                    // Link transaction to goal
                    return { ...t, goalId: goal.id };
                }
            }
            return t;
        });

        finalSavingsGoals = reconstructedGoals;
    }
    
    // Update state with final data
    handleUpdateSavingsGoals(finalSavingsGoals);
    handleUpdateTransactions(finalTransactions);
    handleUpdateHabits(data.habitCheckIns);

  }, [handleUpdateTransactions, handleUpdateHabits, handleUpdateSavingsGoals, savingsGoals]);

  const handleDeleteAllData = useCallback(() => {
    handleUpdateTransactions([]);
    handleUpdateHabits([]);
    handleUpdateActivityLog([]);
    // Remove all user-created goals, keep the default one.
    const defaultGoal = savingsGoals.find(g => g.id === DEFAULT_SAVINGS_GOAL_ID);
    handleUpdateSavingsGoals(defaultGoal ? [{...defaultGoal, currentAmount: 0}] : []);
  }, [handleUpdateTransactions, handleUpdateHabits, handleUpdateActivityLog, handleUpdateSavingsGoals, savingsGoals]);

  const handleDeleteAccount = useCallback(() => {
    if (!user) return;
    handleDeleteAllData();
    localStorage.removeItem(`finquest_profile_${user.id}`);
    handleLogout();
  }, [user, handleDeleteAllData, handleLogout]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Spinner />
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        if (user) {
          return (
            <Dashboard 
              user={user} 
              transactions={transactions}
              habitCheckIns={habitCheckIns}
              activityLog={activityLog}
              savingsGoals={savingsGoals}
              onLogout={handleLogout} 
              onUpdateUser={handleUpdateUser} 
              onUpdateTransactions={handleUpdateTransactions}
              onUpdateHabits={handleUpdateHabits}
              onUpdateActivityLog={handleUpdateActivityLog}
              onUpdateSavingsGoals={handleUpdateSavingsGoals}
              onRestoreData={handleRestoreData}
              onDeleteAllData={handleDeleteAllData}
              onDeleteAccount={handleDeleteAccount}
            />
          );
        }
        // If user is null but view is 'dashboard', redirect to login
        setView('login');
        return <LoginScreen onLogin={handleLogin} onNavigateToTerms={() => setView('terms')} onNavigateToPrivacy={() => setView('privacy')} />;
      case 'terms':
        return <TermsScreen onBack={() => setView('login')} />;
      case 'privacy':
        return <PrivacyPolicyScreen onBack={() => setView('login')} />;
      case 'login':
      default:
        return <LoginScreen onLogin={handleLogin} onNavigateToTerms={() => setView('terms')} onNavigateToPrivacy={() => setView('privacy')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      {renderContent()}
    </div>
  );
};

export default App;