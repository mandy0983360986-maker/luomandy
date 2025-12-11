import { GoogleGenAI } from "@google/genai";
import { Transaction, StockHolding, Account } from "../types";

// Initialize the API client
// Note: In a real production build, use a backend proxy to hide the key, 
// or strictly restrict the key in Google Cloud Console if using client-side.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  /**
   * Generates a financial health summary and actionable advice.
   */
  generateFinancialAdvice: async (
    accounts: Account[],
    transactions: Transaction[],
    stocks: StockHolding[]
  ): Promise<string> => {
    
    if (!process.env.API_KEY) {
        return "API Key not found. Please configure GitHub Secrets or your environment to enable AI insights.";
    }

    try {
      const prompt = `
        You are an expert financial advisor. Analyze the following user financial data and provide a concise summary (max 200 words) and 3 bullet points of actionable advice.
        
        Data:
        Accounts: ${JSON.stringify(accounts.map(a => ({ type: a.type, balance: a.balance })))}
        Recent Transactions: ${JSON.stringify(transactions.slice(0, 10))}
        Stock Portfolio: ${JSON.stringify(stocks.map(s => ({ symbol: s.symbol, quantity: s.quantity, gain: (s.currentPrice - s.averageCost) * s.quantity })))}
        
        Format the response in Markdown. Use bolding for emphasis.
        Focus on: 
        1. Spending habits.
        2. Portfolio diversification risk.
        3. Liquidity status.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Could not generate advice at this time.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Unable to connect to AI advisor. Please check your internet connection or API key.";
    }
  },

  /**
   * Simulates a market analysis for a specific stock using Gemini's knowledge base.
   */
  analyzeStock: async (symbol: string): Promise<string> => {
     if (!process.env.API_KEY) return "API Key missing.";

     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the stock ${symbol} based on general market knowledge up to your cutoff. 
            Provide a very brief (1-2 sentences) summary of what the company does and its general sector outlook.
            Disclaimer: This is AI generated and not financial advice.`
        });
        return response.text || "No analysis available.";
     } catch (e) {
         return "Analysis failed.";
     }
  }
};
