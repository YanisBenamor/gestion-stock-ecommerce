/**
 * Utility for API calls with Sanctum authentication token.
 * Retrieves token from localStorage and adds it to request headers.
 */
import useSWR from 'swr';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const getAuthToken = () => {
  return localStorage.getItem("auth_token");
};

export const setAuthToken = (token) => {
  localStorage.setItem("auth_token", token);
};

export const clearAuthToken = () => {
  localStorage.removeItem("auth_token");
};

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};

export const apiGet = async (endpoint) => {
  const response = await fetchWithAuth(endpoint);
  return response.json();
};

export const apiPost = async (endpoint, data) => {
  const isFormData = data instanceof FormData;
  const response = await fetchWithAuth(endpoint, {
    method: "POST",
    body: isFormData ? data : JSON.stringify(data),
  });

  const payload = await response.json();
  if (payload && typeof payload === "object") {
    return { ...payload, status: response.status, ok: response.ok };
  }

  return { data: payload, status: response.status, ok: response.ok };
};

export const apiPut = async (endpoint, data) => {
  const isFormData = data instanceof FormData;
  const response = await fetchWithAuth(endpoint, {
    method: "PUT",
    body: isFormData ? data : JSON.stringify(data),
  });

  const payload = await response.json();
  if (payload && typeof payload === "object") {
    return { ...payload, status: response.status, ok: response.ok };
  }

  return { data: payload, status: response.status, ok: response.ok };
};

/**
 * SWR Fetcher avec authentification
 * Reçoit l'URL COMPLÈTE et y ajoute le token Bearer
 */
export const swrFetcher = async (fullUrl) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const error = new Error(`API Error: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
};

/**
 * Hook personnalisé pour SWR avec configuration optimisée
 * Affiche les données en cache immédiatement et revalide en arrière-plan
 */
export const useFetchData = (endpoint) => {
  const { data, error, isLoading, mutate } = useSWR(
    endpoint ? `${API_BASE_URL}${endpoint}` : null,
    swrFetcher,
    {
      revalidateOnFocus: false, // Ne pas revalider au focus
      revalidateOnReconnect: true, // Revalider si reconnexion
      dedupingInterval: 60000, // 1 minute de déduplication
      focusThrottleInterval: 300000, // 5 minutes entre les revalidations
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  // Gérer la structure de pagination: { data: [...], ... } ou directement [...]
  let formattedData = [];
  if (data) {
    if (Array.isArray(data)) {
      formattedData = data;
    } else if (data.data && Array.isArray(data.data)) {
      // Structure paginée: { data: [...], links: {...}, ... }
      formattedData = data.data;
    } else if (typeof data === 'object') {
      // Réponse unique non-array
      formattedData = [data];
    }
  }

  return {
    data: formattedData,
    isLoading,
    error,
    mutate,
  };
};
