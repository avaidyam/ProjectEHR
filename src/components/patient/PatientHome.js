import React from 'react';
import TabControl from './TabControl.js';
import PatientSidebar from './sidebar/PatientSidebar.js';
import Orders from './Orders.js'
import './PatientHome.css';

const PatientHome = () => {
  return (
    <div style={{ display: "flex" }} className="patient-home-container">
      <PatientSidebar />
      <div style={{ display: 'flex', flexDirection: "column", flex: 3 }}>
        <TabControl />
        <div style={{ display: "flex", flexDirection: "row", height: 80, alignItems: 'center', justifyContent: "left", backgroundColor: "gray", width: "100%", zIndex: 100 }}>
          <Orders />
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
