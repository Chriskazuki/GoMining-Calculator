// src/components/TickerTapeWidget.tsx
import React, { useEffect, useRef } from 'react';

const TickerTapeWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Le div principal
    const containerDiv = document.createElement('div');
    containerDiv.className = 'tradingview-widget-container';
    containerDiv.style.maxWidth = '100%';
    containerDiv.style.overflow = 'hidden';

    // Le sous-div où TradingView rend le widget
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';

    // Script TradingView
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    // Configuration JSON
    script.text = JSON.stringify({
      symbols: [
        { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
        { proName: 'BITFINEX:GOMININGUSD', description: 'GoMining' }
      ],
      showSymbolLogo: true,
      isTransparent: false,
      displayMode: 'compact',
      colorTheme: 'dark',
      locale: 'en',
    });

    // On assemble
    containerDiv.appendChild(widgetDiv);
    containerDiv.appendChild(script);
    containerRef.current?.appendChild(containerDiv);

    // Nettoyage au démontage
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={containerRef} />;
};

export default TickerTapeWidget;