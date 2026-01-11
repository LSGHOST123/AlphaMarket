
import { GoogleGenAI } from "@google/genai";

export interface MarketData {
  open: number;
  close: number;
  high: number;
  low: number;
  volume: string;
  change: string;
  marketCap?: string;
  pe?: string;
}

export const analyzeAsset = async (symbol: string, data: MarketData, language: 'en' | 'pt' | 'es' = 'en'): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let systemInstruction = "You are a senior hedge fund analyst at AlphaMarket. Provide a razor-sharp technical and fundamental outlook.";
    if (language === 'pt') systemInstruction = "Você é um analista sênior de hedge fund no AlphaMarket. Forneça uma análise técnica e fundamentalista ultra-precisa em Português do Brasil.";
    if (language === 'es') systemInstruction = "Eres un analista senior de hedge fund en AlphaMarket. Proporciona un análisis técnico y fundamental preciso en Español.";

    const prompt = `
      ASSET: ${symbol}
      
      TECHNICAL SNAPSHOT:
      - Last Price: ${data.close}
      - Daily Change: ${data.change}
      - Range (H/L): ${data.high} / ${data.low}
      - Volume: ${data.volume}
      - Market Cap: ${data.marketCap || 'N/A'}
      - P/E Ratio: ${data.pe || 'N/A'}

      TASK:
      1. Deliver a Decisive Signal (BUY/SELL/HOLD).
      2. 3 High-impact bullet points on why.
      3. Precise Support and Resistance levels.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text || "Analysis failed to generate.";
  } catch (error) {
    console.error("Gemini Analysis failed:", error);
    return "NEURAL LINK ERROR: Unable to reach Gemini Protocol.";
  }
};

export const analyzeMarketOverview = async (assets: any[], language: 'en' | 'pt' | 'es' = 'en'): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let systemInstruction = "You are a market portfolio manager providing a brief daily snapshot.";
    if (language === 'pt') systemInstruction = "Você é um gestor de portfólio de mercado fornecendo um resumo diário breve.";

    const assetSummary = assets.slice(0, 10).map(a => `${a.symbol} (${a.change}%)`).join(", ");

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these assets and give a summary of the current market sentiment: ${assetSummary}`,
      config: { systemInstruction }
    });

    return response.text || "Market summary unavailable.";
  } catch (error) {
    return "MARKET ANALYSIS OFFLINE.";
  }
};
