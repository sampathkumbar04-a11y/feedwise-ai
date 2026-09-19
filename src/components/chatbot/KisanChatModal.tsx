import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Send, Bot, User, Mic, Sparkles, Volume2 } from 'lucide-react';
import { AGRONOMY_FAQ } from '../../data/agronomyFAQ';
import { speechService } from '../../services/speechService';
import { useLanguage } from '../../context/LanguageContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface KisanChatModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const KisanChatModal: React.FC<KisanChatModalProps> = ({
  id,
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_welcome',
      sender: 'assistant',
      text:
        language === 'hi'
          ? 'नमस्ते किसान भाई! मैं FeedWise किसान एआई सहायक हूँ। आप साइलेज बनाने, फ्लीग स्कोर, दूध व फैट बढ़ाने या संतुलित पशु आहार के बारे में कोई भी प्रश्न पूछ सकते हैं।'
          : language === 'kn'
          ? 'ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! ನಾನು FeedWise ಕಿಸಾನ್ AI ಸಹಾಯಕ. ಸೈಲೇಜ್ ತಯಾರಿಕೆ, ಹಸುವಿನ ಆಹಾರ, ಮತ್ತು ಹಾಲಿನ ಕೊಬ್ಬು ಹೆಚ್ಚಿಸುವ ಬಗ್ಗೆ ನೀವು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು.'
          : 'Namaste! I am your FeedWise Kisan AI Assistant. Ask me anything about silage preservation, Flieg Score calculations, milk fat optimization, or ICAR dairy rations in English, Hindi, or Kannada.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickPrompts = [
    {
      en: 'How to make high quality corn silage?',
      hi: 'साइलेज बनाने का सही तरीका क्या है?',
      kn: 'ಉತ್ತಮ ಸೈಲೇಜ್ ಹೇಗೆ ತಯಾರಿಸುವುದು?',
    },
    {
      en: 'How to increase milk fat and SNF in cows?',
      hi: 'गाय के दूध में फैट व SNF कैसे बढ़ाएं?',
      kn: 'ಹಾಲಿನ ಕೊಬ್ಬು ಹೆಚ್ಚಿಸಲು ಏನು ಮಾಡಬೇಕು?',
    },
    {
      en: 'What is a good Flieg Score for silage?',
      hi: 'साइलेज का फ्लीग स्कोर कितना होना चाहिए?',
      kn: 'ಉತ್ತಮ ಫ್ಲೀಗ್ ಸ್ಕೋರ್ ಎಷ್ಟು?',
    },
    {
      en: 'How to protect cows from heat stress (THI)?',
      hi: 'गर्मी में पशुओं को लू व तनाव से कैसे बचाएं?',
      kn: 'ಶಾಖದ ಒತ್ತಡದಿಂದ ಹಸುವನ್ನು ಹೇಗೆ ರಕ್ಷಿಸುವುದು?',
    },
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    // Query matching logic across agronomy FAQ
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const matched = AGRONOMY_FAQ.find((faq) =>
        faq.keywords.some((kw) => lowerQuery.includes(kw.toLowerCase()))
      );

      let responseText = '';
      if (matched) {
        responseText =
          language === 'hi'
            ? matched.answerHi
            : language === 'kn'
            ? matched.answerKn
            : matched.answerEn;
      } else {
        responseText =
          language === 'hi'
            ? `धन्यवाद किसान भाई। आपके प्रश्न "${query}" के लिए: संतुलित डेयरी पोषण के लिए प्रतिदिन 30-35 किलो हरा चारा/साइलेज, 2-3 किलो सूखा भूसा और 3-4 किलो दलिया व खली मिश्रण 50 ग्राम मिनरल मिक्चर के साथ दें।`
            : language === 'kn'
            ? `ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ "${query}": ಪ್ರತಿದಿನ 30 ಕೆಜಿ ಹಸಿರು ಮೇವು, 3 ಕೆಜಿ ಒಣ ಹುಲ್ಲು, ಮತ್ತು ಸಮತೋಲಿತ ಖನಿಜ ಮಿಶ್ರಣವನ್ನು ನೀಡಿ.`
            : `For optimal dairy yield and "${query}": Maintain a balanced 60:40 roughage to concentrate ratio on dry matter basis with 15-20kg silage, 2-3kg dry straw, and 50-80g chelated mineral mix daily.`;
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  };

  return (
    <Modal
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      title="Kisan AI Sahayak (किसान सहायक)"
      subtitle="Autonomous multilingual agronomy chatbot for cattle feeding & silage management"
      maxWidth="xl"
    >
      <div className="flex flex-col h-[480px]">
        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto space-y-3 p-1 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-xs'
                    : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-100 rounded-tl-xs border border-stone-200/60 dark:border-stone-700/60'
                }`}
              >
                <p>{msg.text}</p>
                <div className="flex items-center justify-between mt-1 text-[10px] opacity-75">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'assistant' && (
                    <button
                      type="button"
                      onClick={() =>
                        speechService.speak(msg.text, language as 'en' | 'hi' | 'kn')
                      }
                      className="ml-2 hover:opacity-100 p-0.5 rounded"
                      title="Read aloud"
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              {msg.sender === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick prompt suggestions */}
        <div className="py-2 border-t border-stone-100 dark:border-stone-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Recommended Questions
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {quickPrompts.map((p, idx) => {
              const label = language === 'hi' ? p.hi : language === 'kn' ? p.kn : p.en;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(label)}
                  className="whitespace-nowrap rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] text-stone-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-300 dark:hover:bg-emerald-950/40 transition-colors shrink-0"
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input box */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={
              language === 'hi'
                ? 'साइलेज, संतुलित आहार या रोग संबंधी सवाल पूछें...'
                : language === 'kn'
                ? 'ಪ್ರಶ್ನೆಗಳನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...'
                : 'Ask anything about silage, milk yield, or cattle nutrition...'
            }
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-xs bg-white dark:bg-stone-800 dark:border-stone-700 dark:text-white focus:border-emerald-500 focus:outline-hidden"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
