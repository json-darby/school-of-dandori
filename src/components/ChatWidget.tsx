import { useState, useEffect, useRef } from 'react';
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

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput('');
    
    try {
      const response = await fetch('https://school-of-dandori-980659832082.europe-west2.run.app/chat', {
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
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-6 w-14 h-14 bg-dandori-dark text-white rounded-full shadow-xl flex items-center justify-center hover:bg-dandori-light hover:scale-110 transition-all z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        whileHover={{ rotate: 15 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-dandori-dark/10"
          >
            {/* Header */}
            <div className="bg-dandori-dark p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-dandori-yellow" />
                <h3 className="font-serif font-bold text-lg">Dandori Buddy</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleClear}
                  className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4 text-dandori-cream" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto bg-stone-50 flex flex-col gap-4">
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-dandori-light text-dandori-dark rounded-br-sm' 
                        : 'bg-white border border-stone-200 text-stone-700 rounded-bl-sm shadow-sm prose prose-sm max-w-none'
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                  />
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about courses..."
                className="flex-grow bg-stone-100 border-transparent focus:border-dandori-light focus:bg-white focus:ring-0 rounded-full px-4 py-2 text-sm outline-none transition-colors"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 bg-dandori-yellow text-dandori-dark rounded-full flex items-center justify-center hover:bg-dandori-cream disabled:opacity-50 disabled:hover:bg-dandori-yellow transition-colors"
              >
                <Send className="w-4 h-4 ml-1" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
