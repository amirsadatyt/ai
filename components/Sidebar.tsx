
import React, { useRef, useState } from 'react';
import type { ImageFile } from '../types';
import { LogoIcon, ChatIcon, UploadIcon, ApplyIcon, UndoIcon, DownloadIcon, ViewsIcon } from './icons';

interface SidebarProps {
    isImageLoaded: boolean;
    isLoading: boolean;
    canUndo: boolean;
    prompt: string;
    setPrompt: (prompt: string) => void;
    isDraftMode: boolean;
    setDraftMode: (isDraft: boolean) => void;
    brushSize: number;
    setBrushSize: (size: number) => void;
    onImageUpload: (file: File) => void;
    onGenerate: () => void;
    onMagicEdit: (prompt: string) => void;
    onUndo: () => void;
    onDownload: () => void;
    onClearMask: () => void;
    onGenerateMultiView: () => void;
    onToggleChat: () => void;
}

const MagicEditButton: React.FC<{ prompt: string; onClick: (prompt: string) => void; disabled: boolean; children: React.ReactNode }> = ({ prompt, onClick, disabled, children }) => (
    <button
        className="magic-btn text-sm p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        data-prompt={prompt}
        onClick={() => onClick(prompt)}
        disabled={disabled}
    >
        {children}
    </button>
);

export const Sidebar: React.FC<SidebarProps> = ({
    isImageLoaded, isLoading, canUndo, prompt, setPrompt, isDraftMode, setDraftMode, brushSize, setBrushSize,
    onImageUpload, onGenerate, onMagicEdit, onUndo, onDownload, onClearMask, onGenerateMultiView, onToggleChat
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageUpload(e.dataTransfer.files[0]);
        }
    };
    
    const magicEdits = [
        { label: 'Enhance', prompt: 'Subtly enhance the lighting, color saturation, and sharpness.' },
        { label: 'Remove BG', prompt: 'Professionally remove the background, leaving a transparent background.' },
        { label: 'Cinematic', prompt: 'Apply a cinematic color grade.' },
        { label: 'B & W', prompt: 'Convert to a moody black and white.' },
        { label: 'Vintage', prompt: 'Give a warm, vintage look with faded colors.' },
        { label: 'Restore', prompt: 'Restore old photo: remove scratches, fix colors, and improve quality.' },
    ];

    return (
        <aside className="w-full md:w-80 lg:w-96 bg-surface/50 border-r border-border flex flex-col p-4 space-y-4">
            <header className="flex items-center justify-between gap-3 pb-4 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-3">
                    <LogoIcon />
                    <div>
                        <h1 className="text-xl font-bold text-text-primary">AI Magic Editor</h1>
                        <p className="text-sm text-text-secondary">Next-Gen Creative Editing</p>
                    </div>
                </div>
                <button onClick={onToggleChat} className="p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary" title="Toggle AI Chat">
                    <ChatIcon />
                </button>
            </header>

            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-6">
                <section>
                    <label className="text-sm font-medium text-text-secondary flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-primary text-gray-900 rounded-full flex items-center justify-center font-bold">1</span>
                        Upload Image
                    </label>
                    <div
                        onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer transition-colors bg-background/50 ${isDragging ? 'border-primary' : 'border-border hover:border-primary'}`}
                    >
                        <input type="file" ref={fileInputRef} onChange={e => e.target.files && onImageUpload(e.target.files[0])} className="hidden" accept="image/png, image/jpeg, image/webp" />
                        <div className="flex flex-col items-center text-text-secondary pointer-events-none">
                            <UploadIcon />
                            <p className="text-sm">Click or drag to upload</p>
                            <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <label htmlFor="prompt" className="text-sm font-medium text-text-secondary flex items-center gap-2">
                        <span className="w-6 h-6 bg-primary text-gray-900 rounded-full flex items-center justify-center font-bold">2</span>
                        Describe Your Edit
                    </label>
                    <textarea id="prompt" rows={3} value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="e.g., 'Make the sky dramatic' or 'Change the car to red'"></textarea>
                    
                    <div className="flex items-center justify-between text-sm">
                        <label htmlFor="draft-mode-toggle" className="text-text-secondary cursor-pointer">Fast Draft Mode:</label>
                        <button id="draft-mode-toggle" onClick={() => setDraftMode(!isDraftMode)} className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out cursor-pointer" style={{backgroundColor: isDraftMode ? 'var(--primary)' : '#4b5563'}} role="switch" aria-checked={isDraftMode}>
                            <span className="inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out" style={{transform: `translateX(${isDraftMode ? '1.25rem' : '0.25rem'})`}}></span>
                        </button>
                    </div>

                    <button onClick={onGenerate} disabled={!prompt.trim() || isLoading} className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed w-full bg-yellow-400 text-gray-900 hover:bg-yellow-300 focus:ring-yellow-400">
                        <ApplyIcon /> Apply Edit
                    </button>
                </section>
                
                {isImageLoaded && (
                    <>
                        <section className="space-y-3">
                            <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                                <span className="w-6 h-6 bg-primary text-gray-900 rounded-full flex items-center justify-center font-bold">3</span>
                                Masking (Optional)
                            </label>
                            <p className="text-xs text-text-secondary -mt-2">Draw on the image to edit a specific area.</p>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-text-secondary flex-shrink-0">Brush Size:</span>
                                <input type="range" id="brush-size" min="5" max="100" value={brushSize} onChange={e => setBrushSize(parseInt(e.target.value))} className="w-full"/>
                            </div>
                            <button onClick={onClearMask} className="w-full text-xs px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed bg-gray-800 text-gray-50 hover:bg-gray-700 focus:ring-gray-500 border border-gray-700">Clear Mask</button>
                        </section>

                        <section className="space-y-3">
                            <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                                <span className="w-6 h-6 bg-primary text-gray-900 rounded-full flex items-center justify-center font-bold">4</span>
                                Magic Edits (1-Click)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {magicEdits.map(edit => <MagicEditButton key={edit.label} prompt={edit.prompt} onClick={onMagicEdit} disabled={!isImageLoaded || isLoading}>{edit.label}</MagicEditButton>)}
                            </div>
                        </section>

                        <section className="space-y-3">
                             <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                                <span className="w-6 h-6 bg-primary text-gray-900 rounded-full flex items-center justify-center font-bold">5</span>
                                Multi-View Generation
                            </label>
                            <p className="text-xs text-text-secondary -mt-2">Create four images from different professional angles of your object/subject.</p>
                            <button onClick={onGenerateMultiView} disabled={!isImageLoaded || isLoading} className="w-full px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background bg-yellow-400 text-gray-900 hover:bg-yellow-300 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed">
                                <ViewsIcon/> Generate 4 Views
                            </button>
                        </section>
                    </>
                )}
            </div>

            <footer className="pt-4 border-t border-border flex-shrink-0 flex items-center gap-2">
                 <button onClick={onUndo} disabled={!canUndo || isLoading} className="w-full px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed bg-gray-800 text-gray-50 hover:bg-gray-700 focus:ring-gray-500 border border-gray-700">
                    <UndoIcon /> Undo
                </button>
                <button onClick={onDownload} disabled={!isImageLoaded || isLoading} className="w-full px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed bg-gray-800 text-gray-50 hover:bg-gray-700 focus:ring-gray-500 border border-gray-700">
                    <DownloadIcon /> Download
                </button>
            </footer>
        </aside>
    );
};
