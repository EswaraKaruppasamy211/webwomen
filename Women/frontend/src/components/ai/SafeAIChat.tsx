'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Bot, User as UserIcon, ShieldAlert, Sparkles, Phone, Compass, MapPin, Volume2 } from 'lucide-react';
import { api } from '../../services/api';
import { useEmergency } from '../../contexts/EmergencyContext';
import { audioAlerts } from '../../services/audioAlerts';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string; color: string }[];
}

export default function SafeAIChat() {
  const router = useRouter();
  const { currentPosition, triggerSOS, isSOSActive } = useEmergency();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm_welcome',
      sender: 'ai',
      text:
        "Hello! I'm **SafeAI**, your 24/7 personal safety assistant. Ask me about safe routes, emergency actions, nearest police posts, or de-escalation tips.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: '🚨 Immediate Danger / Help', action: 'DANGER_TRIGGER', color: 'emergency' },
        { label: '🧭 Plan Safest Route', action: 'NAVIGATE', color: 'teal' },
        { label: '🛡️ Nearest Safe Havens', action: 'SAFE_HAVENS', color: 'teal' },
        { label: '📱 Simulate Fake Call', action: 'FAKE_CALL', color: 'amber' },
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFakeCalling, setIsFakeCalling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    audioAlerts.playClick(600, 0.05);

    try {
      const res = await api.chatAI({
        message: text,
        isEmergencyMode: isSOSActive,
        currentLat: currentPosition.latitude,
        currentLng: currentPosition.longitude,
      });

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: res.suggestedActions,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          text: 'I encountered an issue reaching the safety engine. In an emergency, please dial **911** directly or press the red SOS button.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = async (action: string) => {
    audioAlerts.playClick(700, 0.08);

    if (action === 'DANGER_TRIGGER' || action === 'ACTIVATE_SOS') {
      router.push('/app/sos');
    } else if (action === 'NAVIGATE' || action === 'NAVIGATE_PAGE') {
      router.push('/app/navigate');
    } else if (action === 'SAFE_HAVENS' || action === 'NEAREST_SAFE_HAVEN') {
      handleSend('What are the nearest verified safe places and police stations?');
    } else if (action === 'FAKE_CALL') {
      triggerFakeCall();
    } else if (action === 'CALL_POLICE') {
      window.location.href = 'tel:911';
    } else if (action === 'SET_CHECKIN' || action === 'SET_CHECKIN_30') {
      router.push('/app/checkin');
    } else if (action === 'VIEW_CONTACTS') {
      router.push('/app/contacts');
    } else if (action === 'VIEW_MAP') {
      router.push('/app');
    } else if (action === 'EMERGENCY_INFO') {
      handleSend('What are the critical steps during an emergency?');
    }
  };

  const triggerFakeCall = () => {
    setIsFakeCalling(true);
    audioAlerts.playPhoneRing(12);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[650px] bg-safeNavy-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* SafeAI Header */}
      <div className="bg-safeNavy-800/90 border-b border-slate-700/60 p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-white">SafeAI Companion</h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Emergency & Route Navigation Intelligence</p>
          </div>
        </div>

        {/* Quick Fake Call Button */}
        <button
          onClick={triggerFakeCall}
          className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Simulate</span>
          <span>Fake Call</span>
        </button>
      </div>

      {/* Emergency Mode Alert Banner */}
      {isSOSActive && (
        <div className="bg-red-500/20 border-b border-red-500/40 p-2.5 flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="font-bold">Active Emergency Mode: Priority Triage Enabled</span>
          </div>
          <button
            onClick={() => router.push('/app/sos')}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] transition-colors"
          >
            Go to SOS Screen
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}>
              {isAi && (
                <div className="w-8 h-8 rounded-full bg-indigo-600/80 border border-indigo-400/40 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                  isAi
                    ? 'bg-safeNavy-800 border border-slate-700/80 text-slate-100'
                    : 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white rounded-br-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[10px] mt-1.5 flex justify-end ${
                    isAi ? 'text-slate-400' : 'text-rose-200'
                  }`}
                >
                  {msg.timestamp}
                </div>

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-700/60">
                    {msg.suggestedActions.map((act, idx) => {
                      let colorClass =
                        'bg-slate-700/80 hover:bg-slate-600 text-slate-200 border-slate-600';
                      if (act.color === 'emergency') {
                        colorClass =
                          'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/40 font-bold';
                      } else if (act.color === 'teal') {
                        colorClass =
                          'bg-safeTeal-500/20 hover:bg-safeTeal-500/30 text-safeTeal-400 border-safeTeal-500/40';
                      } else if (act.color === 'amber') {
                        colorClass =
                          'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40';
                      } else if (act.color === 'safeGreen') {
                        colorClass =
                          'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40';
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleActionClick(act.action)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all active:scale-95 flex items-center gap-1 ${colorClass}`}
                        >
                          <span>{act.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
            <div className="w-2 h-2 rounded-full bg-safeTeal-400 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-safeTeal-400 animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-safeTeal-400 animate-bounce [animation-delay:0.4s]"></div>
            <span>SafeAI is analyzing safety intelligence...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="bg-safeNavy-800/95 border-t border-slate-700/80 p-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask SafeAI (e.g. 'Is 4th street safe?', 'What to do if followed?')"
          className="flex-1 bg-safeNavy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>

      {/* Fake Phone Call Modal Overlay */}
      {isFakeCalling && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 rounded-3xl p-6 text-center text-white shadow-2xl animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-400 mx-auto flex items-center justify-center mb-4 animate-pulse">
              <Phone className="w-10 h-10 text-indigo-300" />
            </div>

            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Incoming Call</p>
            <h3 className="text-2xl font-bold mt-1">Mom ❤️</h3>
            <p className="text-xs text-slate-400 mt-1">Mobile +1 (555) 019-4481</p>

            <p className="text-xs text-slate-300 mt-6 bg-slate-800/80 p-3 rounded-xl border border-slate-700 leading-relaxed">
              Use this simulated call to speak aloud and deter uncomfortable surroundings (e.g. &ldquo;Hey Mom, I&apos;m just around the corner, see you in 2 mins&rdquo;).
            </p>

            <div className="flex items-center justify-center gap-8 mt-8">
              {/* Decline Button */}
              <button
                onClick={() => {
                  setIsFakeCalling(false);
                  audioAlerts.playClick(400, 0.1);
                }}
                className="flex flex-col items-center gap-1 text-xs font-semibold text-red-400"
              >
                <div className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-600/40">
                  <Phone className="w-6 h-6 rotate-[135deg]" />
                </div>
                <span>Decline</span>
              </button>

              {/* Accept / Talk Button */}
              <button
                onClick={() => {
                  alert("Connected to simulated call. Speak confidently as if speaking to family.");
                  setIsFakeCalling(false);
                }}
                className="flex flex-col items-center gap-1 text-xs font-semibold text-emerald-400"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/40 animate-bounce">
                  <Phone className="w-6 h-6" />
                </div>
                <span>Accept</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
