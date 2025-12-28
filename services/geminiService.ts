
import { GoogleGenAI, Type } from "@google/genai";
import { JobType, SafetyAnalysis } from "../types";
import { ANALYSIS_SYSTEM_INSTRUCTION, JOB_REQUIREMENTS } from "../constants";

export const analyzeSafety = async (base64Image: string, jobType: JobType): Promise<SafetyAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    DETERMINAÇÃO TÉCNICA:
    Atue como Perito de Segurança do Trabalho. Analise esta imagem sob a ótica da NR-01, NR-06 e a específica ${jobType}.
    
    REQUISITOS DO LAUDO:
    1. Identifique o trabalhador e mapeie os EPIs com coordenadas [ymin, xmin, ymax, xmax].
    2. Cite explicitamente itens e alíneas das NRs.
    3. Avalie o estado de conservação aparente.
    4. Gere recomendações baseadas na hierarquia de controle de riscos.
    
    CONDIÇÕES DE TRABALHO PARA ${jobType}: ${JOB_REQUIREMENTS[jobType]}.
  `;

  const imagePart = {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64Image.split(",")[1],
    },
  };

  const textPart = { text: prompt };

  try {
    // Correct usage of generateContent with contents object according to guidelines
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            workerDetected: { type: Type.BOOLEAN },
            jobContext: { type: Type.STRING },
            identifiedPPE: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  status: { type: Type.STRING },
                  observation: { type: Type.STRING },
                  location: {
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER }
                  }
                },
                required: ["name", "status", "observation", "location"]
              }
            },
            missingCriticalPPE: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            complianceScore: { type: Type.NUMBER },
            relevantNRs: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            finalVerdict: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["workerDetected", "jobContext", "identifiedPPE", "missingCriticalPPE", "complianceScore", "relevantNRs", "finalVerdict", "recommendations"]
        }
      },
    });

    // Access .text property directly (not as a method)
    const text = response.text;
    if (!text) throw new Error("Resposta vazia da IA.");
    return JSON.parse(text) as SafetyAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Falha na análise técnica. Verifique se a imagem está clara e focada no trabalhador.");
  }
};
