import React, { useState } from 'react';
import ChartReviewDataContent from './ChartReviewDataContent.js';


const columns = ['Patient Sharing', 'Ordered', 'Status','Status Date', 'Accension #', 'Exam', 'Abnormal', 'Acuity', 'Encounter', 'Provider'];
const dummyImagingData = [
    {
      patientSharing: 'Shared',
      orderedDate: '01-03-2023',
      status: 'Final Result',
      statusDate: '01-04-2023',
      accessionNumber: '123456',
      exam: 'MRI Brain',
      abnormal: 'No',
      acuity: 'Normal',
      encounter: 'Diagnostic Imaging Encounter 1',
      provider: 'Imaging Provider 1',
    },
    {
      patientSharing: 'Not Shared',
      orderedDate: '02-03-2023',
      status: 'Final Result',
      statusDate: '02-04-2023',
      accessionNumber: '789012',
      exam: 'X-Ray Chest',
      abnormal: 'Yes',
      acuity: 'Moderate',
      encounter: 'Diagnostic Imaging Encounter 2',
      provider: 'Imaging Provider 2',
    },
    // Add more dummy data as needed
  ];
  

const ImagingContent = ({ value, index, patientMRN, ...other }) => {

  const [selectedRowData, setSelectedRowData] = useState(null);
  const [isRowClicked, setIsRowClicked] = useState(false);

  const handleRowClick = (row) => {
    setSelectedRowData(row);
    setIsRowClicked(true);
  };

  return (
    <div hidden={value !== index} className="tab-content-container">
      <div className="table-container">
        <ChartReviewDataContent columns={columns} data={dummyImagingData} selectedRowData={selectedRowData} onRowClick={handleRowClick} />
      </div>
      {isRowClicked && (
          <div>Default Text</div>
      )}
    </div>
  );
};

export default ImagingContent;