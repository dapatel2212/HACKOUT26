import { create } from 'zustand';
import { chatService } from '../services/chatService';

export const useChatStore = create((set) => ({
  messages: [
    {
      role: 'bot',
      text: 'नमस्ते! मैं आपका बैंकबडी (BankBuddy) एआई सहायक हूँ। मैं आपकी क्या मदद कर सकता हूँ?',
      quick_replies: ['Mera balance kya hai', 'Mujhe loan chahiye', 'EMI calculator']
    }
  ],
  loading: false,

  sendMessage: async (customerId, text, language = 'hi') => {
    const newMsg = { role: 'user', text, timestamp: new Date().toISOString() };
    set((state) => ({ messages: [...state.messages, newMsg], loading: true }));

    try {
      const data = await chatService.sendMessage(customerId, text, language);
      const botMsg = {
        role: 'bot',
        text: data.response || 'Understood.',
        quick_replies: data.quick_replies || [],
        action_link: data.action_link,
        product_card: data.product_card,
        timestamp: new Date().toISOString()
      };
      set((state) => ({ messages: [...state.messages, botMsg], loading: false }));
    } catch {
      const fallbackMsg = {
        role: 'bot',
        text: 'क्षमा करें, सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें। (Server connection error)',
        quick_replies: ['Mera balance kya hai'],
        timestamp: new Date().toISOString()
      };
      set((state) => ({ messages: [...state.messages, fallbackMsg], loading: false }));
    }
  },

  clearChat: () => {
    set({ messages: [] });
  }
}));
