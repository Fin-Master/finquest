import React, { useState } from 'react';
import { SavingsGoal, Transaction, TransactionType } from '../types';
import { Plus } from 'lucide-react';
import { DEFAULT_SAVINGS_GOAL_ID } from '../constants';

interface AssignSavingsGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    pendingTransaction: Omit<Transaction, 'id' | 'goalId'>;
    goals: SavingsGoal[];
    onUpdateGoals: (goals: SavingsGoal[]) => void;
    transactions: Transaction[];
    onUpdateTransactions: (transactions: Transaction[]) => void;
    currencySymbol: string;
    triggerFinCheer: () => void;
}

const EMOJI_OPTIONS = ['💰', '💻', '✈️', '🚗', '🏠', '🎓', '🎁', '🚑', '💍', '🎮', '📱'];

const AssignSavingsGoalModal: React.FC<AssignSavingsGoalModalProps> = ({
    isOpen,
    onClose,
    pendingTransaction,
    goals,
    onUpdateGoals,
    transactions,
    onUpdateTransactions,
    currencySymbol,
    triggerFinCheer
}) => {
    const [view, setView] = useState<'select' | 'create'>('select');
    const [goalName, setGoalName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_OPTIONS[0]);

    if (!isOpen) return null;

    const handleGoalSelection = (goal: SavingsGoal) => {
        const amount = pendingTransaction.amount;
        const generalGoal = goals.find(g => g.id === DEFAULT_SAVINGS_GOAL_ID);

        // Handle over-contribution by splitting the transaction
        if (goal.isDeletable !== false && (goal.currentAmount + amount) > goal.targetAmount) {
            const amountToComplete = goal.targetAmount - goal.currentAmount;
            const spilloverAmount = amount - amountToComplete;
            
            const transactionsToAdd: Transaction[] = [];
            
            if (amountToComplete > 0.001) {
                transactionsToAdd.push({
                    ...pendingTransaction,
                    id: crypto.randomUUID(),
                    amount: amountToComplete,
                    description: `Final contribution to complete: "${goal.name}"`,
                    goalId: goal.id,
                    isValid: true,
                    savingsMeta: {
                        previousAmount: goal.currentAmount,
                        currentAmount: goal.targetAmount,
                    },
                });
            }
            
            if (spilloverAmount > 0.001 && generalGoal) {
                transactionsToAdd.push({
                    ...pendingTransaction,
                    id: crypto.randomUUID(),
                    amount: spilloverAmount,
                    description: `Spillover from "${goal.name}" to General Savings`,
                    goalId: generalGoal.id,
                    isValid: true,
                    savingsMeta: {
                        previousAmount: generalGoal.currentAmount,
                        currentAmount: generalGoal.currentAmount + spilloverAmount,
                    },
                });
            }
            
            onUpdateTransactions([...transactions, ...transactionsToAdd]);
            
            const spilloverMessage = `Excess of ${currencySymbol}${spilloverAmount.toFixed(2)} transferred to General Savings.`;
            const generalGoalReceiptMessage = `Received ${currencySymbol}${spilloverAmount.toFixed(2)} spillover from "${goal.name}".`;

            const updatedGoals = goals.map(g => {
                if (g.id === goal.id) {
                    return { ...g, unreadNotificationMessage: spilloverMessage };
                }
                if (spilloverAmount > 0.001 && g.id === generalGoal?.id) {
                    return { ...g, unreadNotificationMessage: generalGoalReceiptMessage };
                }
                return g;
            });
            onUpdateGoals(updatedGoals);
            triggerFinCheer();

        } else {
            // Original logic for normal contribution
            const newTransaction: Transaction = {
                ...pendingTransaction,
                id: crypto.randomUUID(),
                description: pendingTransaction.description 
                    ? `${pendingTransaction.description} (Goal: ${goal.name})`
                    : `Contribution to savings goal: "${goal.name}"`,
                goalId: goal.id,
                isValid: true,
                savingsMeta: {
                    previousAmount: goal.currentAmount,
                    currentAmount: goal.currentAmount + amount,
                },
            };
            onUpdateTransactions([...transactions, newTransaction]);
            
            if (goal.isDeletable !== false && goal.currentAmount < goal.targetAmount && (goal.currentAmount + pendingTransaction.amount) >= goal.targetAmount) {
                triggerFinCheer();
            }
        }
        
        onClose();
    };

    const handleCreateGoalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!goalName || !targetAmount || !selectedEmoji) return;
        
        const newGoal: SavingsGoal = {
            id: crypto.randomUUID(),
            name: goalName,
            targetAmount: parseFloat(targetAmount),
            currentAmount: 0,
            emoji: selectedEmoji,
            createdAt: new Date().toISOString(),
            isDeletable: true,
        };
        onUpdateGoals([...goals, newGoal]);

        const amount = pendingTransaction.amount;
        const newTransaction: Transaction = {
             ...pendingTransaction,
            id: crypto.randomUUID(),
            description: `Initial contribution to new goal: "${newGoal.name}"`,
            goalId: newGoal.id,
            isValid: true,
            savingsMeta: {
                previousAmount: 0, // It's a new goal
                currentAmount: amount,
            },
        };
        onUpdateTransactions([...transactions, newTransaction]);

        if (pendingTransaction.amount >= newGoal.targetAmount) {
            triggerFinCheer();
        }

        onClose();
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 m-4">
                {view === 'select' ? (
                    <>
                        <h2 className="text-2xl font-bold mb-2 text-white">Assign to Savings Quest</h2>
                        <p className="text-gray-400 mb-6">Where should this <span className="font-bold text-green-400">{currencySymbol}{pendingTransaction.amount.toFixed(2)}</span> go?</p>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {goals.map(goal => (
                                <button
                                    key={goal.id}
                                    onClick={() => handleGoalSelection(goal)}
                                    className="w-full flex items-center text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition"
                                >
                                    <span className="text-2xl mr-4">{goal.emoji}</span>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-white">{goal.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {currencySymbol}{goal.currentAmount.toFixed(2)}
                                            {goal.isDeletable !== false && ` / ${currencySymbol}${goal.targetAmount.toFixed(2)}`}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setView('create')}
                            className="w-full flex items-center justify-center gap-2 mt-6 p-3 bg-indigo-600/80 hover:bg-indigo-600 rounded-lg transition font-semibold"
                        >
                           <Plus size={20} /> Create New Quest
                        </button>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-6 text-white">Create New Quest</h2>
                        <form onSubmit={handleCreateGoalSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Quest Name</label>
                                <input type="text" value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="e.g., Dream Vacation" required className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Target Amount ({currencySymbol})</label>
                                <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="2000" min="1" step="0.01" required className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Choose an Icon</label>
                                <div className="flex flex-wrap gap-2">
                                    {EMOJI_OPTIONS.map(emoji => (
                                        <button type="button" key={emoji} onClick={() => setSelectedEmoji(emoji)} className={`p-2 text-2xl rounded-lg transition ${selectedEmoji === emoji ? 'bg-indigo-500 ring-2 ring-indigo-300' : 'bg-gray-700 hover:bg-gray-600'}`}>{emoji}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setView('select')} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-semibold transition">Back</button>
                                <button type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold transition">Create & Assign</button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default AssignSavingsGoalModal;