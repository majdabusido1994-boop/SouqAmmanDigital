// Central configuration for the app
const PRODUCTION_URL = 'https://souq-amman-digital-api.onrender.com';
const LOCAL_URL = 'http://192.168.100.236:5000';

// Use production URL for deployed app, local for development
export const API_BASE = PRODUCTION_URL;
export const API_URL = `${API_BASE}/api`;
