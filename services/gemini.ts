import { GoogleGenAI } from "@google/genai";

export const generateProductDescription = async (productName: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found. Returning mock description.");
    return `Premium quality 3D printed ${productName}. Manufactured with high precision tolerances using industry-standard materials. Durable, lightweight, and inspected for quality assurance.`;
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
