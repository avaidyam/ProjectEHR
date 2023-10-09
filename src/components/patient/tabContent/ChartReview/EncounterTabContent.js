import React, { useState } from 'react';
import ChartReviewDataContent from './ChartReviewDataContent.js';

const encounterColumns = [
    'Summary',
    'Type',
    'Enc Closed',
    'With',
    'Description',
    'Disch Date',
    'CSN',
  ];


const dummyData = [
    {
      summary: 'Summary 1',
      type: 'Type',
      encClosed: 'Yes',
      with: 'Doctor Anthony Fauci',
      description: 'Former NIAID Director',
      dischData: '01-01-2023',
      csn: 'CSN12345',
    },
    {
      summary: 'Summary 2',
      type: 'Type',
      encClosed: 'No',
      with: 'Doctor Vivek Murthy',
      description: '21st Surgeon General',
      dischData: '02-01-2023',
      csn: 'CSN67890',
    },
    // Add more dummy data as needed
  ];


const EncounterTabContent = ({ value, index, patientMRN, ...other }) => {

  const [selectedRowData, setSelectedRowData] = useState(null);
  const [isRowClicked, setIsRowClicked] = useState(false);

  const handleRowClick = (row) => {
    setSelectedRowData(row);
    setIsRowClicked(true);
  };

  return (
    <div hidden={value !== index} className="tab-content-container">
      <div className="table-container">
        <ChartReviewDataContent columns={encounterColumns} data={dummyData} selectedRowData={selectedRowData} onRowClick={handleRowClick} />
      </div>
      {isRowClicked && (
          <div>Default Text</div>
      )}
    </div>
  );
};

export default EncounterTabContent;