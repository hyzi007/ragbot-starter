"use client";
import { useEffect, useRef, useState } from 'react';
import { useChat, Message } from '@ai-sdk/react';
import { Send, Sparkles, Bot, User, Settings, Moon, Sun } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useConfiguration from './hooks/useConfiguration';
import Configure from '../components/Configure';

const customPrompts = [
  "Jaké další bonusy mohu získat?",
  "Jak si aktivuji bonus za vklad?",
  "Co jsou Zlaťáky?",
  "Co se stane, pokud nestihnu ověřit svou identitu do 30 dní?"
];

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, append, isLoading } = useChat();
  const { useRag, llm, similarityMetric, setConfiguration } = useConfiguration();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [configureOpen, setConfigureOpen] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSubmit(e, { body: { useRag, llm, similarityMetric } });
  };

  const handlePrompt = (promptText: string) => {
    const msg: Message = { 
      id: crypto.randomUUID(), 
      content: promptText, 
      role: 'user' 
    };
    append(msg, { body: { useRag, llm, similarityMetric } });
  };

  const handleSourceClick = (title: string) => {
    const msg: Message = { 
      id: crypto.randomUUID(), 
      content: `Řekni mi více o: ${title}`, 
      role: 'user' 
    };
    append(msg, { body: { useRag, llm, similarityMetric } });
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">NÁPOVĚDA</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Váš AI asistent</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={() => setConfigureOpen(true)}
              className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Container */}
      <main className="pt-20 pb-32 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Ahoj! Jak vám mohu pomoci?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Když něco nevíš, tady se to dozvíš. A pokud ne, těší se na tebe naše podpora.
              </p>
              
              {/* Prompt Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {customPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePrompt(prompt)}
                    className="group relative p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 text-left hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {prompt}
                    </span>
                    <Send className="absolute bottom-3 right-3 w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((message, index) => (
              <MessageBubble 
                key={index} 
                message={message} 
                onSourceClick={handleSourceClick}
              />
            ))}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto p-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Napište svůj dotaz..."
              className="w-full px-6 py-4 pr-14 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            Powered by DataStax Astra DB & OpenAI
          </p>
        </form>
      </div>

      {/* Configure Modal */}
      <Configure
        isOpen={configureOpen}
        onClose={() => setConfigureOpen(false)}
        useRag={useRag}
        llm={llm}
        similarityMetric={similarityMetric}
        setConfiguration={setConfiguration}
      />
    </div>
  );
}

type MessageBubbleProps = {
  message: Message;
  onSourceClick: (title: string) => void;
};

// Message Bubble Component
function MessageBubble({ message, onSourceClick }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  // Parse sources from the message
  const parseMessage = (content: string) => {
    const sourcesMatch = content.match(/===SOURCES===([\s\S]*?)===END_SOURCES===/);
    
    if (!sourcesMatch) {
      return { mainContent: content, sources: [] };
    }

    const mainContent = content.replace(/===SOURCES===[\s\S]*?===END_SOURCES===/, '').trim();
    const sourcesText = sourcesMatch[1];
    
    const sources = sourcesText.split('---').filter(s => s.trim()).map(sourceText => {
      const titleMatch = sourceText.match(/TITLE:\s*(.+)/);
      const urlMatch = sourceText.match(/URL:\s*(.+)/);
      const relevanceMatch = sourceText.match(/RELEVANCE:\s*(.+)/);
      
      return {
        title: titleMatch ? titleMatch[1].trim() : '',
        url: urlMatch ? urlMatch[1].trim() : '',
        relevance: relevanceMatch ? parseFloat(relevanceMatch[1].trim()) : 0
      };
    });

    return { mainContent, sources };
  };

  const { mainContent, sources } = isUser ? { mainContent: message.content, sources: [] } : parseMessage(message.content);

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-gray-200 dark:bg-gray-700' 
          : 'bg-gradient-to-br from-blue-500 to-purple-600'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>
      
      <div className={`max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block px-6 py-3 rounded-2xl ${
          isUser 
            ? 'bg-blue-500 text-white rounded-tr-none' 
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none shadow-sm'
        }`}>
          {isUser ? (
            <p className="text-sm">{message.content}</p>
          ) : (
            <div className="text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose prose-sm dark:prose-invert max-w-none"
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 underline decoration-1 underline-offset-2 transition-colors"
                    >
                      {children}
                    </a>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                      {children}
                    </h3>
                  ),
                  code: ({ className, children, ...props }: any) => (
                    <code 
                      className={`${
                        className?.includes('language-') 
                          ? 'block bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-sm font-mono overflow-x-auto' 
                          : 'bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono'
                      }`} 
                      {...props}
                    >
                      {children}
                    </code>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 space-y-1">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm leading-relaxed">{children}</li>
                  ),
                }}
              >
                {mainContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Sources section */}
        {sources.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2">
              📚 Další zdroje k prozkoumání:
            </p>
            <div className="grid gap-2">
              {sources.map((source, index) => (
                <button
                  key={index}
                  onClick={() => onSourceClick(source.title)}
                  className="group relative p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 text-left hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {source.title}
                    </h4>
                    {source.url && source.url !== 'N/A' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {source.url}
                      </p>
                    )}
                  </div>
                  
                  {/* Circular progress for relevance */}
                  <div className="flex-shrink-0 ml-4">
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 20}`}
                          strokeDashoffset={`${2 * Math.PI * 20 * (1 - source.relevance / 100)}`}
                          className="text-blue-500 transition-all duration-300"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {Math.round(source.relevance)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}