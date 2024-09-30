import React, { createContext, useContext, useState, useMemo } from 'react';

// Create a Context
const OrderContext = createContext();

class Drug {
    constructor(type, name, dose, sig, refill) {
      this.type = type;
      this.name = name;
      this.dose = dose;
      this.sig = sig;
      this.refill = refill;
    }
  }


// Create a Context Provider component
export const OrderProvider = ({ children }) => {
  const [orderList, setOrderList] = useState([]);

  // Add a new order
  const addOrder = (order) => {
    setOrderList((prevOrders) => [...prevOrders, order]);
  };
  

  const removeOrder = (orderToRemove) => {
    setOrderList(prevOrders => prevOrders.filter(order => order !== orderToRemove));
  };

  // Memoize the value object
  const value = useMemo(() => ({ orderList, addOrder, removeOrder, setOrderList}), [orderList]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

// Custom hook for using the Order context
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export {Drug};
