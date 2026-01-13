
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { TradingViewWidget } from '../components/TradingViewWidget.tsx';
import { analyzeAsset } from '../services/geminiService.ts';
import { fetchYahooData, MarketData, formatMoney, formatNumber, formatCompact } from '../services/yahooFinanceService.ts';
import { getLogo } from '../constants.ts';
import { UIStyle } from '../types.ts';

interface AssetDetailProps {
  symbol: string;
  language: 'en' | 'pt' | 'es';
  uiStyle: UIStyle;
}

const DraggableWindow: React.FC<{ children: React.ReactNode; onClose: () => void; title: string }> = ({ children, onClose, title }) => {
  const [pos, setPos] = useState({ x: 20, y: 100 });
  const draggingRef = useRef(false);
  const relRef = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    if (isMobile) return;
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      requestAnimationFrame(() => {
        setPos({ 
          x: e.clientX - relRef.current.x, 
          y: e.clientY - relRef.current.y 
        });
      });
    };

    const onUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isMobile]);

  // CSS for Square IA window and internal scrollbar
  const style: React.CSSProperties = isMobile ? {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    zIndex: 200,
    height: '60vh', // More square-like height for mobile
    display: 'flex',
    flexDirection: 'column'
  } : {
    transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
    position: 'fixed',
    top: 0,
    left: 0,
    width: '500px', // Fixed width to make it square-like
    height: '500px', // Fixed height to make it square
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <div 
        ref={windowRef}
        style={style}
        className="bg-black border-t-2 md:border-2 border-neon shadow-[0_0_100px_rgba(var(--neon-rgb),0.4)] animate-in slide-in-from-bottom md:zoom-in duration-300 overflow-hidden"
    >
      <div 
        className={`bg-neon text-black px-4 md:px-6 py-2 ${!isMobile ? 'cursor-move' : ''} flex justify-between items-center font-black tracking-widest uppercase text-[10px] md:text-xs select-none shrink-0`}
        onMouseDown={e => {
            if (isMobile) return;
            draggingRef.current = true;
            relRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
        }}
      >
        <span className="flex items-center gap-2 pointer-events-none">
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black rounded-full animate-pulse"></div>
          {title}
        </span>
        <button onClick={onClose} className="font-bold text-lg px-2">✕</button>
      </div>
      <div className="p-4 md:p-8 overflow-y-auto bg-[#030303] text-gray-100 text-sm md:text-base leading-relaxed font-mono flex-1 custom-scrollbar scroll-smooth">
        {children}
      </div>
    </div>
  );
};

