
export const SUPABASE_URL = "https://tnxtwesudkpgqzdrminu.supabase.co";
export const SUPABASE_KEY = "sb_publishable_jjv05vRmpbrssp-O_CuBmQ_gx1gqRQP";
export const APP_ID = "ALPHA_MARKET_V1";

export interface StockSymbol {
  symbol: string;
  name: string;
  type: string;
  price?: string;
  change?: string;
  logoUrl?: string;
}

export const getLogo = (symbol: string) => {
  let cleanTicker = symbol;
  if (symbol.includes(':')) {
    cleanTicker = symbol.split(':')[1];
  }
  
  cleanTicker = cleanTicker.replace('.SA', '').toUpperCase();

  const logoMap: Record<string, string> = {
    'BTC': 'bitcoin',
    'BTC-USD': 'bitcoin',
    'BTCUSD': 'bitcoin',
    'ETH': 'ethereum',
    'ETH-USD': 'ethereum',
    'ETHUSD': 'ethereum',
    'SOL': 'solana',
    'SOL-USD': 'solana',
    'SOLUSD': 'solana',
    'USDBRL': 'country/US',
    'EURUSD': 'country/EU',
    'SPX': 's-and-p-500',
    'IBOV': 'country/BR',
    'BVSP': 'country/BR',
    '^BVSP': 'country/BR',
    'IBOV11': 'brazil-bovespa--ibov11',
    // Mapeamento Explícito B3 (Slugs do TradingView)
    'VALE3': 'vale',
    'PETR4': 'petroleo-brasileiro',
    'PETR3': 'petroleo-brasileiro',
    'ITUB4': 'itau-unibanco',
    'BBDC4': 'banco-bradesco',
    'BBAS3': 'banco-do-brasil',
    'MGLU3': 'magazine-luiza',
    'WEGE3': 'weg',
    'ABEV3': 'ambev',
    'JBSS3': 'jbs',
    'SUZB3': 'suzano',
    'GGBR4': 'gerdau',
    'RENT3': 'localiza',
    'LREN3': 'lojas-renner',
    'B3SA3': 'b3',
    'PRIO3': 'prio',
    'CSNA3': 'siderurgica-nacional',
    'RDOR3': 'rede-dor-sao-luiz',
    'RAIL3': 'rumo',
    'ELET3': 'eletrobras',
    'EQTL3': 'equatorial-energia',
    'HAPV3': 'hapvida',
    'RADL3': 'raiadrogasil',
    'UGPA3': 'ultrapar',
    'VIVT3': 'telefonica-brasil',
    'BBSE3': 'bb-seguridade',
    'TIMS3': 'tim',
    'SBSP3': 'sabesp',
    'CMIG4': 'cemig',
    'CPLE6': 'copel',
    'EMBR3': 'embraer'
  };

  if (logoMap[cleanTicker]) {
    if (logoMap[cleanTicker].startsWith('country/')) {
        return `https://s3-symbol-logo.tradingview.com/${logoMap[cleanTicker]}.svg`;
    }
    // Se for um slug direto (ex: 'vale'), assume que é um logo de stock global ou br
    if (!logoMap[cleanTicker].includes('/')) {
        return `https://s3-symbol-logo.tradingview.com/${logoMap[cleanTicker]}.svg`;
    }
    return `https://s3-symbol-logo.tradingview.com/crypto/${logoMap[cleanTicker]}.svg`;
  }

  // Fallback B3 Logic
  if (symbol.includes('BMFBOVESPA') || symbol.includes('.SA')) {
      return `https://s3-symbol-logo.tradingview.com/brazil-bovespa--${cleanTicker.toLowerCase()}.svg`;
  }

  return `https://s3-symbol-logo.tradingview.com/${cleanTicker.toLowerCase()}.svg`;
};

const createAsset = (symbol: string, name: string, type: "Stock" | "Crypto" | "Index" | "Forex" | "Commodity") => ({
  symbol,
  name,
  type,
  logoUrl: getLogo(symbol)
});

