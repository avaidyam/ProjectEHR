import React from 'react';

const ChartReviewTabContent = ({ children, value, index, patientMRN, ...other }) => {
  return (
    <div hidden={value !== index} className="tab-content-container">
      chart review stuff goes here {patientMRN}
    </div>
  );
};

export default ChartReviewTabContent;
