import React, { useState } from "react";
import DataSheet from "react-datasheet";
import "react-datasheet/lib/react-datasheet.css";
import "./components/Results.css";

const ResultsReview = () => {
  const [grid, setGrid] = useState([
    [
      { value: "Category", readOnly: true },
      { value: "Aug 8", readOnly: true },
      { value: "Past", readOnly: true },
      { value: "Older", readOnly: true },
    ],
    [{ value: "Patient Spotlight", readOnly: true }],
    [
      { value: "Triglycerides", readOnly: true },
      { value: 172 },
      { value: 170 },
      { value: "—" },
    ],
    [{ value: "Vital Signs", readOnly: true }],
    [
      { value: "Weight", readOnly: true },
      { value: "158 lb" },
      { value: "160 lb" },
      { value: "156 lb" },
    ],
    [
      { value: "Heart Rate", readOnly: true },
      { value: 84 },
      { value: 75 },
      { value: 75 },
    ],
    [
      { value: "BP", readOnly: true },
      { value: "130/78" },
      { value: "138/86" },
      { value: "136/84" },
    ],
    [
      { value: "BMI (Calculated)", readOnly: true },
      { value: 24 },
      { value: 23.7 },
      { value: 23.1 },
    ],
  ]);

  return (
    <div className="results-review">
      <h2>Results Review</h2>
      <DataSheet
        data={grid}
        valueRenderer={(cell) => cell.value}
        onCellsChanged={(changes) => {
          const newGrid = grid.map((row) => [...row]);
          changes.forEach(({ cell, row, col, value }) => {
            newGrid[row][col] = { ...cell, value };
          });
          setGrid(newGrid);
        }}
      />
    </div>
  );
};

export default ResultsReview;