const b3Stocks = [
  ["PETR4", "Petrobras PN"], ["PETR3", "Petrobras ON"], ["VALE3", "Vale S.A."], ["ITUB4", "Itaú Unibanco"],
  ["BBDC4", "Bradesco PN"], ["BBAS3", "Banco do Brasil"], ["B3SA3", "B3 S.A."], ["ABEV3", "Ambev"],
  ["WEGE3", "WEG S.A."], ["MGLU3", "Magalu"], ["RENT3", "Localiza"], ["SUZB3", "Suzano"],
  ["JBSS3", "JBS S.A."], ["GGBR4", "Gerdau PN"], ["RAIL3", "Rumo"], ["VIVT3", "Telefônica"],
  ["ELET3", "Eletrobras"], ["BBSE3", "BB Seguridade"], ["PRIO3", "Prio"], ["EQTL3", "Equatorial"],
  ["RADL3", "RaiaDrogasil"], ["UGPA3", "Ultrapar"], ["HAPV3", "Hapvida"], ["RDOR3", "Rede D'Or"],
  ["CSNA3", "Siderúrgica Nacional"], ["CMIG4", "Cemig"], ["CPLE6", "Copel"], ["EMBR3", "Embraer"],
  ["SBSP3", "Sabesp"], ["TIMS3", "TIM Brasil"], ["GOAU4", "Gerdau Met"], ["LREN3", "Lojas Renner"],
  ["CCRO3", "CCR S.A."], ["HYPE3", "Hypera"], ["RAIZ4", "Raízen"], ["EGIE3", "Engie Brasil"],
  ["MULT3", "Multiplan"], ["ASAI3", "Assaí"], ["BRFS3", "BRF S.A."], ["CRFB3", "Carrefour Br"],
  ["CYRE3", "Cyrela"], ["BRKM5", "Braskem"], ["ENGI11", "Energisa"], ["CPFE3", "CPFL Energia"],
  ["ALOS3", "Aliansce Sonae"], ["BEEF3", "Minerva"], ["BRAP4", "Bradespar"], ["COGN3", "Cogna"],
  ["CSAN3", "Cosan"], ["DXCO3", "Dexco"], ["EZTC3", "EZTEC"], ["FLRY3", "Fleury"], ["GMAT3", "Grupo Mateus"],
  ["IRBR3", "IRB Brasil"], ["KLBN11", "Klabin"], ["LWSA3", "Locaweb"], ["MRFG3", "Marfrig"], ["MRVE3", "MRV"],
  ["PETZ3", "Petz"], ["QUAL3", "Qualicorp"], ["RECV3", "PetroRecôncavo"], ["RRRP3", "3R Petroleum"],
  ["SLCE3", "SLC Agrícola"], ["SMTO3", "São Martinho"], ["TAEE11", "Taesa"], ["TOTS3", "Totvs"],
  ["VBBR3", "Vibra Energia"], ["YDUQ3", "Yduqs"], ["SMAL11", "Small Caps ETF"]
];

const usStocks = [
  ["AAPL", "Apple Inc."], ["NVDA", "Nvidia Corp"], ["TSLA", "Tesla Inc"], ["MSFT", "Microsoft"],
  ["AMZN", "Amazon.com"], ["GOOGL", "Alphabet A"], ["META", "Meta Platforms"], ["BRK.B", "Berkshire H"],
  ["LLY", "Eli Lilly"], ["AVGO", "Broadcom"], ["V", "Visa Inc"], ["JPM", "JP Morgan"],
  ["MA", "Mastercard"], ["UNH", "UnitedHealth"], ["PG", "Procter & Gamble"], ["COST", "Costco Wholesale"],
  ["HD", "Home Depot"], ["NFLX", "Netflix"], ["ADBE", "Adobe"], ["AMD", "AMD Corp"], ["PEP", "PepsiCo"],
  ["CRM", "Salesforce"], ["ORCL", "Oracle"], ["INTC", "Intel"], ["TMO", "Thermo Fisher"], ["ABT", "Abbott"],
  ["CSCO", "Cisco"], ["NKE", "Nike"], ["XOM", "Exxon Mobil"], ["CVX", "Chevron"], ["WMT", "Walmart"]
];

const cryptos = [
  ["BTCUSD", "Bitcoin"], ["ETHUSD", "Ethereum"], ["SOLUSD", "Solana"], ["BNBUSD", "BNB"],
  ["XRPUSD", "XRP"], ["ADAUSD", "Cardano"], ["DOGEUSD", "Dogecoin"], ["DOTUSD", "Polkadot"],
  ["LINKUSD", "Chainlink"], ["AVAXUSD", "Avalanche"], ["MATICUSD", "Polygon"], ["LTCUSD", "Litecoin"]
];

export const POPULAR_SYMBOLS: StockSymbol[] = [
  createAsset("BMFBOVESPA:IBOV", "Ibovespa", "Index"), // Returned IBOV
  createAsset("BMFBOVESPA:IBOV11", "iShares Ibovespa", "Stock"), // Kept IBOV11
  ...b3Stocks.map(s => createAsset(`BMFBOVESPA:${s[0]}`, s[1], "Stock")),
  ...usStocks.map(s => createAsset(`NASDAQ:${s[0]}`, s[1], "Stock")),
  ...cryptos.map(s => createAsset(`BINANCE:${s[0]}`, s[1], "Crypto")),
  createAsset("FX_IDC:USDBRL", "Dólar Comercial", "Forex"),
  createAsset("FX_IDC:EURUSD", "Euro / Dólar", "Forex")
];
