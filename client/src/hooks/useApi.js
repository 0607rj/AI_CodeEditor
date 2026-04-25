// client/src/hooks/useApi.js
// Custom hook for API calls with loading, error, and data states
// WHY: Eliminates boilerplate try/catch/loading/error in every component.
// Every component that calls an API uses this hook.

import { useState, useCallback } from 'react';

/**
 * Generic hook for async API operations
 * @returns {{ data, loading, error, execute, reset }}
 */
export const useApi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};

export default useApi;
