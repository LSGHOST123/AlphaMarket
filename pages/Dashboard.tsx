
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { POPULAR_SYMBOLS, StockSymbol, getLogo } from '../constants.ts';
import { TradingViewWidget } from '../components/TradingViewWidget.tsx';
import { fetchYahooQuotesBatch, formatMoney, formatNumber, MarketData } from '../services/yahooFinanceService.ts';

interface DashboardProps {
  onSelectAsset: (symbol: string) => void;
  language: 'en' | 'pt' | 'es';
}

type SortOption = 'default' | 'name_asc' | 'price_desc' | 'price_asc' | 'change_desc' | 'change_asc';

const safeStringify = (obj: any) => {
  const seen = new WeakSet();
  try {
    return JSON.stringify(obj, (key, value) => {
      if (value === null || typeof value !== 'object') return value;
      if (seen.has(value)) return undefined;
      seen.add(value);
      if (
          (typeof value.nodeType === 'number') ||
          (value instanceof Node) ||
          (value.constructor && value.constructor.name && value.constructor.name.startsWith('HTML')) ||
          key.startsWith('__react') || 
          key.startsWith('_') ||
          key === 'stateNode' ||
          key === 'nativeEvent'
      ) {
        return undefined;
      }
      return value;
    });
  } catch (e) {
    return "{}";
  }
};

