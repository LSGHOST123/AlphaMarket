

export interface TradingViewConfig {
  width?: string | number;
  height?: string | number;
  symbol?: string;
  interval?: string;
  timezone?: string;
  theme?: string;
  style?: string;
  locale?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  hide_top_toolbar?: boolean;
  hide_legend?: boolean;
  save_image?: boolean;
  calendar?: boolean;
  hide_volume?: boolean;
  support_host?: string;
  symbolsGroups?: any[];
  feedMode?: string;
  displayMode?: string;
  isTransparent?: boolean;
  showIntervalTabs?: boolean;
  colorTheme?: string;
  autosize?: boolean;
  symbols?: any[];
  showSymbolLogo?: boolean;
  backgroundColor?: string;
  gridLineColor?: string;
  largeChartUrl?: string;
  // Added missing property to fix type error in AssetDetail.tsx
  allow_symbol_change?: boolean;
}

export enum AppScreen {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  DASHBOARD = 'DASHBOARD',
  ASSET_DETAIL = 'ASSET_DETAIL',
}

export type UIStyle = 'NEW' | 'STANDARD';

export interface StockSymbol {
  symbol: string;
  name: string;
  type: string;
  price?: string;
  change?: string;
  logoUrl?: string;
}

export const POPULAR_SYMBOLS: StockSymbol[] = [
  { symbol: "NASDAQ:AAPL", name: "Apple Inc.", type: "Stock" },
  { symbol: "NASDAQ:NVDA", name: "NVIDIA Corp", type: "Stock" },
  { symbol: "NASDAQ:TSLA", name: "Tesla Inc", type: "Stock" },
  { symbol: "BMFBOVESPA:PETR4", name: "Petrobras", type: "Stock" },
  { symbol: "BMFBOVESPA:VALE3", name: "Vale S.A.", type: "Stock" },
  { symbol: "BITSTAMP:BTCUSD", name: "Bitcoin", type: "Crypto" },
  { symbol: "FOREXCOM:SPXUSD", name: "S&P 500", type: "Index" },
];
