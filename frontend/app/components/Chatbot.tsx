"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    Headphones,
    X,
    Send,
    Bot,
    User,
    ChevronRight,
    Phone,
    MapPin,
    Mail,
    CheckCircle2,
    Award,
    Briefcase,
    Sparkles,
} from "lucide-react";

import { usePathname } from "next/navigation";

interface Course {
    category: string;
    keywords: string[];
    details: string;
    fee?: string;
}

interface KnowledgeBase {
    company: {
        name: string;
        brand: string;
        overview: string;
        vision: string;
        location: string;
        working_hours: string;
        contacts: string[];
        email: string;
        website: string;
    };
    courses: Course[];
    placement: {
        keywords: string[];
        details: string;
    };
    consulting: {
        keywords: string[];
        details: string;
    };
}

// Knowledge Base data updated with actual content from nskillindia.com
const knowledgeBase: KnowledgeBase = {
    company: {
        name: "Niile Technical Skill & Consulting Pvt Ltd (NTSC)",
        brand: "N-Skill India",
        overview: "N-Skill India is a premier technical skill training and industrial consulting firm based in Chennai. We bridge the gap between academic learning and industrial requirements by providing hands-on, job-oriented training.",
        vision: "To empower youth with technical expertise and make them industry-ready for global opportunities.",
        location: "361/3, Pillaiyar Kovil Street, Raghavendra Nagar, Irandamkattalai, Kovur, Chennai - 600 122, India.",
        working_hours: "9.30 AM to 7.00 PM",
        contacts: ["+91 9884209774", "+91 8056063023", "+91 9884200807"],
        email: "nskilltraining@gmail.com",
        website: "www.nskillindia.com"
    },
    courses: [
        {
            category: "MEP (Mechanical, Electrical, Plumbing)",
            keywords: ["mep", "mechanical", "electrical", "plumbing", "wiring", "fire fighting"],
            details: "Our MEP training covers Design, Testing, and Commissioning of HVAC, Fire Fighting Systems, BMS, STP/WTP, and both Domestic & Industrial Wiring and Plumbing systems."
        },
        {
            category: "HVAC Engineering",
            keywords: ["hvac", "ac", "air conditioning", "cooling", "ventilation"],
            fee: "₹15,000",
            details: "Become a certified HVAC Engineer with our comprehensive training on Heating, Ventilation, and Air Conditioning systems, covering design and maintenance."
        },
        {
            category: "NDT & Quality Management",
            keywords: ["ndt", "qa", "qc", "quality", "welding", "testing", "iso", "auditor"],
            details: "We offer ASNT Level II training in PT, MPT, UT, RT, VT, and QA/QC roles. This includes ISO Internal Auditor training, piping documentation, and heat treatment procedures."
        },
        {
            category: "Safety Management",
            keywords: ["safety", "fire safety", "industrial safety", "accident prevention"],
            details: "Our Advanced Diploma in Fire & Industrial Safety Management prepares you for critical roles in industrial site supervision and risk management."
        },
        {
            category: "Home Appliance Service",
            keywords: ["home appliance", "fridge", "washing machine", "repair", "service", "maintenance"],
            fee: "₹19,999 (Includes Accommodation & Lunch)",
            details: "A practical course covering the repair and servicing of washing machines, refrigerators, grinders, mixers, fans, and water heaters."
        },
        {
            category: "Industrial Trades",
            keywords: ["welding", "fabrication", "machine operator", "marine mechanic", "carpentry", "masonry"],
            details: "We provide hands-on training for various skilled trades including Welding, Fabrication, Machine Operation, Marine Mechanics, and Civil construction skills like Carpentry and Masonry."
        }
    ],
    placement: {
        keywords: ["placement", "job", "career", "interview", "resume", "guarantee", "assurance"],
        details: "We offer 100% Placement Assurance to all our students. Our services include Resume Building, Mock Interviews, and assistance for both Domestic and Overseas job opportunities."
    },
    consulting: {
        keywords: ["consulting", "corporate", "audit", "manufacturing", "logistics", "industrial design"],
        details: "We provide strategic management consulting, industrial design & layout planning, manufacturing excellence programs, and comprehensive safety/quality audits for industries."
    }
};

interface Message {
    id: number;
    type: "bot" | "user";
    text: string;
    isProactive?: boolean;
}

