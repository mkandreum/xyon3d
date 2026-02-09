import { GoogleGenAI } from "@google/genai";

export const generateProductDescription = async (productName: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key not configured. Using generic description.");
    return `High-quality 3D printed ${productName}. Precision manufactured with professional-grade materials for durability and detail.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a compelling, short (2 sentences max) marketing description for a 3D printed product named "${productName}". Focus on quality and durability.`,
    });
    
    return response.text || "High-quality 3D printed part.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Premium 3D printed ${productName} designed for durability and aesthetics.`;
  }
};
