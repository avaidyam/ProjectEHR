import React from "react";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import useMediaQuery from "@mui/material/useMediaQuery";
import { usePatientLists } from "../../../components/contexts/PatientListContext";

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
function formatTime(date) {
  return new Date(date).toLocaleTimeString();
}

export default function PrintPreview({ open, onClose, refreshedAt, printedBy }) {
  const isSmall = useMediaQuery("(max-width:600px)");
  const { lists, selectedListId } = usePatientLists();
  const patientList = lists.find(list => list.id === selectedListId)?.patients || [];

  const currentDate = formatDate(Date.now());
  const currentTime = formatTime(Date.now());

  // Pagination: 4 patients per page
  const patientsPerPage = 4;
  const pages = [];
  for (let i = 0; i < patientList.length; i += patientsPerPage) {
    pages.push(patientList.slice(i, i + patientsPerPage));
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <div style={{
        padding: isSmall ? 8 : 32,
        background: "#fff",
        minHeight: isSmall ? 300 : 500,
        fontFamily: "Roboto, Arial, sans-serif"
      }}>
        {pages.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <strong>No patients to display.</strong>
          </div>
        )}
        {pages.map((patients, pageIdx) => (
          <div key={pageIdx} style={{ pageBreakAfter: "always", marginBottom: 32 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <strong>{currentDate}</strong>
                <br />
                Last refreshed: {formatDate(refreshedAt)}
              </div>
            </div>
            {/* Grid Table */}
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 32,
              fontSize: isSmall ? 12 : 16
            }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}>Room/Bed</th>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}>Patient Name (MRN)</th>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}>Age/Gender</th>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}>Admission Date</th>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}>Code Status</th>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}></th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p, idx) => (
                  <tr key={p.id || idx}>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>{p.roomBed || ""}</td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      {p.name} ({p.mrn})
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      {p.age} / {p.gender}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      {formatDate(p.admissionDate)}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>{p.codeStatus}</td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: isSmall ? 12 : 14 }}>
              <div>Page {pageIdx + 1}</div>
              <div>
                Print by {printedBy} on {currentTime}
              </div>
            </div>
          </div>
        ))}
        <Button onClick={onClose} style={{ marginTop: 16 }}>Close</Button>
      </div>
    </Dialog>
  );
}