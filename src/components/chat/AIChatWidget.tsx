"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  MinusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Create a transport for the chat API
const chatTransport = new TextStreamChatTransport({
  api: "/api/chat",
});

// Helper to extract text content from message parts
function getMessageContent(parts: any[]): string {
  return parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [input, setInput] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: chatTransport,
    messages: [
      {
        id: "welcome",
        role: "assistant" as const,
        parts: [
          {
            type: "text" as const,
            text: "Hi there! 👋 I'm ClearQ's AI Co-Pilot. I can help you navigate our feature suite or act as your IT advisor for troubleshooting complex support tickets. How can I assist you today?",
          },
        ],
      },
    ],
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput("");
    await sendMessage({ text: userMessage });
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-shadow"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500 items-center justify-center">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "auto" : "600px",
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-600 to-cyan-600">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-teal-600 rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">ClearQ AI</h3>
                  <p className="text-xs text-white/70">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <MinusCircle className="h-5 w-5 text-white/80" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5 text-white/80" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        (message.role as string) === "user" && "flex-row-reverse"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          (message.role as string) === "assistant"
                            ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                            : "bg-zinc-700"
                        )}
                      >
                        {(message.role as string) === "assistant" ? (
                          <Bot className="h-4 w-4 text-white" />
                        ) : (
                          <User className="h-4 w-4 text-zinc-300" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2.5",
                          (message.role as string) === "assistant"
                            ? "bg-zinc-800 text-zinc-200"
                            : "bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {getMessageContent(message.parts)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-zinc-800 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                          <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                          <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-center">
                      <p className="text-rose-400 text-sm">
                        Something went wrong. Please try again.
                      </p>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything..."
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-teal-500 transition-colors"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-teal-500/25 transition-all"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600 text-center mt-2">
                    Powered by AI • May make mistakes
                  </p>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
