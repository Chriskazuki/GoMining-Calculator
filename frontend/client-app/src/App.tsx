import React, { useState, useEffect, ChangeEvent } from 'react';
import './App.css';
import ResultsSection from './components/ResultsSection';
import TickerTapeWidget from './components/TickerTapeWidget';

interface CalculationInput {
  my_power: number;
  my_personal_block: number;
  total_power: number;
  btc_mined: number;
  blocks_mined: number;
  boost_green: number;
  boost_red: number;
  boost_violet: number;
  energy_efficiency: number; // en %
  discount: number;          // en % (ex: 10 signifie 10%)
  days: number;              // Days spent in Miner Wars
}

interface PriceData {
  bitcoin: { usd: number };
  'gmt-token': { usd: number };
}

function App() {
  const [inputs, setInputs] = useState<CalculationInput>({
    my_power: 0,
    my_personal_block: 0,
    total_power: 0,
    btc_mined: 0,
    blocks_mined: 0,
    boost_green: 0,
    boost_red: 0,
    boost_violet: 0,
    energy_efficiency: 0,
    discount: 0,
    days: 0,
  });

  // Pour les récompenses BTC (en dollars)
  const [btcResults, setBtcResults] = useState({
    myGrossProfit: 0,
    clanRevenue: 0,
    electricityCost: 0,
    serviceCost: 0,
    netProfit: 0,
  });

  // Pour les récompenses GMT
  const [gmtResults, setGmtResults] = useState({
    myGrossProfit: 0,
    clanRevenue: 0,
    clanCost: 0,
    clanProfit: 0,
    electricityCost: 0,
    serviceCost: 0,
  });

  const [priceLoading, setPriceLoading] = useState<boolean>(true);
  const [priceError, setPriceError] = useState<string | null>(null);

  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [gmtPrice, setGmtPrice] = useState<number | null>(null);
  const [usdToEurRate, setUsdToEurRate] = useState<number | null>(null);
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Récupération des prix BTC et GMT
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setPriceLoading(true);
        setPriceError(null);
        const resp = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,gmt-token&vs_currencies=usd'
        );
        if (!resp.ok) {
          throw new Error(`Erreur HTTP : ${resp.status}`);
        }
        const data: PriceData = await resp.json();
        setBtcPrice(data.bitcoin.usd);
        setGmtPrice(data['gmt-token'].usd);
      } catch (err: any) {
        setPriceError(err.message || 'Erreur pendant la récupération des prix.');
      } finally {
        setPriceLoading(false);
      }
    };
    fetchPrices();
  }, []);

  // Récupération du taux EUR (si besoin)
  useEffect(() => {
    const fetchEurRate = async () => {
      try {
        const resp = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=EUR');
        if (!resp.ok) {
          throw new Error('Erreur lors de la récupération du taux EUR');
        }
        const data = await resp.json();
        if (!data.rates || !data.rates.EUR) {
          throw new Error('Réponse invalide du service de taux de change');
        }
        setUsdToEurRate(data.rates.EUR);
      } catch (err: any) {
        console.error(err.message);
      }
    };
    fetchEurRate();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value),
    }));
    setButtonState('idle');
  };

  const handleSubmit = () => {
    try {
      setButtonState('loading');
      if (!btcPrice || !gmtPrice || inputs.total_power === 0) {
        throw new Error('Prix BTC/GMT non disponibles ou Total Clan Hashrate égal à 0.');
      }
      setError(null);

      // --- Calculs pour BTC Rewards ---
      // My Gross Profit = (BTC Mined / Total Clan Hashrate * My Hashrate) * BTC Price
      const btcGrossProfit = (inputs.btc_mined / inputs.total_power) * inputs.my_power * btcPrice;
      // Clan Revenue = BTC Mined * BTC Price
      const clanRevenueBTC = inputs.btc_mined * btcPrice;

      // Coût d’électricité en BTC :
      // 1. Calcul de la valeur de base en BTC, conversion en sats
      const baseElecBTC = ((0.05 * 24 * inputs.energy_efficiency) / (btcPrice * 1000)) * inputs.my_power;
      const baseElecBTC_sats = baseElecBTC * 1e8;
      // 2. Application de la remise (Discount %)
      const finalElecBTC_sats = baseElecBTC_sats * (1 - inputs.discount / 100);
      // 3. Conversion en dollars et multiplication par le nombre de jours
      const elecCostBTC_dollars = finalElecBTC_sats * btcPrice / 1e8 * inputs.days;

      // Coût de service en BTC :
      // 1. Calcul de la valeur de base en BTC, conversion en sats
      const baseServiceBTC = (0.0089 / btcPrice) * inputs.my_power;
      const baseServiceBTC_sats = baseServiceBTC * 1e8;
      // 2. Application de la remise
      const finalServiceBTC_sats = baseServiceBTC_sats * (1 - inputs.discount / 100);
      // 3. Conversion en dollars et multiplication par le nombre de jours
      const serviceCostBTC_dollars = finalServiceBTC_sats * btcPrice / 1e8 * inputs.days;

      // My Net Profit = Gross Profit - (Electricity Cost + Service Cost)
      const btcNetProfit = btcGrossProfit - elecCostBTC_dollars - serviceCostBTC_dollars;

      setBtcResults({
        myGrossProfit: btcGrossProfit,
        clanRevenue: clanRevenueBTC,
        electricityCost: elecCostBTC_dollars,
        serviceCost: serviceCostBTC_dollars,
        netProfit: btcNetProfit,
      });

      // --- Calculs pour GMT Rewards ---
      // My Gross Profit = My Personal Block * GMT Price
      const gmtGrossProfit = inputs.my_personal_block * gmtPrice;
      // Clan Revenue = GoMining Blocks Mined * 323.3 GMT par bloc * GMT Price
      const clanRevenueGMT = inputs.blocks_mined * 323.3 * gmtPrice;
      // Clan Cost = (boost_green + boost_red + boost_violet * 9) * GMT Price
      const clanCostGMT = (inputs.boost_green + inputs.boost_red + inputs.boost_violet * 9) * gmtPrice;
      // Clan Profit = Clan Revenue - Clan Cost
      const clanProfitGMT = clanRevenueGMT - clanCostGMT;

      // Coût d’électricité en GMT :
      const baseElecGMT = ((0.05 * 24 * inputs.energy_efficiency) / (gmtPrice * 1000)) * inputs.my_power;
      const baseElecGMT_sats = baseElecGMT * 1e8;
      const finalElecGMT_sats = baseElecGMT_sats * (1 - inputs.discount / 100);
      const elecCostGMT = finalElecGMT_sats * gmtPrice / 1e8 * inputs.days;

      // Coût de service en GMT :
      const baseServiceGMT = (0.0089 / gmtPrice) * inputs.my_power;
      const baseServiceGMT_sats = baseServiceGMT * 1e8;
      const finalServiceGMT_sats = baseServiceGMT_sats * (1 - inputs.discount / 100);
      const serviceCostGMT = finalServiceGMT_sats * gmtPrice / 1e8 * inputs.days;

      setGmtResults({
        myGrossProfit: gmtGrossProfit,
        clanRevenue: clanRevenueGMT,
        clanCost: clanCostGMT,
        clanProfit: clanProfitGMT,
        electricityCost: elecCostGMT,
        serviceCost: serviceCostGMT,
      });

      setTimeout(() => {
        setButtonState('done');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du calcul.');
      setButtonState('idle');
    }
  };

  return (
    <div className="outer-container app-width">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full">
          <h1 className="text-2xl font-bold text-center mb-2">⛏️ BTC Mining Calculator</h1>
          <p className="text-center text-gray-600 mb-6">
            Calculate your rewards and profits in real time
          </p>

          {priceLoading && (
            <div className="mb-4 p-4 bg-gray-100 text-gray-800 rounded-lg text-center font-semibold">
              Récupération des prix en cours...
            </div>
          )}
          {priceError && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg text-center font-semibold">
              {priceError}
            </div>
          )}

          {/* Formulaire */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">💪 My Hashrate (TH)</label>
              <input
                type="number"
                name="my_power"
                value={inputs.my_power}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">🗃️ My Personal Block</label>
              <input
                type="number"
                name="my_personal_block"
                value={inputs.my_personal_block}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">🏢 Total Clan Hashrate (TH)</label>
              <input
                type="number"
                name="total_power"
                value={inputs.total_power}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">₿ Bitcoin Mined (BTC)</label>
              <input
                type="number"
                name="btc_mined"
                value={inputs.btc_mined}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">🧱 GoMining Blocks Mined</label>
              <input
                type="number"
                name="blocks_mined"
                value={inputs.blocks_mined}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">🚀 Green Boosts</label>
              <input
                type="number"
                name="boost_green"
                value={inputs.boost_green}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">🚀 Red Boosts</label>
              <input
                type="number"
                name="boost_red"
                value={inputs.boost_red}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">🚀 Purple Boosts</label>
              <input
                type="number"
                name="boost_violet"
                value={inputs.boost_violet}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Energy Efficiency en % */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">⚡ Energy Efficiency (W/TH)</label>
              <input
                type="number"
                name="energy_efficiency"
                value={inputs.energy_efficiency}
                onChange={handleInputChange}
                placeholder="e.g. 85"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Discount en % */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">💸 Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={inputs.discount}
                onChange={handleInputChange}
                placeholder="e.g. 10"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Nouveau champ : Days spent in Miner Wars */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">⏱️ Days spent in Miner Wars</label>
              <input
                type="number"
                name="days"
                value={inputs.days}
                onChange={handleInputChange}
                placeholder="e.g. 7"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 mb-10 flex justify-center">
            <button onClick={handleSubmit} disabled={buttonState === 'loading'} className="calc-button">
              {buttonState === 'idle' && <span>💰 Calculate My Profits</span>}
              {buttonState === 'loading' && (
                <div className="flex items-center">
                  <div className="spinner-border mr-2" />
                  <span>Calculating...</span>
                </div>
              )}
              {buttonState === 'done' && (
                <div className="flex items-center">
                  <span className="checkmark mr-2">✓</span>
                  Done!
                </div>
              )}
            </button>
          </div>

          <div style={{ marginTop: '2.5rem' }} className="results-wrapper">
            <ResultsSection
              sectionType="BTC"
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src="https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=014"
                    alt="Bitcoin Logo"
                    style={{ width: '20px', height: '20px', marginRight: '1rem' }}
                  />
                  BTC Rewards
                </div>
              }
              sectionBg="bg-btc-gradient"
              cardBorder="border-gold"
              iconColor="text-gold"
              textColor="text-white"
              results={btcResults}
            />

            <ResultsSection
              sectionType="GMT"
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src="https://assets.coingecko.com/coins/images/15662/standard/GoMining_Logo.png?1714757256"
                    alt="GO Mining Token Logo"
                    style={{ width: '20px', height: '20px', marginRight: '1rem' }}
                  />
                  GMT Rewards
                </div>
              }
              sectionBg="bg-gmt-gradient"
              cardBorder="border-neon-purple"
              iconColor="text-purple-300"
              textColor="text-white"
              results={gmtResults}
            />
          </div>

          <div className="mt-6">
            <TickerTapeWidget />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;