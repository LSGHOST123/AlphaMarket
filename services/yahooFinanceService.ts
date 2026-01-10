
export interface MarketData {
  price: number;
  change: number | null; // Allow null to represent missing data
  changePercent: number | null;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  range52w: string;
  rangeDay: string;
  currency: string;
  symbol: string;
  longName: string;
  marketCap?: number;
}

const YAHOO_CHART_API = "https://query1.finance.yahoo.com/v8/finance/chart";

const translateToYahoo = (symbol: string): string => {
  let s = symbol.toUpperCase().trim();
  if (s.includes(':')) s = s.split(':')[1];

  // B3 - Regex atualizado
  if (/^[A-Z0-9]{4}(3|4|5|6|11)$/.test(s) && !s.includes('.SA')) return `${s}.SA`;
  
  // Indices
  if (s === 'IBOV' || s === 'BVSP') return '^BVSP';
  if (s === 'SPX') return '^GSPC';
  
  // Crypto & Forex
  if (!s.includes('-') && (s.endsWith('USD') || s.endsWith('USDT'))) {
      const base = s.replace('USDT', '').replace('USD', '');
      if (base.length >= 3 && base !== 'USDBRL' && base !== 'EUR') return `${base}-USD`;
  }
  
  if (s === 'USDBRL') return 'BRL=X';
  if (s === 'EURUSD') return 'EURUSD=X';

  return s;
};

/**
 * FETCH ROBUSTO COM ROTAÇÃO DE PROXY E RETRIES
 */
