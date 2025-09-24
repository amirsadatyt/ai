
import { GoogleGenAI, Modality, Chat, GenerateContentResponse, Part } from "@google/genai";
import type { ImageFile } from '../types';

const DRAFT_SIZE = 1024;

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const imageEditModel = 'gemini-2.5-flash-image-preview';
const chatModel = 'gemini-2.5-flash';

const fileToGeminiPart = async (file: File): Promise<Part> => {
    const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
    return { inlineData: { mimeType: file.type, data: base64 } };
};

const resizeImage = (image: ImageFile, maxSize: number): Promise<ImageFile> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            let { width, height } = img;
            if (Math.max(width, height) <= maxSize) return resolve(image);
            if (width > height) {
                height = Math.round(height * (maxSize / width));
                width = maxSize;
            } else {
                width = Math.round(width * (maxSize / height));
                height = maxSize;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
            const resizedBase64 = canvas.toDataURL(image.mimeType).split(',')[1];
            resolve({ mimeType: image.mimeType, data: resizedBase64 });
        };
        img.onerror = reject;
        img.src = `data:${image.mimeType};base64,${image.data}`;
    });
};

export const editImage = async (prompt: string, image: ImageFile, maskDataUrl?: string, isDraftMode?: boolean): Promise<ImageFile> => {
    const imageToSend = isDraftMode ? await resizeImage(image, DRAFT_SIZE) : image;
    const parts: Part[] = [
        { text: prompt },
        { inlineData: { mimeType: imageToSend.mimeType, data: imageToSend.data } }
    ];

    if (maskDataUrl) {
        parts.push({ text: "Apply the edit only to the masked (drawn-on) area." });
        parts.push({ inlineData: { mimeType: 'image/png', data: maskDataUrl.split(',')[1] } });
    }

    const response = await ai.models.generateContent({
        model: imageEditModel,
        contents: [{ parts }],
        config: { responseModalities: [Modality.IMAGE] }
    });

    const resultPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!resultPart?.inlineData?.data) throw new Error("The AI couldn't apply this edit. Please try a different prompt or image.");

    return { mimeType: resultPart.inlineData.mimeType, data: resultPart.inlineData.data };
};

export const generateMultiView = async (prompt: string, image: ImageFile): Promise<ImageFile[]> => {
    const fullPrompt = `Based on the attached image, generate four professional images of ${prompt || "the subject"} from different angles: front view, side view, rear view, and overhead view. Ensure the subject and style are consistent across all images.`;
    const response = await ai.models.generateContent({
        model: imageEditModel,
        contents: [{
            parts: [
                { text: fullPrompt },
                { inlineData: { mimeType: image.mimeType, data: image.data } }
            ]
        }],
        config: { responseModalities: [Modality.IMAGE] }
    });

    const generatedImages = response.candidates?.[0]?.content?.parts
        ?.filter(p => p.inlineData)
        .map(p => ({ mimeType: p.inlineData!.mimeType, data: p.inlineData!.data })) || [];

    if (generatedImages.length === 0) throw new Error("Failed to generate views. Please try again.");
    return generatedImages;
};

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: chatModel,
    config: {
        systemInstruction: "You are a helpful and creative AI assistant specializing in photo editing, design, and web development. Provide concise, helpful, and well-formatted answers.",
    },
  });
};

export const sendChatMessage = async (chat: Chat, message: string, attachment?: File): Promise<GenerateContentResponse> => {
    const parts: Part[] = [{ text: message }];
    if (attachment) {
        const filePart = await fileToGeminiPart(attachment);
        parts.push(filePart);
    }
    return chat.sendMessageStream({ message: parts });
};
