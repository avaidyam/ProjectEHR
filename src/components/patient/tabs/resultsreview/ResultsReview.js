import React from "react";
import "./ResultsReview.css";

const ResultsReview = () => {
  const patientData = {
    triglycerides: { date: "Aug 8", value: 172, trend: "up" },
    weight: [
      { date: "Aug 8", value: "158 lb" },
      { date: "Past", value: "160 lb" },
      { date: "Older", value: "156 lb" },
    ],
    heartRate: [
      { date: "Aug 8", value: 84 },
      { date: "Past", value: 75 },
      { date: "Older", value: 75 },
    ],
    bp: [
      { date: "Aug 8", value: "130/78" },
      { date: "Past", value: "138/86", trend: "high" },
      { date: "Older", value: "136/84", trend: "high" },
    ],
    bmi: [
      { date: "Aug 8", value: 24 },
      { date: "Past", value: 23.7 },
      { date: "Older", value: 23.1 },
    ],
  };

  return (
    <div className="results-review">
      <h2>Results Review</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Aug 8</th>
            <th>Past</th>
            <th>Older</th>
          </tr>
        </thead>
        <tbody>
          {/* Triglycerides */}
          <tr className="section-header">
            <td colSpan="4">Patient Spotlight</td>
          </tr>
          <tr>
            <td>Triglycerides</td>
            <td>{patientData.triglycerides.value} {patientData.triglycerides.trend === "up" ? "🔺" : ""}</td>
            <td>170 🔺</td>
            <td>—</td>
          </tr>

          {/* Weight */}
          <tr className="section-header">
            <td colSpan="4">Vital Signs</td>
          </tr>
          <tr>
            <td>Weight</td>
            {patientData.weight.map((entry, index) => (
              <td key={index}>{entry.value}</td>
            ))}
          </tr>
          <tr>
            <td>Heart Rate</td>
            {patientData.heartRate.map((entry, index) => (
              <td key={index}>{entry.value}</td>
            ))}
          </tr>
          <tr>
            <td>BP</td>
            {patientData.bp.map((entry, index) => (
              <td key={index} className={entry.trend === "high" ? "high-value" : ""}>
                {entry.value} {entry.trend === "high" ? "🔻" : ""}
              </td>
            ))}
          </tr>
          <tr>
            <td>BMI (Calculated)</td>
            {patientData.bmi.map((entry, index) => (
              <td key={index}>{entry.value}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ResultsReview;
