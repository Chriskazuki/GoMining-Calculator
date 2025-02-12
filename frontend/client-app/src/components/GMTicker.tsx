// src/components/GMTicker.tsx
import React, { useEffect, useRef } from 'react';

const GMTicker: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-tickers.js';
    script.type = 'text/javascript';
    script.async = true;
    script.text = JSON.stringify({
      symbols: [
        {
          proName: 'BITSTAMP:BTCUSD',
          title: 'Bitcoin'
        },
        {
          proName: 'BITFINEX:GMTUSD',
          title: 'GoMining (GMT)'
        }
      ],
      colorTheme: 'dark',
      isTransparent: false,
      showSymbolLogo: true,
      locale: 'en',
    });

    // On insère
    if (containerRef.current) {
      containerRef.current.appendChild(widgetDiv);
      containerRef.current.appendChild(script);
    }

    // Cleanup au démontage
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={containerRef} />
  );
};

export default GMTicker;