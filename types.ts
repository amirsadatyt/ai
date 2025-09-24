
import type { Part } from "@google/genai";
import type React from 'react';

export interface ImageFile {
  mimeType: string;
  data: string; // base64 encoded
}

export interface ChatMessage {
  role: "user" | "model";
  parts: Part[];
  renderedContent: React.ReactNode;
}

export interface AttachmentFile {
  file: File;
  name: string;
}
