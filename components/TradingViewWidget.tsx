import React, { useEffect, useRef, useMemo } from 'react';
import { TradingViewConfig } from '../types';

interface TradingViewWidgetProps {
  containerId: string;
  scriptSrc: string;
  config: TradingViewConfig;
  className?: string;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ 
  containerId, 
  scriptSrc, 
  config,
  className = "w-full h-full"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Serializador seguro para evitar "Converting circular structure to JSON"
  // O erro acontece quando objetos DOM (HTMLDivElement) ou internos do React (__reactFiber)
  // são passados acidentalmente na config.
  const configString = useMemo(() => {
    try {
      const seen = new WeakSet();
      return JSON.stringify(config, (key, value) => {
        // 1. Passar primitivos diretamente
        if (value === null || typeof value !== 'object') {
          return value;
        }

        // 2. Prevenir Referências Circulares
        if (seen.has(value)) {
          return undefined;
        }
        seen.add(value);

        // 3. Filtrar Nós DOM (Causa principal do erro "HTMLDivElement")
        if (
             (typeof value.nodeType === 'number') || // Verifica propriedade comum de nós DOM
             (value instanceof Node) || 
             (value.constructor && value.constructor.name && (
                value.constructor.name.startsWith('HTML') || 
                value.constructor.name === 'FiberNode'
             ))
        ) {
            return undefined;
        }

        // 4. Filtrar Chaves Internas do React
        if (key.startsWith('__react') || key.startsWith('_') || key === 'stateNode' || key === 'nativeEvent') {
            return undefined;
        }

        return value;
      });
    } catch (e) {
      console.error(`[TradingViewWidget] Serialization error prevented for ${containerId}`, e);
      return "{}"; 
    }
  }, [config, containerId]);

  useEffect(() => {
    if (!containerRef.current || !configString) return;

    // Limpar widget anterior
    containerRef.current.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.width = '100%';
    widgetContainer.style.height = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetContainer.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = scriptSrc;
    script.async = true;
    
    // Injetar a config sanitizada
    script.innerHTML = configString;

    widgetContainer.appendChild(script);
    containerRef.current.appendChild(widgetContainer);

  }, [scriptSrc, configString]); 

  return (
    <div id={containerId} ref={containerRef} className={className} />
  );
};