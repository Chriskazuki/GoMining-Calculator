// src/components/BitcoinPriceWidget.tsx

import React from 'react';
import TradingViewWidget, { Themes } from 'react-tradingview-widget';

// (Optionnel) Si vous voulez réagir au "mode sombre" global :
interface BitcoinPriceWidgetProps {
  isDarkMode?: boolean;
}

const BitcoinPriceWidget: React.FC<BitcoinPriceWidgetProps> = ({
  isDarkMode = false,
}) => {
  return (
    <div className="widget-card">
      <h2 className="widget-title">BTC / USD</h2>
      <TradingViewWidget
        symbol="BINANCE:BTCUSDT" // Autre ex: "COINBASE:BTCUSD"
        theme={isDarkMode ? Themes.DARK : Themes.LIGHT}
        locale="en"
        autosize
      />
    </div>
  );
};

export default BitcoinPriceWidget;