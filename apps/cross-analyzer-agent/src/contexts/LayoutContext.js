import React, { createContext, useState, useContext } from 'react';

const LayoutContext = createContext();

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider = ({ children }) => {
  const [isNavBarVisible, setIsNavBarVisible] = useState(true);

  const value = {
    isNavBarVisible,
    setIsNavBarVisible,
  };

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
};
