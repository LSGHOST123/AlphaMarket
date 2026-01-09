
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { TradingViewWidget } from '../components/TradingViewWidget';
import { analyzeAsset } from '../services/geminiService';
import { fetchYahooData, MarketData, formatMoney, formatNumber, formatCompact } from '../services/yahooFinanceService';
import { getLogo } from '../constants';
import { UIStyle } from '../types';

interface AssetDetailProps {
  symbol: string;
  language: 'en' | 'pt' | 'es';
  uiStyle: UIStyle;
}

const DraggableWindow: React.FC<{ children: React.ReactNode; onClose: () => void; title: string }> = ({ children, onClose, title }) => {
  const [pos, setPos] = useState({ x: 50, y: 100 });
  const draggingRef = useRef(false);
  const relRef = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, []);

  return (
    <div 
        ref={windowRef}
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`, position: 'fixed', top: 0, left: 0 }} 
        className="z-[200] w-[95%] max-w-[700px] bg-black border-2 border-neon shadow-[0_0_100px_rgba(var(--neon-rgb),0.4)] animate-in zoom-in duration-300 will-change-transform"
    >
      <div 
        className="bg-neon text-black px-6 py-2 cursor-move flex justify-between items-center font-black tracking-widest uppercase text-xs select-none"
        onMouseDown={e => {
            draggingRef.current = true;
            relRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
        }}
      >
        <span className="flex items-center gap-2 pointer-events-none">
          <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
          {title}
        </span>
        <button onClick={onClose} className="hover:scale-110 transition-transform font-bold text-xl px-2">✕</button>
      </div>
      <div className="p-6 max-h-[50vh] overflow-y-auto bg-[#030303] text-gray-100 scrollbar-thin scrollbar-thumb-neon text-lg leading-relaxed font-mono">
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

  // TradingView Symbol Cleaner
  const getTVSymbol = (ticker: string) => {
    let clean = ticker.toUpperCase().trim();
    if (clean.includes(':')) clean = clean.split(':')[1];
    if (clean.endsWith('.SA')) return clean.replace('.SA', '');
    if (clean.startsWith('^')) return clean.substring(1); // Remove leading ^ (e.g., ^BVSP -> BVSP)
    if (clean.includes('-') && clean.endsWith('USD')) return clean.replace('-', '');
    return clean;
  };

  const tvSymbol = getTVSymbol(realData?.symbol || symbol);

  // Helper variables for change data
  const hasValidChange = realData && realData.change !== null && realData.change !== undefined;
  const isPositive = hasValidChange && (realData!.change! >= 0);

  return (
    <div className="flex flex-col min-h-screen bg-black text-[#c9d1d9] font-sans">
      
      {uiStyle === 'NEW' ? (
        /* UI NOVA (ESTILO DATA DENSE) */
        <div className="bg-[#0d1117] border-b border-[#21262d] p-8 md:p-12 lg:px-20 relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="flex justify-between items-start">
                <div>
                    <div className="mb-1 text-[#8b949e] font-medium text-lg uppercase tracking-wide">{realData?.longName || symbol}</div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="text-xl font-extrabold text-[#2f81f7] tracking-tight uppercase">{realData?.symbol}</div>
                        <div className="text-[10px] font-mono text-gray-500 bg-[#161b22] px-2 py-1 rounded border border-[#30363d]">
                            UPDATED: {lastUpdate}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex items-baseline gap-6 mb-8">
              <div className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
                {formatMoney(realData?.price, realData?.currency || 'USD')}
              </div>
              <div className={`text-2xl md:text-3xl font-semibold ${!hasValidChange ? 'text-gray-500' : (isPositive ? 'text-[#3fb950]' : 'text-[#f85149]')}`}>
                {hasValidChange ? (
                    <>
                        {isPositive ? '+' : ''}{formatNumber(realData?.change)} ({isPositive ? '+' : ''}{realData?.changePercent?.toFixed(2)}%)
                    </>
                ) : '---'}
              </div>
            </div>

            {/* GRID LIMPO APENAS COM DADOS REAIS DO JSON V8 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-0 border-t border-[#21262d] pt-6">
              <div className="divide-y divide-[#21262d]">
                <div className="flex justify-between py-3 text-sm"><span className="text-[#8b949e]">Previous Close</span><span className="font-bold text-white">{formatMoney(realData?.prevClose, realData?.currency || 'USD')}</span></div>
                <div className="flex justify-between py-3 text-sm"><span className="text-[#8b949e]">Open</span><span className="font-bold text-white">{formatMoney(realData?.open, realData?.currency || 'USD')}</span></div>
                <div className="flex justify-between py-3 text-sm"><span className="text-[#8b949e]">Day's Range</span><span className="font-bold text-white">{realData?.rangeDay}</span></div>
              </div>
              <div className="divide-y divide-[#21262d]">
                <div className="flex justify-between py-3 text-sm"><span className="text-[#8b949e]">52 Week Range</span><span className="font-bold text-white">{realData?.range52w}</span></div>
                <div className="flex justify-between py-3 text-sm"><span className="text-[#8b949e]">Volume</span><span className="font-bold text-white">{formatCompact(realData?.volume)}</span></div>
                <div className="flex justify-between py-3 text-sm"><span className="text-[#8b949e]">Market Cap</span><span className="font-bold text-white">{realData?.marketCap ? formatCompact(realData.marketCap, realData.currency) : '---'}</span></div>
              </div>
            </div>

            <div className="mt-12 flex justify-center">
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
                  className="bg-[#2f81f7] text-white text-xs font-black uppercase tracking-[0.4em] px-14 py-5 hover:bg-white hover:text-black transition-all shadow-[0_0_50px_rgba(47,129,247,0.4)]"
                >
                  {analyzing ? 'ANALYZING...' : 'GENERATE IA REPORT'}
                </button>
            </div>
          </div>
        </div>
      ) : (
        /* UI PADRÃO */
        <div className="bg-[#050505] border-b border-white/10 px-6 py-8 md:px-10 sticky top-16 z-[60] backdrop-blur-3xl">
          <div className="max-w-[2200px] mx-auto flex flex-col gap-10">
              <div className="flex flex-col xl:flex-row gap-10 items-center justify-between">
                <div className="flex items-center gap-6 xl:pr-10 xl:border-r border-white/10 shrink-0 min-w-[320px]">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-2 shadow-2xl shrink-0 border-2 border-[#222]">
                        <img src={getLogo(symbol)} alt={symbol} className="w-full h-full object-contain" onError={e => (e.target as any).style.display='none'} />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase truncate">{realData?.longName || symbol}</h1>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-xl text-neon font-black tracking-widest">{realData?.symbol}</span>
                            <span className="text-[10px] text-neon bg-neon/10 px-2 py-0.5 rounded font-bold border border-neon/30">
                                {lastUpdate}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8 xl:px-10 shrink-0">
                    <div className="text-6xl md:text-7xl font-black tracking-tighter text-white whitespace-nowrap leading-none">
                        {formatMoney(realData?.price, realData?.currency || 'USD')}
                    </div>
                    {realData && (
                        <div className={`flex flex-col items-center ${!hasValidChange ? 'text-gray-500' : (isPositive ? 'text-green-500' : 'text-red-600')}`}>
                            <span className="text-3xl font-black"> 
                                {hasValidChange ? `${isPositive ? '▲' : '▼'} ${formatNumber(Math.abs(realData.change!))}` : '---'}
                            </span>
                            <span className="text-xs bg-white/5 px-2 py-0.5 border border-white/10 font-bold mt-1">
                                ({hasValidChange ? `${formatNumber(realData.changePercent)}%` : '---'})
                            </span>
                        </div>
                    )}
                </div>

                <div className="xl:pl-10 shrink-0 ml-auto">
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
                      className="bg-red-600 text-black text-xs font-black uppercase tracking-[0.2em] px-10 py-5 hover:bg-white transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(220,38,38,0.3)] rounded-sm"
                    >
                      {analyzing ? '...' : 'IA REPORT'}
                    </button>
                </div>
              </div>

              {/* STANDARD UI GRID - Dados 100% Reais do JSON */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-y-6 gap-x-8 w-full border-t border-white/5 pt-8">
                  {[
                      { label: "PREVIOUS CLOSE", val: formatMoney(realData?.prevClose, realData?.currency || 'USD') },
                      { label: "OPEN", val: formatMoney(realData?.open, realData?.currency || 'USD') },
                      { label: "DAY'S RANGE", val: realData?.rangeDay || '---' },
                      { label: "52 WK RANGE", val: realData?.range52w || '---' },
                      { label: "VOLUME", val: formatCompact(realData?.volume) },
                  ].map((s, i) => (
                      <div key={i} className="flex flex-col border-l-2 border-white/5 pl-4 py-1 group hover:border-neon transition-all">
                          <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1 group-hover:text-neon transition-colors truncate">{s.label}</span>
                          <span className="text-sm font-bold font-mono tracking-tighter text-white truncate">{s.val}</span>
                      </div>
                  ))}
              </div>
          </div>
        </div>
      )}

      {/* CHARTS */}
      <div className="flex flex-col lg:flex-row h-auto border-b border-[#21262d] bg-black">
        <div className="lg:w-2/3 xl:w-3/4 border-r border-[#21262d] h-[600px] lg:h-[750px]">
            <TradingViewWidget 
                containerId="main-chart"
                scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
                config={{
                    autosize: true, symbol: tvSymbol, interval: "D", theme: "dark", style: "1", locale: "br",
                    backgroundColor: "#000000", gridLineColor: "rgba(33, 38, 45, 1)",
                    hide_top_toolbar: false, allow_symbol_change: true, save_image: true, calendar: true,
                }}
            />
        </div>
        <div className="lg:w-1/3 xl:w-1/4 flex flex-col bg-[#0d1117]">
            <div className="h-[400px] border-b border-[#21262d]">
                <TradingViewWidget 
                    containerId="tech-side"
                    scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
                    config={{ symbol: tvSymbol, colorTheme: "dark", width: "100%", height: "100%", locale: "br", isTransparent: false, backgroundColor: "#000000" }}
                />
            </div>
            <div className="flex-1 min-h-[400px]">
                <TradingViewWidget 
                    containerId="news-side"
                    scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js"
                    config={{ symbol: tvSymbol, colorTheme: "dark", width: "100%", height: "100%", locale: "br", isTransparent: false, displayMode: "regular", backgroundColor: "#000000" }}
                />
            </div>
        </div>
      </div>

      {/* ADDITIONAL WIDGETS */}
      <div className="bg-black py-16 px-6 lg:px-20 max-w-[1600px] mx-auto w-full">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="h-[550px] border border-[#21262d] bg-[#0d1117] p-4 hover:border-neon transition-all">
                <TradingViewWidget 
                    containerId="symbol-profile"
                    scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js"
                    config={{ symbol: tvSymbol, width: "100%", height: "100%", colorTheme: "dark", locale: "br" }}
                />
            </div>
            <div className="h-[550px] border border-[#21262d] bg-[#0d1117] p-4 hover:border-neon transition-all">
                <TradingViewWidget 
                    containerId="symbol-info"
                    scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-financials.js"
                    config={{ symbol: tvSymbol, colorTheme: "dark", width: "100%", height: "100%", locale: "br" }}
                />
            </div>
         </div>
      </div>

      {analysis && (
        <DraggableWindow title="GPT-5.1 NANO ANALYTICS" onClose={() => setAnalysis(null)}>
            <div className="whitespace-pre-line font-mono text-white text-lg leading-relaxed border-l-2 border-neon pl-6">
                {analysis}
            </div>
        </DraggableWindow>
      )}

      <footer className="mt-auto border-t border-[#21262d] bg-[#0d1117] p-10 text-center">
         <span className="text-[10px] text-[#8b949e] tracking-[1.2em] uppercase font-black">ALPHA MARKET PRO • MADE BY LUCAS SIMIONI</span>
      </footer>
    </div>
  );
};
