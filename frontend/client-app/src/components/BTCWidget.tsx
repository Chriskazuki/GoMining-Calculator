// src/components/BTCWidget.tsx
import React, { useEffect, useRef } from 'react';

/**
 * Props pour personnaliser le widget
 */
interface BTCWidgetProps {
  theme?: 'light' | 'dark';
  width?: string | number;
  height?: string | number;
}

const BTCWidget: React.FC<BTCWidgetProps> = ({
  theme = 'light',
  width = '100%',
  height = 400,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Script TradingView
    // Documentation: https://www.tradingview.com/widget/advanced-chart/
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (containerRef.current) {
        new (window as any).TradingView.widget({
          autosize: false,
          width: '100%',   // on mettra un style CSS responsive
          height: height,
          symbol: 'BINANCE:BTCUSDT', // exemple: BTC/USDT sur Binance
          interval: '60',
          timezone: 'Etc/UTC',
          theme: theme === 'light' ? 'Light' : 'Dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_legend: false,
          save_image: false,
          container_id: 'tradingview_btc_container',
        });
      }
    };

    containerRef.current?.appendChild(script);

    // Cleanup: retirer le script si le composant est démonté
    return () => {
      containerRef.current?.removeChild(script);
    };
  }, [theme, height]);

  return (
    <div className="widget-card">
      <h2 className="widget-title">BTC Price</h2>
      {/* Conteneur du widget TradingView */}
      <div
        id="tradingview_btc_container"
        ref={containerRef}
        style={{ width, height }}
      >
        {/* On peut mettre un loader si besoin */}
        Loading...
      </div>
    </div>
  );
};

export default BTCWidget;