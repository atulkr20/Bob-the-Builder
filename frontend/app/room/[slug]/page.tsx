'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Clock, Hash, Users, ArrowLeft, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  sender_name: string;
  text: string;
  timestamp: Date;
}

export default function RoomPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState('10:00');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [userName] = useState('User');

  useEffect(() => {
    // Mock countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const [minutes, seconds] = prev.split(':').map(Number);
        let mins = minutes;
        let secs = seconds - 1;
        if (secs < 0) {
          secs = 59;
          mins -= 1;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Math.random().toString(),
      sender_name: userName,
      text: input,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInput('');

    // Auto-scroll
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 0);
  };

  return (
    <main className="min-h-screen flex flex-col bg-zinc-950 text-zinc-200" style={{ backgroundColor: '#080808' }}>
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-zinc-900 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Hash className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="font-bold text-white">demonstration</h1>
              <p className="text-xs text-zinc-500 flex items-center gap-1">
                <Users className="w-3 h-3" />4 members
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
          <Clock size={14} className="text-zinc-400" />
          <span className="text-xs font-mono font-bold text-zinc-200 tabular-nums">{timeLeft}</span>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full gap-4"
            >
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #f97316, #eab308)',
                }}
              >
                <Hash className="w-8 h-8 text-black" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-white mb-1">Welcome to demonstration</h2>
                <p className="text-zinc-500 text-sm">Start a conversation below</p>
              </div>
            </motion.div>
          ) : (
            messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMe={msg.sender_name === userName}
                delay={idx * 0.05}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition"
          />
          <motion.button
            onClick={handleSend}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-lg text-black font-bold flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #f97316, #eab308)',
            }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
        <p className="mt-4 text-center text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
          All data will be destroyed in {timeLeft}
        </p>
      </div>
    </main>
  );
}

function MessageBubble({ message, isMe, delay }: { message: Message; isMe: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs px-4 py-2.5 rounded-2xl ${
          isMe
            ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-black font-semibold'
            : 'bg-zinc-900 border border-zinc-800 text-zinc-100'
        }`}
      >
        <p className="text-sm">{message.text}</p>
      </div>
    </motion.div>
  );
}
