
import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { ImageFile } from '../types';
import { PlaceholderIcon, FullscreenEnterIcon, FullscreenExitIcon } from './icons';

interface ImageCanvasProps {
    currentImage: ImageFile | null;
    originalImage: ImageFile | null;
    onMaskChange: (maskDataUrl: string | null) => void;
    brushSize: number;
    onClearMask: () => void;
    isMaskCanvasVisible: boolean;
}

export const ImageCanvas: React.FC<ImageCanvasProps> = ({ currentImage, originalImage, onMaskChange, brushSize, onClearMask, isMaskCanvasVisible }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [isComparing, setIsComparing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

    const updateFullscreenState = () => setIsFullscreen(!!document.fullscreenElement);
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };
    
    const resizeCanvas = useCallback(() => {
        const image = imageRef.current;
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (image && canvas && container) {
            const imageRect = image.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            canvas.width = imageRect.width;
            canvas.height = imageRect.height;
            canvas.style.top = `${imageRect.top - containerRect.top}px`;
            canvas.style.left = `${imageRect.left - containerRect.left}px`;
        }
    }, []);
    
    useEffect(() => {
        document.addEventListener('fullscreenchange', updateFullscreenState);
        window.addEventListener('resize', resizeCanvas);
        
        return () => {
            document.removeEventListener('fullscreenchange', updateFullscreenState);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [resizeCanvas]);

    useEffect(() => {
        if (currentImage) {
            // Delay resize to allow image to render and get correct dimensions
            setTimeout(resizeCanvas, 50);
        }
    }, [currentImage, resizeCanvas]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        onMaskChange(null);
    }, [onClearMask, onMaskChange]);

    const getCoords = (e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
        if (clientX === undefined || clientY === undefined) return null;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const coords = getCoords(e.nativeEvent);
        if (!coords) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            setIsDrawing(true);
            ctx.lineWidth = brushSize;
            ctx.strokeStyle = 'rgba(255, 0, 150, 0.7)';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(coords.x, coords.y);
        }
    };
    
    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault();
        const coords = getCoords(e.nativeEvent);
        if (!coords) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
        }
    };
    
    const stopDrawing = () => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if(ctx) ctx.closePath();
        setIsDrawing(false);
        const hasDrawing = ctx?.getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 0);
        onMaskChange(hasDrawing ? canvas.toDataURL('image/png') : null);
    };

    const displaySrc = isComparing && originalImage ? `data:${originalImage.mimeType};base64,${originalImage.data}`
        : currentImage ? `data:${currentImage.mimeType};base64,${currentImage.data}`
        : '';

    return (
        <main className="flex-1 bg-background flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
            <div ref={containerRef} className="w-full h-full flex items-center justify-center relative">
                {!currentImage && (
                    <div className="text-center text-text-secondary">
                        <PlaceholderIcon />
                        <h2 className="mt-4 text-xl font-medium text-text-primary">Your Image Appears Here</h2>
                        <p>Upload an image to start editing.</p>
                    </div>
                )}
                {currentImage && (
                    <img
                        ref={imageRef}
                        src={displaySrc}
                        onLoad={resizeCanvas}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />
                )}
                <canvas
                    ref={canvasRef}
                    className="absolute cursor-crosshair touch-action-none z-10 pointer-events-auto"
                    style={{ display: isMaskCanvasVisible ? 'block' : 'none' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    {originalImage && currentImage !== originalImage && (
                        <button
                            onMouseDown={() => setIsComparing(true)}
                            onMouseUp={() => setIsComparing(false)}
                            onMouseLeave={() => setIsComparing(false)}
                            onTouchStart={() => setIsComparing(true)}
                            onTouchEnd={() => setIsComparing(false)}
                            className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background border border-gray-700 text-gray-50 hover:bg-gray-700 focus:ring-gray-500"
                        >
                            Hold to Compare
                        </button>
                    )}
                    <button onClick={toggleFullscreen} className="bg-black/50 backdrop-blur-sm p-2 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background border border-gray-700 text-gray-50 hover:bg-gray-700 focus:ring-gray-500" title="Toggle Fullscreen">
                        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
                    </button>
                </div>
            </div>
        </main>
    );
};
