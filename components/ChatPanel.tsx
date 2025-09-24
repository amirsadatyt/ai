
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, AttachmentFile } from '../types';
import { ChatAIIcon, NewChatIcon, CloseIcon, FullscreenEnterIcon, FullscreenExitIcon, AttachmentIcon, SendIcon, RemoveIcon, FileIcon, CopyIcon, DownloadIcon, RunIcon, ChatUserIcon } from './icons';

interface CodeBlockProps {
    language: string;
    code: string;
    onRunCode: (code: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, onRunCode }) => {
    const [copied, setCopied] = useState(false);
    const isHtml = language.toLowerCase() === 'html';

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code-snippet-${Date.now()}.${language === 'code' ? 'txt' : language}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="my-2">
            <div className="code-block-header">
                <span>{language || 'code'}</span>
                <div className="code-block-buttons">
                    {isHtml && <button className="code-btn" title="Run HTML" onClick={() => onRunCode(code)}><RunIcon /><span className="hidden sm:inline">Run</span></button>}
                    <button className="code-btn" title="Download snippet" onClick={handleDownload}><DownloadIcon className="w-4 h-4" /><span className="hidden sm:inline">Download</span></button>
                    <button className="code-btn" title="Copy code" onClick={handleCopy}><CopyIcon /><span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span></button>
                </div>
            </div>
            <pre className="rounded-b-lg rounded-t-none mt-0"><code className={`language-${language}`}>{code}</code></pre>
        </div>
    );
};

interface ChatPanelProps {
    isOpen: boolean;
    isMaximized: boolean;
    messages: ChatMessage[];
    isThinking: boolean;
    attachment: AttachmentFile | null;
    onClose: () => void;
    onToggleSize: () => void;
    onNewChat: () => void;
    onSubmit: (message: string, attachment?: File) => void;
    onAttachmentChange: (file: File | null) => void;
    onRunCode: (code: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, isMaximized, messages, isThinking, attachment, onClose, onToggleSize, onNewChat, onSubmit, onAttachmentChange, onRunCode }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isThinking]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() || attachment) {
            onSubmit(input, attachment?.file);
            setInput('');
            onAttachmentChange(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onAttachmentChange(e.target.files[0]);
        }
    };

    return (
        <div className={`absolute top-0 right-0 h-full w-full md:w-[400px] lg:w-[450px] min-w-[300px] max-w-[100vw] bg-gray-900 border-l border-border shadow-2xl flex flex-col z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${isMaximized ? 'chat-maximized' : ''}`}>
            <header className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-3">
                    <ChatAIIcon />
                    <div>
                        <h2 className="text-lg font-bold text-text-primary">Gemini Assistant</h2>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onNewChat} className="p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary" title="New Chat"><NewChatIcon /></button>
                    <button onClick={onToggleSize} className="p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary" title="Toggle Chat Size">
                        {isMaximized ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
                    </button>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary" title="Close Chat"><CloseIcon /></button>
                </div>
            </header>

            <div className="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message flex gap-3 ${msg.role === 'user' ? 'user justify-end' : 'ai'}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-surface flex-shrink-0 flex items-center justify-center"><ChatAIIcon className="w-5 h-5"/></div>}
                        <div className={`${msg.role === 'user' ? 'order-2' : ''}`}>
                             <p className={`font-semibold text-sm mb-1 ${msg.role === 'user' ? 'text-gray-400 text-right' : 'text-primary'}`}>{msg.role === 'user' ? 'You' : 'AI Assistant'}</p>
                            <div className="chat-bubble inline-block p-3 rounded-lg text-text-primary">
                                {typeof msg.renderedContent === 'string' ? <p dangerouslySetInnerHTML={{__html: msg.renderedContent}} /> : msg.renderedContent}
                            </div>
                        </div>
                        {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-surface flex-shrink-0 flex items-center justify-center order-1"><ChatUserIcon/></div>}
                    </div>
                ))}
                {isThinking && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface flex-shrink-0"></div>
                        <div className="p-3 rounded-lg bg-surface">
                            <div className="typing-indicator"><span></span><span></span><span></span></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <footer className="p-4 border-t border-border flex-shrink-0">
                {attachment && (
                    <div className="flex items-center justify-between bg-surface p-2 rounded-md mb-2 text-sm">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <FileIcon />
                            <span className="truncate text-text-secondary">{attachment.name}</span>
                        </div>
                        <button onClick={() => onAttachmentChange(null)} className="p-1 rounded-full text-text-secondary hover:bg-gray-600" title="Remove Attachment"><RemoveIcon /></button>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*, .txt, .html, .pdf, .js, .py, .css" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full text-text-secondary hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary" title="Attach File"><AttachmentIcon /></button>
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} className="flex-grow bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-text-primary placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Type a message..." autoComplete="off"/>
                    <button type="submit" disabled={(!input.trim() && !attachment) || isThinking} className="p-2 rounded-full bg-primary text-gray-900 hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" title="Send Message"><SendIcon /></button>
                </form>
            </footer>
        </div>
    );
};
