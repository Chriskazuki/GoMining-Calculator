import React, { useEffect, useState } from 'react';

interface GmtPriceData {
  'gmt-token': {
    usd: number;
  };
}

const GMTPriceWidget: React.FC = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGmtPrice = async () => {
      try {
        setError(null);
        setLoading(true);

        // Récupère le prix du GoMining (GMT) en USD
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=gmt-token&vs_currencies=usd'
        );
        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data: GmtPriceData = await response.json();
        setPrice(data['gmt-token'].usd);
      } catch (err: any) {
        setError(
          err.message ||
            "Une erreur est survenue lors de la récupération du prix GMT."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGmtPrice();
  }, []);

  // Pendant le chargement
  if (loading) {
    return (
      <p style={{ marginTop: '1rem', textAlign: 'center', color: '#4A5568' }}>
        Chargement du prix GMT…
      </p>
    );
  }

  // En cas d'erreur
  if (error) {
    return (
      <p
        style={{
          marginTop: '1rem',
          textAlign: 'center',
          color: '#E53E3E',
          fontWeight: 'bold',
        }}
      >
        {error}
      </p>
    );
  }

  // Styles inline
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
  };

  const pillStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#B19CD9', // Violet clair (modifiable)
    borderRadius: '9999px',     // Bout arrondi
    padding: '0.5rem 1rem',
  };

  const iconCircleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '9999px',
    backgroundColor: '#FFFFFF',
    margin: '0 4px',
  };

  const iconStyle: React.CSSProperties = {
    width: '14px',
    height: '14px',
  };

  // Texte en blanc, gras
  const textStyle: React.CSSProperties = {
    color: '#FFFFFF',
    fontWeight: 'bold',
  };

  return (
    <div style={containerStyle}>
      <div style={pillStyle}>
        {/* "1" en blanc */}
        <span style={textStyle}>1</span>

        {/* Cercle blanc avec l'icône GoMining */}
        <div style={iconCircleStyle}>
          <img
            // URL de l'icône GMT : vous pouvez la remplacer par une source plus appropriée
            src="https://assets.coingecko.com/coins/images/15662/standard/GoMining_Logo.png?1714757256"
            alt="GoMining (GMT)"
            style={iconStyle}
          />
        </div>

        {/* "= $xxx" */}
        <span style={textStyle}>
        {price !== null ? `= $${price.toFixed(4)}` : 'N/A'}
        </span>
      </div>
    </div>
  );
};

export default GMTPriceWidget;