const AssetCard: React.FC<{ 
    asset: StockSymbol; 
    data: any; 
    onClick: () => void;
}> = ({ asset, data, onClick }) => {
    const [imgError, setImgError] = useState(false);
    const displaySymbol = asset.symbol.includes(':') ? asset.symbol.split(':')[1] : asset.symbol;
    const fullTicker = displaySymbol.match(/^[A-Z]{4}[3456]|11$/) ? `${displaySymbol}.SA` : displaySymbol;
    const displayName = data?.longName || data?.shortName || asset.name;

    const hasValidChange = data && data.change !== null && data.change !== undefined;
    const isPositive = hasValidChange && data.change >= 0;

    return (
        <div 
            onClick={onClick}
            className="group relative bg-[#030303] border border-[#222] hover:border-red-600 p-4 md:p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[220px] md:min-h-[280px] hover:shadow-[0_0_50px_rgba(220,38,38,0.2)] hover:-translate-y-1 md:hover:-translate-y-2 overflow-hidden"
        >
            <div className="flex flex-col items-start gap-3 relative z-10 w-full">
                <div className="flex items-start justify-between w-full">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center p-1.5 md:p-2 border-2 border-[#111] shadow-2xl overflow-hidden shrink-0">
                        {imgError ? (
                            <div className="w-full h-full flex items-center justify-center bg-white">
                                <span className="text-black font-black text-sm md:text-lg">{displaySymbol.substring(0,2)}</span>
                            </div>
                        ) : (
                            <img 
                                src={getLogo(asset.symbol)} 
                                alt={asset.name} 
                                className="w-full h-full object-contain" 
                                onError={() => setImgError(true)}
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full animate-pulse shadow-[0_0_8px_#ff0000] ${data ? 'bg-green-500 shadow-green-500/50' : 'bg-red-600'}`}></div>
                        <span className="text-[8px] md:text-[9px] text-gray-500 font-mono tracking-widest border border-[#111] px-1.5 md:px-2 py-0.5 rounded-sm bg-black uppercase font-black">
                          {asset.type.toUpperCase()}
                        </span>
                    </div>
                </div>
                <div className="w-full">
                    <h3 className="text-sm md:text-lg font-black text-white font-mono leading-[1.1] group-hover:text-red-500 transition-colors tracking-tighter uppercase line-clamp-2">
                        {displayName}
                    </h3>
                    <span className="text-[9px] md:text-[10px] text-gray-600 font-mono tracking-widest block mt-1 font-black uppercase">{fullTicker}</span>
                </div>
            </div>

            <div className="mt-auto border-t border-[#111] pt-3 md:pt-4 w-full relative z-10">
                {!data ? (
                    <div className="space-y-1 md:space-y-2">
                        <div className="h-4 md:h-6 w-24 md:w-32 bg-[#080808] animate-pulse border border-[#111] rounded-sm"></div>
                        <span className="text-[7px] md:text-[8px] text-gray-700 font-mono uppercase tracking-tighter">LINKING...</span>
                    </div>
                ) : (
                    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <span className="text-lg md:text-2xl font-mono font-black text-white tracking-tighter leading-none mb-1">
                            {formatMoney(data.price, data.currency)}
                        </span>
                        <div className={`flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-mono font-black ${!hasValidChange ? 'text-gray-500' : (isPositive ? 'text-green-500' : 'text-red-600')}`}>
                            <span className="flex items-center gap-1">
                                {hasValidChange ? (
                                    <>
                                        {isPositive ? '▲' : '▼'} {formatNumber(Math.abs(data.change))}
                                    </>
                                ) : '---'}
                            </span>
                            <span className="bg-white/5 px-1 py-0.5 rounded-sm border border-white/5">
                                ({hasValidChange ? `${formatNumber(Math.abs(data.changePercent))}%` : '---'})
                            </span>
                        </div>
                    </div>
                )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ onSelectAsset, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [showHelp, setShowHelp] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('--:--:--');
  
  const [marketData, setMarketData] = useState<Record<string, Partial<MarketData>>>(() => {
    try {
      const cached = localStorage.getItem('ALPHA_MARKET_CACHE');
      return (cached && cached !== "undefined") ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });
  
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (Object.keys(marketData).length === 0) return;
    try {
        const safeCache = safeStringify(marketData);
        localStorage.setItem('ALPHA_MARKET_CACHE', safeCache);
    } catch (e) {
        console.warn('Failed to persist market data:', e);
    }
  }, [marketData]);

  useEffect(() => {
    const load = async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        const allSymbols = POPULAR_SYMBOLS.map(s => s.symbol);
        try {
            const data = await fetchYahooQuotesBatch(allSymbols);
            setMarketData(prev => ({ ...prev, ...data }));
            setLastUpdateTime(new Date().toLocaleTimeString('pt-BR'));
        } catch (e) {
            console.error("Batch load failed", e);
        } finally {
            isFetchingRef.current = false;
        }
    };
    
    load();
    const interval = setInterval(load, 8000); 
    return () => clearInterval(interval);
  }, []);

  const filteredAndSortedAssets = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    let result = POPULAR_SYMBOLS.filter(asset => 
      asset.symbol.toLowerCase().includes(lowerSearch) || 
      asset.name.toLowerCase().includes(lowerSearch)
    );

    if (sortOption === 'name_asc') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortOption === 'price_desc') result = [...result].sort((a, b) => (marketData[b.symbol]?.price || 0) - (marketData[a.symbol]?.price || 0));
    else if (sortOption === 'price_asc') result = [...result].sort((a, b) => (marketData[a.symbol]?.price || 0) - (marketData[b.symbol]?.price || 0));
    else if (sortOption === 'change_desc') result = [...result].sort((a, b) => (marketData[b.symbol]?.changePercent || 0) - (marketData[a.symbol]?.changePercent || 0));
    else if (sortOption === 'change_asc') result = [...result].sort((a, b) => (marketData[a.symbol]?.changePercent || 0) - (marketData[b.symbol]?.changePercent || 0));

    return result;
  }, [searchTerm, sortOption, marketData]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        const term = searchTerm.trim().toUpperCase();
        if (term !== '') {
            const found = POPULAR_SYMBOLS.find(a => 
                a.symbol.toUpperCase() === term || 
                (a.symbol.includes(':') && a.symbol.split(':')[1].toUpperCase() === term)
            );
            if (found) {
                 onSelectAsset(found.symbol);
            } else {
                 onSelectAsset(term);
            }
        }
    }
  };

  const labels = {
    pt: {
      market: 'MERCADO',
      global: 'GLOBAL',
      terminalActive: 'TERMINAL ATIVO',
      lastUpdate: 'ÚLTIMA ATUALIZAÇÃO',
      searchTerminal: 'BUSCAR TERMINAL',
      placeholder: 'DIGITE TICKER...',
      sortEngine: 'MOTOR DE FILTRO',
      helpTitle: 'Não achou algum ativo?',
      helpDesc: 'Pesquise e clique ENTER para carregá-lo globalmente.',
      sortDefault: 'PADRÃO',
      sortAZ: 'A-Z',
      sortPriceDesc: 'PREÇO: MAIOR',
      sortPriceAsc: 'PREÇO: MENOR',
      sortChangeDesc: 'VARIAÇÃO: ALTA',
      sortChangeAsc: 'VARIAÇÃO: BAIXA'
    },
    en: {
      market: 'MARKET',
      global: 'GLOBAL',
      terminalActive: 'ACTIVE TERMINAL',
      lastUpdate: 'LAST UPDATE',
      searchTerminal: 'SEARCH TERMINAL',
      placeholder: 'ENTER TICKER...',
      sortEngine: 'SORT ENGINE',
      helpTitle: "Can't find an asset?",
      helpDesc: 'Search and press ENTER to load it globally.',
      sortDefault: 'DEFAULT',
      sortAZ: 'A-Z',
      sortPriceDesc: 'PRICE: HIGHEST',
      sortPriceAsc: 'PRICE: LOWEST',
      sortChangeDesc: 'CHANGE: HIGHEST',
      sortChangeAsc: 'CHANGE: LOWEST'
    },
    es: {
      market: 'MERCADO',
      global: 'GLOBAL',
      terminalActive: 'TERMINAL ACTIVO',
      lastUpdate: 'ÚLTIMA ACTUALIZACIÓN',
      searchTerminal: 'BUSCAR TERMINAL',
      placeholder: 'INGRESAR TICKER...',
      sortEngine: 'MOTOR DE FILTRO',
      helpTitle: '¿No encuentras un activo?',
      helpDesc: 'Busca y presiona ENTER para cargarlo globalmente.',
      sortDefault: 'ESTÁNDAR',
      sortAZ: 'A-Z',
      sortPriceDesc: 'PRECIO: MAYOR',
      sortPriceAsc: 'PRECIO: MENOR',
      sortChangeDesc: 'VARIACIÓN: ALTA',
      sortChangeAsc: 'VARIACIÓN: BAJA'
    }
  }[language];

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Ticker Tape - Tema escuro garantido e altura maior */}
      <div className="w-full h-24 border-b border-[#111] bg-black shrink-0 relative z-10 overflow-hidden">
         <TradingViewWidget 
           containerId="ticker-tape"
           scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
           config={{
             symbols: [
               { proName: "FX_IDC:USDBRL", title: "USD/BRL" },
               { proName: "BITSTAMP:BTCUSD", title: "BTC/USD" },
               { proName: "BMFBOVESPA:IBOV", title: "IBOVESPA" },
               { proName: "NASDAQ:AAPL", title: "APPLE" },
               { proName: "NASDAQ:NVDA", title: "NVIDIA" },
               { proName: "NASDAQ:TSLA", title: "TESLA" }
             ],
             showSymbolLogo: true,
             colorTheme: "dark",
             isTransparent: false, // Ensures solid black background
             displayMode: "adaptive",
             locale: language === 'pt' ? 'br' : 'en'
           }}
           className="w-full h-full bg-black"
         />
      </div>

      <div className="flex-1 p-4 md:p-12 bg-black pt-12 md:pt-16">
        <div className="max-w-[2200px] mx-auto w-full">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 md:mb-16 gap-6 md:gap-8 border-b border-[#111] pb-8 md:pb-12">
            <div className="animate-in slide-in-from-left duration-700">
              <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-4 uppercase leading-[0.85]">
                {labels.market} <br />
                <span className="text-neon neon-text-glow italic">{labels.global}</span>
              </h2>
              <div className="flex items-center gap-3 md:gap-4 mt-4 md:mt-6 flex-wrap">
                <p className="text-gray-600 text-[10px] md:text-[12px] font-mono uppercase tracking-[0.2em] md:tracking-[0.4em] flex items-center gap-2">
                    <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-red-600 animate-ping"></span>
                    {labels.terminalActive}
                </p>
                <div className="flex items-center gap-2 bg-neon/10 border border-neon/30 px-2 md:px-3 py-1 rounded-sm">
                   <span className="text-[9px] md:text-[10px] text-neon font-mono uppercase tracking-widest font-black">
                       {labels.lastUpdate}: {lastUpdateTime}
                   </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full lg:w-auto items-end animate-in slide-in-from-right duration-700">
                <div className="flex flex-col gap-2 w-full sm:w-[400px] relative group">
                   <div className="flex justify-between items-center">
                      <label className="text-[9px] md:text-[10px] text-red-600 uppercase tracking-[0.2em] md:tracking-[0.4em] font-black">{labels.searchTerminal}</label>
                      <button 
                        onMouseEnter={() => setShowHelp(true)}
                        onMouseLeave={() => setShowHelp(false)}
                        className="w-4 h-4 md:w-5 md:h-5 bg-[#2f81f7] text-white rounded-sm flex items-center justify-center text-[10px] md:text-xs font-bold hover:bg-white hover:text-[#2f81f7] transition-colors shadow-[0_0_10px_rgba(47,129,247,0.4)] cursor-help"
                      >
                        ?
                      </button>
                   </div>
                   
                   <div className={`absolute bottom-full right-0 mb-2 w-56 md:w-64 bg-[#0d1117] border border-[#30363d] p-3 md:p-4 shadow-xl z-20 transition-all duration-300 pointer-events-none ${showHelp ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <p className="text-[10px] md:text-xs text-gray-300 font-mono leading-relaxed">
                         {labels.helpTitle} <br/>
                         <span className="text-[#2f81f7] font-bold">{labels.helpDesc}</span>
                      </p>
                   </div>

                   <input 
                    type="text" 
                    placeholder={labels.placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    enterKeyHint="search"
                    className="w-full bg-[#080808] border border-[#222] text-white p-3 md:p-4 focus:border-red-600 focus:outline-none font-mono uppercase text-sm md:text-md rounded-sm tracking-[0.1em] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2 w-full sm:w-auto">
                   <label className="text-[9px] md:text-[10px] text-gray-600 uppercase tracking-[0.2em] md:tracking-[0.4em] font-black">{labels.sortEngine}</label>
                   <select 
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="bg-[#080808] border border-[#222] text-white text-xs md:sm p-3 md:p-4 uppercase focus:border-red-600 outline-none font-mono tracking-widest min-w-full sm:min-w-[240px] rounded-sm cursor-pointer"
                   >
                      <option value="default">{labels.sortDefault}</option>
                      <option value="name_asc">{labels.sortAZ}</option>
                      <option value="price_desc">{labels.sortPriceDesc}</option>
                      <option value="price_asc">{labels.sortPriceAsc}</option>
                      <option value="change_desc">{labels.sortChangeDesc}</option>
                      <option value="change_asc">{labels.sortChangeAsc}</option>
                   </select>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8 pb-32">
            {filteredAndSortedAssets.map((asset) => (
               <AssetCard 
                  key={asset.symbol} 
                  asset={asset} 
                  data={marketData[asset.symbol]}
                  onClick={() => onSelectAsset(asset.symbol)} 
               />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
