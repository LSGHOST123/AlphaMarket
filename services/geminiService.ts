
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

/**
 * Serviço de IA utilizando Pollinations AI (GPT-5.1 NANO Persona)
 */
export const analyzeAsset = async (symbol: string, data: MarketData, language: 'en' | 'pt' | 'es' = 'en'): Promise<string> => {
  try {
    let systemInstruction = "You are a senior hedge fund analyst at AlphaMarket using GPT-5.1 NANO core. Provide a razor-sharp technical and fundamental outlook. DO NOT OUTPUT JSON. DO NOT OUTPUT CODE BLOCKS. RESPOND ONLY WITH PROFESSIONAL HUMAN-READABLE TEXT IN MARKDOWN. No surrounding quotes.";
    if (language === 'pt') systemInstruction = "Você é um analista sênior de hedge fund no AlphaMarket utilizando o núcleo GPT-5.1 NANO. Forneça uma análise técnica e fundamentalista ultra-precisa em Português do Brasil. NÃO RESPONDA EM JSON. NÃO USE BLOCOS DE CÓDIGO. RESPONDA APENAS COM TEXTO PROFISSIONAL EM MARKDOWN. Sem aspas iniciais ou finais.";
    if (language === 'es') systemInstruction = "Eres un analista senior de hedge fund en AlphaMarket utilizando el núcleo GPT-5.1 NANO. Proporciona un análisis técnico y fundamental preciso en Español. NO RESPONDAS EN JSON.";

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

    const encodedPrompt = encodeURIComponent(prompt);
    const encodedSystem = encodeURIComponent(systemInstruction);
    const url = `https://text.pollinations.ai/${encodedPrompt}?system=${encodedSystem}&model=openai&seed=${Math.floor(Math.random() * 1000000)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Pollinations API unreachable");
    
    let text = await response.text();
    
    // Fallback cleanup if the model still outputs JSON wrappers
    try {
      const parsed = JSON.parse(text);
      if (parsed.content) text = parsed.content;
      else if (parsed.choices?.[0]?.message?.content) text = parsed.choices[0].message.content;
      else if (typeof parsed === 'string') text = parsed;
    } catch (e) {
      // Not JSON, good.
    }

    // Secondary cleanup for common AI artifacts
    text = text.replace(/^"|"$/g, '').trim();

    return text || "Analysis failed to generate.";
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "NEURAL LINK ERROR: GPT-5.1 NANO Protocol unreachable. Check your uplink.";
  }
};

export const analyzeMarketOverview = async (assets: any[], language: 'en' | 'pt' | 'es' = 'en'): Promise<string> => {
  try {
    let systemInstruction = "You are a market portfolio manager providing a brief daily snapshot. Plain text only.";
    if (language === 'pt') systemInstruction = "Você é um gestor de portfólio de mercado fornecendo um resumo diário breve. Apenas texto.";

    const assetSummary = assets.slice(0, 10).map(a => `${a.symbol} (${a.change}%)`).join(", ");
    const prompt = `Analyze these assets and give a summary of the current market sentiment: ${assetSummary}`;
    
    const encodedPrompt = encodeURIComponent(prompt);
    const encodedSystem = encodeURIComponent(systemInstruction);
    const url = `https://text.pollinations.ai/${encodedPrompt}?system=${encodedSystem}&model=openai`;

    const response = await fetch(url);
    return await response.text() || "Market summary unavailable.";
  } catch (error) {
    return "MARKET ANALYSIS OFFLINE.";
  }
};
