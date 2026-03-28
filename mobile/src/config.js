// Central configuration for the app
// Update PRODUCTION_URL before deploying to app stores

const DEV_URL = 'http://192.168.100.236:5000';
const PRODUCTION_URL = 'https://souq-amman-digital-api.onrender.com';

export const API_BASE = __DEV__ ? DEV_URL : PRODUCTION_URL;
export const API_URL = `${API_BASE}/api`;
