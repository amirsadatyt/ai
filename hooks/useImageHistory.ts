
import { useState, useCallback } from 'react';
import type { ImageFile } from '../types';

export const useImageHistory = (initialImage?: ImageFile | null) => {
    const [history, setHistory] = useState<ImageFile[]>(initialImage ? [initialImage] : []);
    const [currentIndex, setCurrentIndex] = useState<number>(initialImage ? 0 : -1);

    const currentImage = history[currentIndex];
    const originalImage = history[0];
    const canUndo = currentIndex > 0;
    const isImageLoaded = history.length > 0;

    const push = useCallback((image: ImageFile) => {
        setHistory(prev => [...prev.slice(0, currentIndex + 1), image]);
        setCurrentIndex(prev => prev + 1);
    }, [currentIndex]);

    const undo = useCallback(() => {
        if (canUndo) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [canUndo]);

    const reset = useCallback((image: ImageFile) => {
        setHistory([image]);
        setCurrentIndex(0);
    }, []);
    
    return { currentImage, originalImage, canUndo, isImageLoaded, push, undo, reset };
};
