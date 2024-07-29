import React, { createContext, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectContext = createContext();

export const RedirectProvider = ({ children }) => {
  const navigate = useNavigate();

  const redirect = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  return (
    <RedirectContext.Provider value={redirect}>
      {children}
    </RedirectContext.Provider>
  );
};

export const useRedirect = () => useContext(RedirectContext);
