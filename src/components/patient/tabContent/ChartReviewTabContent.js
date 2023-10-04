import React from 'react';

const ChartReviewTabContent = ({ children, value, index, ...other }) => {
  return (
    <div hidden={value !== index} className="tab-content-container">
      chart review stuff goes here
    </div>
  );
};

export default ChartReviewTabContent;