const ChatbotContent: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            type: "bot",
            text: "Hello! Welcome to N-Skill India 🎓. I'm your AI assistant, trained with our latest course and service information. How can I help you build your career today?",
        },
    ]);
    const [input, setInput] = useState<string>("");
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [buttonTextState, setButtonTextState] = useState<number>(0);
    const [isBlinking, setIsBlinking] = useState<boolean>(true);

    useEffect(() => {
        if (buttonTextState === 0) {
            const timer = setTimeout(() => {
                setButtonTextState(1);
            }, 3000);
            return () => clearTimeout(timer);
        } else if (buttonTextState === 1) {
            const timer = setTimeout(() => {
                setButtonTextState(2);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [buttonTextState]);

    const getButtonText = () => {
        if (buttonTextState === 0) return "Welcome to N-Skill";
        if (buttonTextState === 1) return "How can I help you?";
        return "Looking for a job? 👋";
    };

    // Only allow opening the chatbot if we're on the last message or user overrides it
    const handleButtonClick = () => {
        if (buttonTextState === 2 || isOpen) {
            setIsOpen(!isOpen);
        }
    };

    useEffect(() => {
        if (isOpen) {
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.isProactive) return;

            inactivityTimerRef.current = setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now(),
                        type: "bot",
                        text: "It looks like you've been away for a moment. 🕰️ Would you like to continue our chat, or is there anything else I can assist you with before we conclude this session?",
                        isProactive: true,
                    },
                ]);
            }, 5 * 60 * 1000);
        }
        return () => {
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        };
    }, [messages, isOpen]);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const findBestAnswer = (query: string): string => {
        const lowerQuery = query.toLowerCase();

        // Check Course-related questions
        for (const course of knowledgeBase.courses) {
            if (course.keywords.some(k => lowerQuery.includes(k))) {
                let response = `**${course.category}**\n\n${course.details}`;
                if (course.fee) response += `\n\n💰 **Course Fee:** ${course.fee}`;
                return response;
            }
        }

        // Check Placement
        if (knowledgeBase.placement.keywords.some(k => lowerQuery.includes(k))) {
            return `🚀 **Placement Support**\n\n${knowledgeBase.placement.details}`;
        }

        // Check Consulting
        if (knowledgeBase.consulting.keywords.some(k => lowerQuery.includes(k))) {
            return `🏢 **Industrial Consulting**\n\n${knowledgeBase.consulting.details}`;
        }

        // Check Contact Info
        if (lowerQuery.includes("contact") || lowerQuery.includes("address") || lowerQuery.includes("phone") || lowerQuery.includes("email") || lowerQuery.includes("location") || lowerQuery.includes("where")) {
            return `📍 **Contact Information**\n\n**Address:** ${knowledgeBase.company.location}\n**Phones:** ${knowledgeBase.company.contacts.join(", ")}\n**Email:** ${knowledgeBase.company.email}\n**Hours:** ${knowledgeBase.company.working_hours}`;
        }

        // Check About/Owner Info
        if (lowerQuery.includes("about") || lowerQuery.includes("who are you") || lowerQuery.includes("nskill") || lowerQuery.includes("n-skill") || lowerQuery.includes("company") || lowerQuery.includes("owner") || lowerQuery.includes("ceo") || lowerQuery.includes("founder")) {
            return `✨ **About N-Skill India**\n\n${knowledgeBase.company.overview}\n\n**Our Vision:** ${knowledgeBase.company.vision}\n\n**Key Contact:** You can reach our team at ${knowledgeBase.company.contacts[0]}.`;
        }

        // Generic Fallback
        return "I'm not quite sure about that specific detail, but I can definitely tell you about our **MEP, HVAC, NDT, and Safety courses**, or our **100% placement assurance**. \n\nWhat would you like to know more about?";
    };

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const userMsg: Message = { id: Date.now(), type: "user", text };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            // First check local knowledge for instant answers on company specifics
            const localAnswer = findBestAnswer(text);

            // If the local answer is a fallback (not a direct match), ask the AI
            if (localAnswer.includes("I'm not quite sure")) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: text }),
                });

                if (!response.ok) throw new Error("Backend unreachable");

                const data = await response.json();

                // If it's a mock response (no API key), show the local fallback instead
                if (data.isMock) {
                    setMessages(prev => [...prev, { id: Date.now() + 1, type: "bot", text: localAnswer }]);
                } else {
                    setMessages(prev => [...prev, { id: Date.now() + 1, type: "bot", text: data.response }]);
                }
            } else {
                // Return local answer for known company questions
                setTimeout(() => {
                    setMessages(prev => [...prev, { id: Date.now() + 1, type: "bot", text: localAnswer }]);
                }, 500);
            }
        } catch (error) {
            console.error("Chatbot Fetch Error:", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, type: "bot", text: "I'm having a bit of trouble connecting to my AI core. 🔌 Please check if the backend is running or try asking about our courses!" }]);
        } finally {
            setIsTyping(false);
        }
    };

    interface QuickReplyProps {
        text: string;
        onClick?: () => void;
    }

    const QuickReply: React.FC<QuickReplyProps> = ({ text, onClick }) => (
        <button
            onClick={onClick || (() => handleSend(text))}
            className="text-[11px] bg-white border border-gray-300 px-3 py-1.5 rounded-full hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-md whitespace-nowrap font-semibold text-gray-700"
        >
            {text}
        </button>
    );

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="mb-4 w-[350px] sm:w-[420px] bg-white rounded-[2rem] shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[600px]"
                    >
                        {/* Header */}
                        <div className="bg-[#0b1f3a] p-6 flex items-center justify-between text-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
                                    <Bot size={28} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-none">N-Skill Assistant</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Active Now</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow p-5 overflow-y-auto space-y-4 bg-gray-50">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.type === "bot" ? "justify-start" : "justify-end"} items-end gap-2`}>
                                    {msg.type === "bot" && (
                                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mb-1">
                                            <Bot size={14} className="text-blue-600" />
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] p-4 text-[14px] leading-relaxed shadow-sm ${msg.type === "bot"
                                        ? "bg-white text-gray-800 rounded-2xl rounded-bl-none border border-gray-100"
                                        : "bg-[#0b1f3a] text-white rounded-2xl rounded-br-none"
                                        }`}>
                                        <div className="whitespace-pre-wrap">{msg.text}</div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <div className="w-6 h-6 bg-gray-200 rounded-lg animate-pulse" />
                                    <div className="text-[11px] font-medium italic">Assistant is thinking...</div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-5 bg-white border-t border-gray-100 space-y-4">
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                {messages[messages.length - 1]?.isProactive ? (
                                    <>
                                        <QuickReply text="Yes, close chat" onClick={() => setIsOpen(false)} />
                                        <QuickReply text="No, I'm still here!" onClick={() => handleSend("No, I'm still here!")} />
                                    </>
                                ) : (
                                    <>
                                        <QuickReply text="MEP Course" />
                                        <QuickReply text="HVAC Fee" />
                                        <QuickReply text="Safety Training" />
                                        <QuickReply text="Placement Info" />
                                        <QuickReply text="Contact" />
                                    </>
                                )}
                            </div>
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex gap-3 bg-gray-50 rounded-2xl p-2 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about courses, fees, jobs..."
                                    className="flex-grow bg-transparent border-none px-3 py-2 text-sm focus:ring-0 outline-none placeholder:text-gray-400 text-gray-900"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="bg-[#0b1f3a] text-white p-2.5 rounded-xl disabled:opacity-30 hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/10"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Static Chatbot Trigger Unit */}
            {!isOpen && (
                <div className="flex flex-col items-end gap-2 group">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={buttonTextState}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={handleButtonClick}
                            className="bg-white text-[#0b1f3a] px-5 py-3 rounded-2xl rounded-br-none shadow-xl border border-blue-100 flex items-center gap-3 relative cursor-pointer select-none"
                        >
                            <Sparkles className="text-blue-500 shrink-0" size={18} />
                            <span className="font-bold text-sm tracking-tight whitespace-nowrap">
                                {getButtonText()}
                            </span>
                            <div className="absolute right-0 bottom-[-8px] w-0 h-0 border-l-[12px] border-l-transparent border-t-[12px] border-t-white" />
                        </motion.div>
                    </AnimatePresence>

                    <button
                        onClick={handleButtonClick}
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/50 backdrop-blur-md bg-gradient-to-br from-[#0b1f3a] to-[#2563eb] text-white cursor-pointer relative transition-transform hover:scale-105 active:scale-95"
                    >
                        <div className="relative shrink-0">
                            <Headphones size={28} />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                        </div>
                    </button>
                </div>
            )}

            {/* Back button when open */}
            {isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    onClick={() => setIsOpen(false)}
                    className="w-14 h-14 bg-white text-[#0b1f3a] rounded-full flex items-center justify-center shadow-2xl border-2 border-blue-500 z-[10000]"
                >
                    <X size={24} />
                </motion.button>
            )}
        </div>
    );
};

const Chatbot: React.FC = () => {
    const pathname = usePathname();

    // Switcher logic: Check for restricted routes before rendering the logic-heavy component
    const isRestricted = pathname ? (
        pathname.toLowerCase().startsWith("/dashboard") ||
        pathname.toLowerCase().startsWith("/login") ||
        pathname.toLowerCase().startsWith("/admin")
    ) : false;

    if (isRestricted) return null;

    return <ChatbotContent />;
};

export default Chatbot;
