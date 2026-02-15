
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, BrainCircuit, RefreshCw } from 'lucide-react';
import { Transaction, Debt, SavingsGoal, Currency } from '../types.ts';

interface InsightsProps {
  transactions: Transaction[];
  debts: Debt[];
  savings: SavingsGoal[];
  currency: Currency;
}

const FinancialInsights: React.FC<InsightsProps> = ({ transactions, debts, savings, currency }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    // Safely check for API key
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : null;

    if (!apiKey) {
      setInsight("Connect your AI brain to get personalized financial strategies.");
      return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const prompt = `
        Analyze this financial data and provide 3 actionable advice points:
        (Note: All numerical amounts are in ${currency.label} - ${currency.code})
        
        - Recent Transactions: ${JSON.stringify(transactions.slice(0, 5).map(t => ({ d: t.description, a: t.amount, c: t.category })))}
        - Total Debts Remaining: ${debts.reduce((acc, d) => acc + d.remaining_balance, 0).toFixed(2)}
        - Savings Progress: ${savings.map(s => `${s.title}: ${s.current_amount}/${s.target_amount}`).join(', ')}

        Keep points short and punchy. Address the user specifically regarding their spending and saving habits in ${currency.code}.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            systemInstruction: "You are a professional financial advisor. Provide concise, clear, and actionable bullet points without conversational filler. Focus on trends and immediate improvements.",
        }
      });

      setInsight(response.text || "I couldn't generate insights at this moment. Try again later.");
    } catch (error) {
      console.error(error);
      setInsight("Error generating insights. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, []);

  return (
    <div className="bg-brand-primary rounded-3xl p-6 text-white shadow-xl shadow-brand-primary/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <BrainCircuit size={120} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-yellow-400" size={24} />
            <h3 className="text-xl font-bold tracking-tight">AI Insights</h3>
          </div>
          <button 
            onClick={generateInsights}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-3 min-h-[100px] flex flex-col justify-center">
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 bg-white/20 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded w-2/3 animate-pulse"></div>
            </div>
          ) : (
            <div className="text-sm opacity-90 leading-relaxed whitespace-pre-line">
              {insight ? insight.replace(/[*#]/g, '') : "Analyze your data to get smart insights."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialInsights;