export const AssetDetail: React.FC<AssetDetailProps> = ({ symbol, language, uiStyle }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [realData, setRealData] = useState<MarketData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('--:--:--');
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [symbol]);

  useEffect(() => {
    let active = true;
    const load = async () => {
        const data = await fetchYahooData(symbol);
        if (active && data) {
            setRealData(data);
            const now = new Date();
            setLastUpdate(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
    };
    
    load();
    const interval = setInterval(load, 5000); 
    return () => { active = false; clearInterval(interval); };
  }, [symbol]);

  const getTVSymbol = (ticker: string) => {
    let clean = ticker.toUpperCase().trim();
    if (clean.includes(':')) clean = clean.split(':')[1];
    if (clean.endsWith('.SA')) return clean.replace('.SA', '');
    if (clean.startsWith('^')) return clean.substring(1); 
    return clean;
  };

  const tvSymbol = getTVSymbol(realData?.symbol || symbol);
  const hasValidChange = realData && realData.change !== null && realData.change !== undefined;
  const isPositive = hasValidChange && (realData!.change! >= 0);

  const t = {
    pt: {
      generateReport: 'GERAR AI REPORT',
      processing: 'PROCESSANDO...',
      prevClose: 'Prev Close',
      open: 'Open',
      volume: 'Volume',
      dayRange: 'Day Range',
      weekRange: '52 Week Range',
      madeBy: 'Made by Lucas Simioni'
    },
    en: {
      generateReport: 'GENERATE AI REPORT',
      processing: 'PROCESSING...',
      prevClose: 'Prev Close',
      open: 'Open',
      volume: 'Volume',
      dayRange: 'Day Range',
      weekRange: '52 Week Range',
      madeBy: 'Made by Lucas Simioni'
    },
    es: {
      generateReport: 'GENERAR AI REPORT',
      processing: 'PROCESANDO...',
      prevClose: 'Prev Close',
      open: 'Open',
      volume: 'Volume',
      dayRange: 'Day Range',
      weekRange: '52 Week Range',
      madeBy: 'Made by Lucas Simioni'
    }
  }[language];

  return (
    <div className="flex flex-col min-h-screen bg-black text-[#c9d1d9] font-sans">
      
      {uiStyle === 'NEW' ? (
        <div className="bg-[#0d1117] border-b border-[#21262d] p-6 md:p-12 lg:px-20 relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="mb-4">
                <div className="text-[#8b949e] font-medium text-sm md:text-lg uppercase tracking-wide truncate">{realData?.longName || symbol}</div>
                <div className="flex items-center gap-3 mt-1">
                    <div className="text-lg md:text-xl font-extrabold text-[#2f81f7] tracking-tight uppercase">{realData?.symbol}</div>
                    <div className="text-[8px] md:text-[10px] font-mono text-gray-500 bg-[#161b22] px-2 py-1 rounded border border-[#30363d]">
                        {lastUpdate}
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 mb-6 md:mb-8">
              <div className="text-4xl md:text-7xl font-bold tracking-tighter text-white">
                {formatMoney(realData?.price, realData?.currency || 'USD')}
              </div>
              <div className={`text-lg md:text-3xl font-semibold ${!hasValidChange ? 'text-gray-500' : (isPositive ? 'text-[#3fb950]' : 'text-[#f85149]')}`}>
                {hasValidChange ? `${isPositive ? '+' : ''}${formatNumber(realData?.change)} (${isPositive ? '+' : ''}${realData?.changePercent?.toFixed(2)}%)` : '---'}
              </div>
            </div>

            {/* Grid de dados com linhas separadoras para cada dado conforme screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#21262d] pt-4 md:pt-6 gap-x-10">
              <div className="divide-y divide-[#21262d] flex flex-col">
                <div className="flex justify-between py-3 md:py-4 text-xs md:text-sm"><span className="text-[#8b949e]">{t.prevClose}</span><span className="font-bold text-white">{formatMoney(realData?.prevClose, realData?.currency || 'USD')}</span></div>
                <div className="flex justify-between py-3 md:py-4 text-xs md:text-sm"><span className="text-[#8b949e]">{t.open}</span><span className="font-bold text-white">{formatMoney(realData?.open, realData?.currency || 'USD')}</span></div>
              </div>
              <div className="divide-y divide-[#21262d] flex flex-col border-t md:border-t-0 border-[#21262d]">
                <div className="flex justify-between py-3 md:py-4 text-xs md:text-sm"><span className="text-[#8b949e]">{t.volume}</span><span className="font-bold text-white">{formatCompact(realData?.volume)}</span></div>
                <div className="flex justify-between py-3 md:py-4 text-xs md:text-sm"><span className="text-[#8b949e]">{t.dayRange}</span><span className="font-bold text-white">{realData?.rangeDay}</span></div>
              </div>
              <div className="flex flex-col border-t md:border-t-0 border-[#21262d]">
                <div className="flex justify-between py-3 md:py-4 text-xs md:text-sm"><span className="text-[#8b949e]">{t.weekRange}</span><span className="font-bold text-white">{realData?.range52w}</span></div>
                {/* Linha extra para manter consistência visual do grid */}
                <div className="border-t border-[#21262d] flex justify-between py-3 md:py-4 text-xs md:text-sm invisible">
                  <span>Placeholder</span>
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-12 flex justify-center">
                <button 
                  onClick={async () => {
                      if (!realData) return;
                      setAnalyzing(true);
                      const res = await analyzeAsset(symbol, {
                          open: realData.open || 0, close: realData.price || 0,
                          high: realData.high || 0, low: realData.low || 0,
                          volume: formatCompact(realData.volume), 
                          change: hasValidChange ? realData.changePercent!.toFixed(2) + "%" : "N/A",
                          marketCap: formatCompact(realData.marketCap)
                      }, language);
                      setAnalysis(res);
                      setAnalyzing(false);
                  }}
                  disabled={!realData || analyzing}
                  className="w-full md:w-auto bg-[#2f81f7] text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em] px-6 py-4 md:px-14 md:py-5 hover:bg-white hover:text-black transition-all shadow-[0_0_50px_rgba(47,129,247,0.4)] rounded-sm"
                >
                  {analyzing ? t.processing : t.generateReport}
                </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#050505] border-b border-white/10 px-4 py-6 md:px-10 sticky top-16 z-[60] backdrop-blur-md">
          <div className="max-w-[2200px] mx-auto flex flex-col gap-6 md:gap-10">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center p-2 shrink-0 border-2 border-[#222]">
                        <img src={getLogo(symbol)} alt={symbol} className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl md:text-3xl font-black tracking-tighter text-white uppercase truncate">{realData?.longName || symbol}</h1>
                        <span className="text-sm md:text-xl text-neon font-black tracking-widest">{realData?.symbol}</span>
                        <div className="text-[8px] md:text-[10px] text-gray-500 font-mono mt-1">{lastUpdate}</div>
                    </div>
                </div>

                <div className="flex flex-row items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:w-auto px-2">
                    <div className="text-3xl md:text-7xl font-black tracking-tighter text-white whitespace-nowrap leading-none">
                        {formatMoney(realData?.price, realData?.currency || 'USD')}
                    </div>
                    {realData && (
                        <div className={`flex flex-col items-end ${!hasValidChange ? 'text-gray-500' : (isPositive ? 'text-green-500' : 'text-red-600')}`}>
                            <span className="text-lg md:text-3xl font-black"> 
                                {hasValidChange ? `${isPositive ? '▲' : '▼'} ${formatNumber(Math.abs(realData.change!))}` : '---'}
                            </span>
                            <span className="text-[8px] md:text-xs font-bold">
                                ({hasValidChange ? `${formatNumber(realData.changePercent)}%` : '---'})
                            </span>
                        </div>
                    )}
                </div>

                <div className="w-full md:w-auto">
                    <button 
                      onClick={async () => {
                          if (!realData) return;
                          setAnalyzing(true);
                          const res = await analyzeAsset(symbol, {
                              open: realData.open || 0, close: realData.price || 0,
                              high: realData.high || 0, low: realData.low || 0,
                              volume: formatCompact(realData.volume), 
                              change: hasValidChange ? realData.changePercent!.toFixed(2) + "%" : "N/A",
                              marketCap: formatCompact(realData.marketCap)
                          }, language);
                          setAnalysis(res);
                          setAnalyzing(false);
                      }}
                      disabled={!realData || analyzing}
                      className="w-full bg-red-600 text-black text-[10px] md:text-xs font-black uppercase tracking-[0.2em] px-6 py-4 md:px-10 md:py-5 hover:bg-white transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] rounded-sm"
                    >
                      {analyzing ? t.processing : t.generateReport}
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-0 w-full border-t border-white/5 pt-6">
                  {[
                      { label: t.prevClose, val: formatMoney(realData?.prevClose, realData?.currency || 'USD') },
                      { label: t.open, val: formatMoney(realData?.open, realData?.currency || 'USD') },
                      { label: t.volume, val: formatCompact(realData?.volume) },
                      { label: t.dayRange, val: realData?.rangeDay },
                      { label: t.weekRange, val: realData?.range52w },
                  ].map((s, i) => (
                      <div key={i} className={`flex flex-col px-4 py-1 ${i > 0 ? 'border-l border-white/10' : ''}`}>
                          <span className="text-[8px] md:text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1 truncate">{s.label}</span>
                          <span className="text-xs md:text-sm font-bold font-mono tracking-tighter text-white truncate">{s.val}</span>
                      </div>
                  ))}
              </div>
          </div>
        </div>
      )}

      {/* CHARTS RESPONSIVE */}
      <div className="flex flex-col h-auto bg-black border-b border-[#21262d]">
        <div className="w-full h-[450px] md:h-[600px] lg:h-[750px]">
            <TradingViewWidget 
                containerId="main-chart"
                scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
                config={{
                    autosize: true, symbol: tvSymbol, interval: "D", theme: "dark", style: "1", locale: "br",
                    backgroundColor: "#000000", gridLineColor: "rgba(33, 38, 45, 1)",
                    hide_top_toolbar: isMobile, allow_symbol_change: true,
                }}
            />
        </div>
      </div>

      {/* Widgets Extras - Forçados no tema dark */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-black border-b border-[#21262d]">
          <div className="h-[450px] bg-black">
              <TradingViewWidget 
                  containerId="ta-widget"
                  scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
                  config={{
                      interval: "1D", width: "100%", height: "100%", symbol: tvSymbol,
                      showIntervalTabs: true, locale: "br", colorTheme: "dark", isTransparent: false
                  }}
              />
          </div>
          <div className="h-[450px] bg-black">
              <TradingViewWidget 
                  containerId="profile-widget"
                  scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js"
                  config={{
                      symbol: tvSymbol, width: "100%", height: "100%", colorTheme: "dark",
                      isTransparent: false, locale: "br"
                  }}
              />
          </div>
          <div className="h-[450px] bg-black">
              <TradingViewWidget 
                  containerId="news-widget"
                  scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js"
                  config={{
                      feedMode: "symbol", symbol: tvSymbol, colorTheme: "dark", isTransparent: false,
                      displayMode: "regular", width: "100%", height: "100%", locale: "br"
                  }}
              />
          </div>
      </div>

      {analysis && (
        <DraggableWindow title="GPT-5.1 NANO ANALYTICS" onClose={() => setAnalysis(null)}>
            <div className="whitespace-pre-line font-mono text-white text-xs md:text-sm leading-relaxed border-l-2 border-neon pl-4 md:pl-6 pb-2">
                {analysis}
            </div>
        </DraggableWindow>
      )}

      <footer className="mt-auto border-t border-[#21262d] bg-[#0d1117] p-8 md:p-10 text-center">
         <span className="text-[8px] md:text-[10px] text-[#8b949e] tracking-[0.4em] md:tracking-[0.8em] uppercase font-black">
           ALPHA MARKET PRO • {t.madeBy}
         </span>
      </footer>
    </div>
  );
};
