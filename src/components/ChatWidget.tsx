import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { MessageCircle, X, Send, Trash2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hello! I'm your Dandori guide. How can I help you find your inner child today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-chat', handleToggle);
    return () => window.removeEventListener('toggle-chat', handleToggle);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*/g, '')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput('');
    
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
        (import.meta.env.DEV ? 'http://localhost:3001' : 'https://dandori-backend-274788224867.europe-west2.run.app');

      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
      });
      
      const data = await response.json();
      
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: data.response || data.error || 'Sorry, I could not process that.', 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: 'Failed to connect to the backend. Make sure the server is running.', 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleClear = () => {
    setMessages([{ id: Date.now().toString(), text: "Welcome back! How can I help you today?", sender: 'bot' }]);
  };

  return (
    <>
      {/* Renders the floating chat button. */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-6 w-16 h-16 bg-dandori-dark text-white rounded-full shadow-xl flex items-center justify-center hover:bg-dandori-light hover:scale-110 transition-all z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        whileHover={{ rotate: 15 }}
      >
        <MessageCircle className="w-8 h-8" />
      </motion.button>

      {/* Renders the chat interface window. */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 w-[350px] sm:w-[450px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-dandori-dark/10"
          >
            {/* Renders the chat header with controls. */}
            <div className="bg-dandori-dark p-5 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-dandori-yellow" />
                <h3 className="font-serif font-bold text-xl">Dandori Buddy</h3>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleClear}
                  className="p-2 hover:bg-white/20 rounded-md transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 className="w-5 h-5 text-dandori-cream" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-md transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Renders the scrollable message display area. */}
            <div className="flex-grow p-5 overflow-y-auto bg-stone-50 flex flex-col gap-5">
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-4 rounded-2xl text-base leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-dandori-light text-dandori-dark rounded-br-sm' 
                        : 'bg-white border border-stone-200 text-stone-700 rounded-bl-sm shadow-sm prose max-w-none'
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                  />
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Renders the chat input form. */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-stone-100 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about courses..."
                className="flex-grow bg-stone-100 border-transparent focus:border-dandori-light focus:bg-white focus:ring-0 rounded-full px-5 py-3 text-base outline-none transition-colors"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="w-12 h-12 flex-shrink-0 bg-dandori-yellow text-dandori-dark rounded-full flex items-center justify-center hover:bg-dandori-cream disabled:opacity-50 disabled:hover:bg-dandori-yellow transition-colors"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
