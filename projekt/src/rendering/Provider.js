// MyProvider.js
import React, {useState} from 'react';
import Context from './Context';

const Provider = ({ children }) => {
  const [sharedValue, setSharedValue] = useState(false);

  const updateValue = (newValue) => {
    setSharedValue(newValue);
  };


  return (
      <Context.Provider value={{ updateValue, }}>
        {children}
      </Context.Provider>
  );
};

export default Provider;
