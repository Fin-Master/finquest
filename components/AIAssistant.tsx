import React, { useState, useCallback } from 'react';
import { Transaction } from '../types';
import { geminiService } from '../services/geminiService';
import Spinner from './common/Spinner';
import { Sparkles } from 'lucide-react';
import { Currency } from '../constants';

interface AIAssistantProps {
  transactions: Transaction[];
  currency: Currency;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ transactions, currency }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState('');

  const getAIInsights = useCallback(async () => {
    if (transactions.length === 0) {
      setError("Not enough data for analysis. Please add some transactions.");
      setAiResponse('');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setAiResponse('');

    try {
      const response = await geminiService.generateFinancialInsight(transactions, currency || 'USD');
      setAiResponse(response);
    } catch (err) {
      console.error(err);
      setError('Failed to get AI insights. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [transactions, currency]);

  return (
    <div id="tour-step-5" className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
            <Sparkles className="mr-2 text-yellow-400" />
            AI Financial Assistant
        </h3>
        <button 
          onClick={getAIInsights}
          disabled={isLoading}
          className="mt-4 sm:mt-0 flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner size="sm" /> : "Get Insights"}
        </button>
      </div>
      
      {error && <p className="text-red-400 text-center">{error}</p>}

      {aiResponse && (
        <div className="mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <p className="text-gray-300 whitespace-pre-wrap font-mono">{aiResponse}</p>
        </div>
      )}

      {!isLoading && !aiResponse && !error && (
         <p className="text-gray-400 text-center mt-4">Click "Get Insights" for a personalized analysis of your spending habits.</p>
      )}
    </div>
  );
};

export default AIAssistant;