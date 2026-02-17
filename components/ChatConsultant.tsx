import React, { useState, useRef, useEffect } from 'react';
import { PredictionResult } from '../types';
import { sendFollowUpQuestion } from '../services/geminiService';
import { Send, User, Sparkles, Loader2, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatConsultantProps {
  predictionContext: PredictionResult;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

const ChatConsultant: React.FC<ChatConsultantProps> = ({ predictionContext }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Chào gia chủ, ta đã luận giải xong lá số. Gia chủ còn điều gì băn khoăn về vận hạn năm 2026 cần ta giải đáp thêm không?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const replyText = await sendFollowUpQuestion(predictionContext, userMsg.text);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Thiên cơ bất khả lộ, kết nối tạm thời gián đoạn. Xin thí chủ thử lại."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[60vh] md:h-[500px] bg-brand-dark/40 rounded-lg border border-white/5 overflow-hidden shadow-inner mt-4 md:mt-6">
      {/* Header */}
      <div className="bg-brand-secondary/80 p-3 md:p-4 border-b border-white/5 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-accent to-yellow-200 flex items-center justify-center shadow-glow">
            <Bot size={16} className="text-brand-dark" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-serif">Đại Sư AI Tư Vấn</h4>
            <p className="text-[10px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              Đang trực tuyến
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-3 md:p-4 space-y-4 custom-scrollbar bg-black/20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[90%] md:max-w-[85%] flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0 flex items-center justify-center border border-white/10 ${
                msg.sender === 'user' ? 'bg-brand-secondary' : 'bg-brand-accent/20'
              }`}>
                {msg.sender === 'user' ? <User size={12} /> : <Sparkles size={12} className="text-brand-accent" />}
              </div>
              
              <div className={`p-2.5 md:p-3 rounded-2xl text-xs md:text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-brand-secondary text-brand-text rounded-tr-none border border-white/5' 
                  : 'bg-brand-primary/80 text-white rounded-tl-none border border-brand-accent/20 shadow-[0_0_10px_rgba(212,175,55,0.05)]'
              }`}>
                {msg.sender === 'ai' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                     <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[85%] flex gap-2">
               <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex-shrink-0 flex items-center justify-center border border-white/10">
                 <Loader2 size={14} className="text-brand-accent animate-spin" />
               </div>
               <div className="bg-brand-primary/80 p-3 rounded-2xl rounded-tl-none border border-brand-accent/20">
                 <div className="flex gap-1">
                   <span className="w-1.5 h-1.5 bg-brand-muted rounded-full animate-bounce"></span>
                   <span className="w-1.5 h-1.5 bg-brand-muted rounded-full animate-bounce delay-100"></span>
                   <span className="w-1.5 h-1.5 bg-brand-muted rounded-full animate-bounce delay-200"></span>
                 </div>
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 bg-brand-secondary/30 border-t border-white/5">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi..."
            className="flex-grow bg-brand-dark/60 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:border-brand-accent/50 focus:outline-none focus:ring-1 focus:ring-brand-accent/30 transition-all placeholder-brand-muted/50"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-1.5 bg-brand-accent rounded-lg text-brand-dark hover:bg-brand-accentHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatConsultant;
