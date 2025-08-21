// Central API base for all frontend network calls
// Set VITE_API_BASE in env for production (e.g., https://api.example.com)
// Default to '/api' for local dev/proxy setups
const rawBase = import.meta.env?.VITE_API_BASE ?? '/api'
export const API_BASE = String(rawBase || '/api').replace(/\/$/, '')


