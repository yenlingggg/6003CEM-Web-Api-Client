// client/src/pages/Home.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';
import TopCoinsTable from '../components/TopCoinsTable';
import LoadingSpinner from '../components/LoadingSpinner';
import './Home.css';

export default function Home() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // State for the search bar / selected coin
  const [coinIdInput, setCoinIdInput] = useState('');
  const [coinData, setCoinData]     = useState(null);
  const [headline, setHeadline]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [saved, setSaved]           = useState(false);

  // Redirect to /login if no token
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Reset when input cleared
  useEffect(() => {
    if (coinIdInput.trim() === '') {
      setCoinData(null);
      setHeadline(null);
      setSaved(false);
      setError('');
    }
  }, [coinIdInput]);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = coinIdInput.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setCoinData(null);
    setHeadline(null);
    setSaved(false);

    try {
      const priceResp = await api.get(`/coins/search-price/${trimmed}`);
      const data = priceResp.data;
      setCoinData(data);

      const newsResp = await api.get(`/coins/search-news/${data.symbol}`);
      setHeadline(newsResp.data.headline);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load coin data.');
    } finally {
      setLoading(false);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!coinData) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/coins', { coinId: coinData.coinId });
      setSaved(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to save coin');
    } finally {
      setLoading(false);
    }
  };

  // derive icon symbol
  const iconSym = coinData?.symbol?.toLowerCase();

  return (
    <div className="home-container">
      {loading && <LoadingSpinner />}
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for a coin (e.g. btc-bitcoin)…"
          value={coinIdInput}
          onChange={(e) => setCoinIdInput(e.target.value)}
          disabled={loading}
          className="search-input"
        />
        <button
          type="submit"
          disabled={loading || !coinIdInput.trim()}
          className="search-button"
        >
          {loading ? 'Loading…' : 'Search'}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}

      {coinData && (
        <section className="coin-details-section">
          <div className="coin-details-header">
            {iconSym && (
              <img
                src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.16.1/128/color/${iconSym}.png`}
                alt={coinData.symbol}
                className="coin-logo"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
            <h2 className="coin-details-title">
              {coinData.name} ({coinData.symbol})
            </h2>
          </div>

          <div className="coin-cards">
            <div className="coin-card">
              <p className="card-label">Price</p>
              <p className="card-value">
                {typeof coinData.price === 'number'
                  ? `$${coinData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '–'}
              </p>
            </div>
            <div className="coin-card">
              <p className="card-label">24h Change</p>
              <p
                className="card-value"
                style={{
                  color: typeof coinData.change24h === 'number'
                    ? coinData.change24h >= 0 ? '#4ade80' : '#f87171'
                    : '#e5e7eb'
                }}
              >
                {typeof coinData.change24h === 'number'
                  ? (coinData.change24h >= 0
                      ? `▲${coinData.change24h.toFixed(2)}%`
                      : `▼${Math.abs(coinData.change24h).toFixed(2)}%`)
                  : '–'}
              </p>
            </div>
            <div className="coin-card">
              <p className="card-label">Market Cap</p>
              <p className="card-value">
                {typeof coinData.marketCap === 'number'
                  ? `$${coinData.marketCap.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                  : '–'}
              </p>
            </div>
          </div>

          {!saved ? (
            <button
              onClick={handleSave}
              disabled={loading}
              className="save-button"
            >
              {loading ? 'Saving…' : 'Save to Favorites'}
            </button>
          ) : (
            <p className="saved-confirmation">Saved to your favorites! 🎉</p>
          )}

          {headline && (
            <div className="related-news">
              <h3>Related News</h3>
              <div className="news-item">
                {headline.imageUrl && <img src={headline.imageUrl} alt="news" className="news-image" />}
                <div className="news-text">
                  <h4 className="news-title">{headline.title}</h4>
                  {headline.description && <p className="news-desc">{headline.description}</p>}
                  <a href={headline.url} target="_blank" rel="noopener noreferrer" className="news-link">Read more</a>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <TopCoinsTable limit={10} />

      
    </div>
  );
}
