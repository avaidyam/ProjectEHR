import React, { useState } from 'react';
import ChartReviewDataContent from './ChartReviewDataContent.js';


const columns = [
    'Summary',
    'Filing Date',
    'Enc Date',
    'Enc Dept',
    'Author',
    'Enc Type',
    'Category',
    'Status',
    'Tag',
    'Encounter Provider',
    'Note Type',
  ];
  
  const dummyNoteData = [
    {
      summary: 'Note Summary 1',
      filingDate: '01-02-2023',
      encDate: '01-01-2023',
      encDept: 'Dept A',
      author: 'Author 1',
      encType: 'Type A',
      category: 'Category A',
      status: 'Active',
      tag: 'Tag A',
      encounterProvider: 'Provider 1',
      noteType: 'Type A',
    },
    {
      summary: 'Note Summary 2',
      filingDate: '02-02-2023',
      encDate: '02-01-2023',
      encDept: 'Dept B',
      author: 'Author 2',
      encType: 'Type B',
      category: 'Category B',
      status: 'Inactive',
      tag: 'Tag B',
      encounterProvider: 'Provider 2',
      noteType: 'Type B',
    },
    // Add more dummy data as needed
  ];
  

const NoteTabContent = ({ value, index, patientMRN, ...other }) => {

  const [selectedRowData, setSelectedRowData] = useState(null);
  const [isRowClicked, setIsRowClicked] = useState(false);

  const handleRowClick = (row) => {
    setSelectedRowData(row);
    setIsRowClicked(true);
  };

  return (
    <div hidden={value !== index} className="tab-content-container">
      <div className="table-container">
        <ChartReviewDataContent columns={columns} data={dummyNoteData} selectedRowData={selectedRowData} onRowClick={handleRowClick} />
      </div>
      {isRowClicked && (
          <div>Default Text</div>
      )}
    </div>
  );
};

export default NoteTabContent;