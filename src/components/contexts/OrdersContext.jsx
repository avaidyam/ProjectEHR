import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const OrderContext = createContext();
export class Drug {
  constructor(type, name, dose, freq, route, refill, startDate) {
    this.type = type;
    this.name = name;
    this.dose = dose;
    this.freq = freq;
    this.route = route;
    this.refill = refill;
    this.startDate = startDate;
  }
}

export const OrderProvider = ({ children }) => {
  const [tempMed, setTempMed] = useState(null);
  const [openSearchList, setOpenSearchList] = useState(false);
  const [openOrder, setOpenOrder] = useState(false);
  const [data, setData] = useState([]);
  const [value, setValue] = useState('');
  const [name, setName] = useState('');
  const [route, setRoute] = useState('');
  const [dose, setDose] = useState('');
  const [freq, setFreq] = useState('');
  const [refill, setRefill] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [classCollect, setClass] = useState('');

  // for future labs only: expected date & expired date of lab order
  const [expectDate, setExpectDate] = useState(0);
  const [expireDate, setExpireDate] = useState(90);

  // for standing labs only: interval (how often) & count (# of times)
  const [interval, setInterval] = useState(30);
  const [count, setCount] = useState(1);

  // list of orders that are pending/waiting to be signed
  const [orderList, setOrderList] = useState([]);

  // action for signing orders
  const submitOrder = () => {
    // some code on submitting order (will fill this in the future), then empty the templist
    setOrderList([]);
  };

  const openOrderDialog = (med) => {
    setTempMed(med);
    setOpenOrder(true);
  }

  const closeOrder = useCallback((save) => {
    setOpenOrder(false);
    if (save) {
      orderList.push(new Drug('New', name, dose, `${freq}`, `${route}`, refill));
    }
    setName('');
    setRoute('');
    setDose('');
    setRefill('');
    setType('');
    setStatus('');
    setPriority('');
    setClass('');
  }, [name, route, dose, freq, refill, orderList]);

  // Memoize the value object
  const mem = useMemo(() => ({ tempMed, setTempMed, openSearchList, setOpenSearchList, openOrder, setOpenOrder, 
    data, setData, value, setValue, name, setName, route, setRoute, dose, setDose, freq, setFreq, refill, setRefill, 
    type, setType, status, setStatus, priority, setPriority, classCollect, setClass,
    expectDate, setExpectDate, expireDate, setExpireDate, interval, setInterval, count, setCount, orderList, setOrderList,
    submitOrder, closeOrder, openOrderDialog
  }), 
    [tempMed, openSearchList, openOrder, data, value, name, route, dose, freq, refill, type, status, priority, classCollect, expectDate, expireDate, interval, 
      count, orderList, closeOrder
    ]);

  return (
    <OrderContext.Provider value={mem}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
