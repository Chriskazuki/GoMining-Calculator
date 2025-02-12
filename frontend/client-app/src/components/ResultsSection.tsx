import React from 'react';
import CountUp from 'react-countup';

interface BTCResults {
  myGrossProfit: number;
  clanRevenue: number;
  electricityCost: number;
  serviceCost: number;
  netProfit: number;
}

interface GMTResults {
  myGrossProfit: number;
  clanRevenue: number;
  clanCost: number;
  clanProfit: number;
  electricityCost: number;
  serviceCost: number;
}

interface ResultsSectionProps {
  sectionType: "BTC" | "GMT";
  title: React.ReactNode;
  sectionBg: string;
  cardBorder: string;
  iconColor: string;
  textColor: string;
  results: BTCResults | GMTResults;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  sectionType,
  title,
  sectionBg,
  cardBorder,
  iconColor,
  textColor,
  results,
}) => {
  return (
    <div className={`results-container rounded-md p-4 w-full md:w-1/2 ${sectionBg}`}>
      <h2 className={`text-xl font-bold mb-4 ${textColor}`}>{title}</h2>
      {sectionType === "BTC" ? (
        // 5 cartes pour BTC Rewards
        <div className="results-cards grid grid-cols-2 gap-4">
          <div className={`result-card ${cardBorder}`}>
            <div className={`label ${textColor}`}>💵 My Gross Profit</div>
            <div className="value">
              <CountUp end={(results as BTCResults).myGrossProfit} decimals={2} prefix="$" />
            </div>
          </div>
          <div className={`result-card ${cardBorder}`}>
            <div className={`label ${textColor}`}>💰 Clan Revenue</div>
            <div className="value">
              <CountUp end={(results as BTCResults).clanRevenue} decimals={2} prefix="$" />
            </div>
          </div>
          <div className={`result-card ${cardBorder}`}>
            <div className={`label ${textColor}`}>⚡ My Electricity Cost</div>
            <div className="value">
              <CountUp end={(results as BTCResults).electricityCost} decimals={2} prefix="$" />
            </div>
          </div>
          <div className={`result-card ${cardBorder}`}>
            <div className={`label ${textColor}`}>🔧 Service Cost</div>
            <div className="value">
              <CountUp end={(results as BTCResults).serviceCost} decimals={2} prefix="$" />
            </div>
          </div>
          <div className={`result-card ${cardBorder} ${((results as BTCResults).netProfit > 0) ? 'result-positive' : 'result-negative'}`}>
            <div className={`label ${textColor}`}>📈 My Net Profit</div>
            <div className="value">
              <CountUp end={(results as BTCResults).netProfit} decimals={2} prefix="$" />
            </div>
          </div>
        </div>
      ) : (
        // 6 cartes pour GMT Rewards
        <div className="results-cards grid grid-cols-3 gap-4">
          <div className={`result-card ${cardBorder}`}>
            <div className={`label ${textColor}`}>💵 My Gross Profit</div>
            <div className="value">
              <CountUp end={(results as GMTResults).myGrossProfit} decimals={2} prefix="$" />
            </div>
          </div>
          <div className={`result-card ${cardBorder}`}>
            <div className={`label ${textColor}`}>🧱 Clan Revenue</div>
            <div className="value">
              <CountUp end={(results as GMTResults).clanRevenue} decimals={2} prefix="$" />
            </div>
          </div>
          <div className={`result-card ${cardBorder}`}>
            <div className={`label ${textColor}`}>💸 Clan Cost</div>
            <div className="value">
              <CountUp end={(results as GMTResults).clanCost} decimals={2} prefix="$" />
            </div>
          </div>
          <div className={`result-card ${cardBorder}`}>
            <div className={`label ${textColor}`}>📊 Clan Profit</div>
            <div className="value">
              <CountUp end={(results as GMTResults).clanProfit} decimals={2} prefix="$" />
            </div>
          </div>
          <div className={`result-card ${cardBorder}`}>
            <div className={`label ${textColor}`}>⚡ Electricity Cost</div>
            <div className="value">
              <CountUp end={(results as GMTResults).electricityCost} decimals={2} prefix="$" />
            </div>
          </div>
          <div className={`result-card ${cardBorder}`}>
            <div className={`label ${textColor}`}>🔧 Service Cost</div>
            <div className="value">
              <CountUp end={(results as GMTResults).serviceCost} decimals={2} prefix="$" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsSection;