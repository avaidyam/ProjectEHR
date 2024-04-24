import React from 'react';
import { registerRenderer } from '@jsonforms/core';

const SurgicalHistoryTabRenderer = ({ schema, uischema, path }) => {
  // Retrieve data from JSONForms state
  const data = uischema.scope;

  // Assuming 'data' contains an array of surgical history items
  const surgicalHistory = data[path] || [];

  return (
    <table>
      <thead>
        <tr>
          <th>Procedure</th>
          <th>Laterality</th>
          <th>Date</th>
          <th>Age</th>
          <th>Comment</th>
          <th>Chart Link</th>
        </tr>
      </thead>
      <tbody>
        {surgicalHistory.map((item, index) => (
          <tr key={index}>
            <td>{item.procedure}</td>
            <td>{item.laterality}</td>
            <td>{item.date}</td>
            <td>{item.age}</td>
            <td>{item.comment}</td>
            <td>{item.chartLink}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SurgicalHistoryTabRenderer;