const fetchRawData = async (yahooSymbol: string) => {
  // Lista de proxies para rotação (Failover Strategy)
  const proxies = [
    // Proxy 1: AllOrigins (Estável)
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    // Proxy 2: CorsProxy (Rápido)
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    // Proxy 3: ThingProxy (Fallback)
    (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`
  ];

  const maxRetries = 6; // Increased retries due to unstable public proxies
  const cacheBuster = Math.floor(Date.now() / 1000); // Cache buster por segundo
  
  // Params: includePrePost=false para garantir dados do pregão regular
  const targetUrl = `${YAHOO_CHART_API}/${yahooSymbol}?interval=1d&range=5d&includePrePost=false&_t=${cacheBuster}`;

  for (let i = 0; i < maxRetries; i++) {
    const proxyFn = proxies[i % proxies.length];
    const proxyUrl = proxyFn(targetUrl);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      
      // Validação de estrutura do Yahoo
      if (data?.chart?.result?.[0]?.meta) {
        return data;
      }
      
      // Se retornou JSON mas sem os dados esperados (ex: erro do Yahoo encapsulado)
      if (data?.chart?.error) {
         console.warn(`Yahoo API Error for ${yahooSymbol}:`, data.chart.error);
         throw new Error("Yahoo API Error");
      }

      throw new Error("Empty Data Structure");

    } catch (e) {
      if (i === maxRetries - 1) {
        console.warn(`[AlphaMarket] Exhausted strategies for ${yahooSymbol}`);
        return null;
      }
      // Backoff exponencial
      await new Promise(r => setTimeout(r, 300 * Math.pow(1.5, i)));
    }
  }
  return null;
};

export const fetchYahooData = async (symbol: string): Promise<MarketData | null> => {
  const yahooSymbol = translateToYahoo(symbol);
  const data = await fetchRawData(yahooSymbol);
  
  const result = data?.chart?.result?.[0];
  if (!result || !result.meta) return null;

  return normalizeV8Data(result, symbol);
};

export const fetchYahooQuotesBatch = async (symbols: string[]): Promise<Record<string, Partial<MarketData>>> => {
  const promises = symbols.map(async (s) => {
      // Pequeno delay aleatório para evitar rate limit dos proxies públicos
      await new Promise(r => setTimeout(r, Math.random() * 1000));
      const data = await fetchYahooData(s);
      return { symbol: s, data };
  });

  const results = await Promise.all(promises);
  const dataMap: Record<string, Partial<MarketData>> = {};
  results.forEach(r => {
      if (r.data) dataMap[r.symbol] = r.data;
  });
  return dataMap;
};

/**
 * NORMALIZADOR AVANÇADO (CANDLE-BASED CALCULATION)
 */
const normalizeV8Data = (result: any, requestSymbol: string): MarketData => {
    const meta = result.meta;
    const quotes = result.indicators?.quote?.[0] || {};
    const timestamps = result.timestamp || [];
    
    // Preparar candles válidos (Time + Close)
    const validCandles = timestamps.map((t: number, i: number) => ({
        time: t,
        close: quotes.close?.[i]
    })).filter((c: any) => c.close !== null && c.close !== undefined && typeof c.close === 'number');

    // 1. Definição do Preço Atual
    // Prioridade: meta.regularMarketPrice (Live). Fallback: Último candle.
    let currentPrice = meta.regularMarketPrice;
    if ((!currentPrice || currentPrice === 0) && validCandles.length > 0) {
        currentPrice = validCandles[validCandles.length - 1].close;
    }
    currentPrice = currentPrice || 0;

    // 2. Definição do Fechamento Anterior (Base de Cálculo)
    // Lógica: Comparar DATA do último candle com DATA do preço atual.
    // Se forem o mesmo dia => PrevClose é o candle ANTERIOR ao último.
    // Se forem dias diferentes (ex: último candle é ontem) => PrevClose é o ÚLTIMO candle.
    
    let prevClose = meta.previousClose; // Valor padrão do meta

    if (validCandles.length > 0) {
         const lastCandle = validCandles[validCandles.length - 1];
         
         const isSameDay = (t1: number, t2: number) => {
             // Usar UTC para evitar problemas de fuso horário local
             const d1 = new Date(t1 * 1000);
             const d2 = new Date(t2 * 1000);
             return d1.getUTCFullYear() === d2.getUTCFullYear() &&
                    d1.getUTCMonth() === d2.getUTCMonth() &&
                    d1.getUTCDate() === d2.getUTCDate();
         };

         // Se meta.regularMarketTime não existir, usamos Agora.
         const marketTime = meta.regularMarketTime || Math.floor(Date.now() / 1000);
         
         if (isSameDay(lastCandle.time, marketTime)) {
             // O último candle do gráfico É de hoje.
             // Então o fechamento anterior é o penúltimo candle.
             if (validCandles.length >= 2) {
                 prevClose = validCandles[validCandles.length - 2].close;
             }
         } else {
             // O último candle do gráfico NÃO é de hoje (é de ontem ou antes).
             // Então o fechamento anterior É o último candle.
             // (O preço atual é 'live' e ainda não formou candle no gráfico)
             prevClose = lastCandle.close;
         }
    }

    // Safety check final
    if (!prevClose || prevClose === 0) {
        prevClose = currentPrice; 
    }

    // 3. Cálculo da Variação (Price - PrevClose)
    let change = currentPrice - prevClose;
    let changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

    // Se os preços forem idênticos ou zerados, zera a variação
    if (Math.abs(change) < 0.00001) {
        change = 0;
        changePercent = 0;
    }

    // 4. Moeda e Símbolo
    let currency = meta.currency || 'USD';
    if (meta.symbol.endsWith('.SA') || meta.symbol === 'BRL=X') currency = 'BRL';

    // 5. Ranges
    const week52High = meta.fiftyTwoWeekHigh;
    const week52Low = meta.fiftyTwoWeekLow;
    const range52w = (week52Low && week52High) 
        ? `${formatNumber(week52Low)} - ${formatNumber(week52High)}`
        : '---';

    const dayHigh = meta.regularMarketDayHigh;
    const dayLow = meta.regularMarketDayLow;
    const rangeDay = (dayLow && dayHigh)
        ? `${formatNumber(dayLow)} - ${formatNumber(dayHigh)}`
        : '---';

    return {
        symbol: meta.symbol,
        longName: meta.longName || meta.shortName || requestSymbol,
        currency: currency,
        
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        prevClose: prevClose,
        open: meta.regularMarketOpen || meta.regularMarketPrice, 
        
        high: dayHigh || currentPrice,
        low: dayLow || currentPrice,
        volume: meta.regularMarketVolume || 0,
        
        range52w: range52w,
        rangeDay: rangeDay,
        
        marketCap: undefined
    };
};

export const formatMoney = (val: number | undefined, currency: string) => {
  if (val === undefined || val === null) return '---';
  const prefix = (currency === 'BRL' || currency === 'R$') ? 'R$' : (currency === 'USD' ? '$' : currency);
  return `${prefix} ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatNumber = (val: number | undefined | null, precision = 2) => {
  if (val === undefined || val === null) return '---';
  return val.toLocaleString('pt-BR', { minimumFractionDigits: precision, maximumFractionDigits: precision });
};

export const formatCompact = (val: number | undefined, currency?: string) => {
  if (val === undefined || val === null || val === 0) return '---';
  const formatted = new Intl.NumberFormat('pt-BR', { 
      notation: "compact", 
      maximumFractionDigits: 2,
      compactDisplay: "short" 
  }).format(val);
  return currency ? `${currency === 'BRL' ? 'R$' : '$'} ${formatted}` : formatted;
};
