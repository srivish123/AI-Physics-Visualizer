
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

export const parsePhysicsProblem = async (prompt: string): Promise<AIResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze this physics scenario: "${prompt}". 
    
    1. EXTRACT:
       - Initial velocity (m/s)
       - Launch angle (degrees). If "horizontal fire" or "rolls off", use 0.
       - Local gravity (m/s²). Default 9.81.
       - Object mass (kg). Default 1.0.
       - Initial Height / Tower Height / Cliff Height (meters). Default 0.
       
    2. DERIVATION REPORT:
       Provide a rigorous, step-by-step breakdown. Use plain text.
       - Account for the starting height in the Y-displacement equation.
       - Show time of flight calculation using the quadratic formula if y0 > 0.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          parameters: {
            type: Type.OBJECT,
            properties: {
              velocity: { type: Type.NUMBER },
              angle: { type: Type.NUMBER },
              gravity: { type: Type.NUMBER },
              mass: { type: Type.NUMBER },
              initialHeight: { type: Type.NUMBER },
            },
            required: ['velocity', 'angle', 'gravity', 'mass', 'initialHeight'],
          },
          derivationSummary: { type: Type.STRING },
        },
        required: ['parameters', 'derivationSummary'],
      },
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI parse failure:", error);
    throw new Error("Invalid physics logic");
  }
};
