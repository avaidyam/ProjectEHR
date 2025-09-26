
////// THIS CODE IS HELPFUL JUST TO SEE WHAT THE LABS ARE LIKE IN JSON !!! ------------------------------------------------

// import React from 'react';
// import { Box, Typography } from '@mui/material';
// import { usePatient } from 'components/contexts/PatientContext.jsx';

// export const LabDocumentsDump = () => {
//   const { useEncounter } = usePatient();
//   const [documents] = useEncounter().documents();

//   // Filter out only the lab documents
//   const labDocs = (documents || []).filter(doc => doc.kind === 'Lab');

//   return (
//     <Box sx={{ p: 2, bgcolor: 'black', minHeight: '100vh' }}>
//       <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'white' }}>
//         Lab Documents (JSON)
//       </Typography>

//       {labDocs.length === 0 ? (
//         <Typography variant="body1" sx={{ color: 'gray' }}>
//           No lab documents found.
//         </Typography>
//       ) : (
//         labDocs.map((doc, idx) => (
//           <pre
//             key={idx}
//             style={{
//               background: 'black',
//               color: 'limegreen',
//               padding: '1rem',
//               borderRadius: '8px',
//               overflowX: 'auto',
//               fontSize: '0.9rem',
//               marginBottom: '1.5rem'
//             }}
//           >
//             {JSON.stringify(doc, null, 2)}
//           </pre>
//         ))
//       )}
//     </Box>
//   );
// };

// export default LabDocumentsDump;
// ------------------------------------------------------------------------------------------------------------------------


import React, { useMemo, useState, useCallback } from "react";
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton } from "@mui/x-data-grid";
import { Box, Grid as CoreGrid, Stack, TitledCard, Divider, Label } from "components/ui/Core.jsx";
import { LineChart } from "@mui/x-charts/LineChart";
import { usePatient } from "components/contexts/PatientContext.jsx";

const df = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const SimpleToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarFilterButton />
  </GridToolbarContainer>
);

const Caret = ({ open }) => (
  <span
    aria-hidden
    style={{
      display: "inline-block",
      transition: "transform 150ms",
      transform: open ? "rotate(90deg)" : "rotate(0deg)",
      marginRight: 6,
    }}
  >
    ▶
  </span>
);

function CategoryHeader({ label, active, open, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-expanded={open}
      style={{
        width: "100%",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 10px",
        border: active ? "1px solid #5EA1F8" : "1px solid #e0e0e0",
        background: active ? "#f4f9ff" : "white",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      <Caret open={open} /> {label}
    </button>
  );
}

// --- utils: stable bright color per test name ---
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}
function brightHSLFromName(name) {
  const h = hashCode(name) % 360; // hue across wheel
  const s = 85; // bold
  const l = 45; // bright
  return `hsl(${h} ${s}% ${l}%)`;
}

/** 🔑 Hook to normalize Lab documents into Epic-style panels */
function useNormalizedLabs() {
  const { useEncounter } = usePatient();
  const [documents] = useEncounter().documents();

  return useMemo(() => {
    const labs = (documents || []).filter((d) => d.kind === "Lab");
    const panels = {};

    for (const doc of labs) {
      const panelName = doc.data?.Test || "Unknown Panel";
      const time = doc.data?.["Date/Time"] || doc.collected;
      if (!panels[panelName]) panels[panelName] = {};

      for (const r of doc.labResults || []) {
        if (!panels[panelName][r.name]) {
          panels[panelName][r.name] = {
            name: r.name,
            unit: r.units || "",
            referenceRange:
              r.low != null || r.high != null
                ? `${r.low ?? ""} – ${r.high ?? ""}`.trim()
                : "",
            results: [],
          };
        }
        let flag = "";
        const val = Number(r.value);
        if (r.low != null && val < r.low) flag = "L";
        if (r.high != null && val > r.high) flag = "H";

        panels[panelName][r.name].results.push({
          time: new Date(time).toISOString(),
          value: val,
          flag,
        });
      }
    }

    return Object.entries(panels).map(([panelName, testsObj]) => ({
      name: panelName,
      tests: Object.values(testsObj).map((t) => ({
        ...t,
        results: t.results.sort((a, b) => new Date(a.time) - new Date(b.time)),
      })),
    }));
  }, [documents]);
}

export default function ResultsReviewEpic() {
  const labPanelsData = useNormalizedLabs();

  const [category, setCategory] = useState("Laboratory");
  const [panel, setPanel] = useState(labPanelsData[0]?.name || "");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState({
    Laboratory: true,
  });

  const [viewMode, setViewMode] = useState("table"); // "table" | "graph"
  const toggle = (name) => setExpanded((s) => ({ ...s, [name]: !s[name] }));

  const labPanels = labPanelsData.map((p) => p.name);

  const activePanel = useMemo(
    () => labPanelsData.find((p) => p.name === panel) || labPanelsData[0],
    [panel, labPanelsData]
  );

  const allTestsInPanel = activePanel?.tests || [];

  const [selectedTests, setSelectedTests] = useState(() =>
    (activePanel?.tests || []).reduce((acc, t) => ({ ...acc, [t.name]: true }), {})
  );

  React.useEffect(() => {
    setSelectedTests((prev) => {
      const base = {};
      for (const t of allTestsInPanel) base[t.name] = prev[t.name] ?? true;
      return base;
    });
  }, [panel]);

  const visibleTests = useMemo(() => {
    if (category !== "Laboratory") return [];
    const q = query.trim().toLowerCase();
    const tests = allTestsInPanel;
    return q ? tests.filter((t) => t.name.toLowerCase().includes(q)) : tests;
  }, [category, allTestsInPanel, query]);

  const timeKeysDesc = useMemo(() => {
    if (category !== "Laboratory") return [];
    const allTimes = new Set();
    visibleTests.forEach((t) => t.results.forEach((r) => allTimes.add(r.time)));
    return Array.from(allTimes)
      .sort((a, b) => new Date(b) - new Date(a))
      .slice(0, 6);
  }, [category, visibleTests]);

  const rows = useMemo(() => {
    if (category !== "Laboratory") return [];
    return visibleTests.map((t, idx) => {
      const row = { id: idx + 1, test: t.name, unit: t.unit, ref: t.referenceRange };
      timeKeysDesc.forEach((iso, i) => {
        const hit = t.results.find((r) => r.time === iso);
        row[`t${i}`] = hit ? `${hit.value}${hit.flag ? " " + hit.flag : ""}` : "—";
      });
      return row;
    });
  }, [category, visibleTests, timeKeysDesc]);

  const columns = useMemo(() => {
    if (category !== "Laboratory") return [];
    const staticCols = [
      { field: "test", headerName: "Test", flex: 1.2, sortable: false },
      { field: "unit", headerName: "Unit", width: 120, sortable: false },
      { field: "ref", headerName: "Reference", width: 140, sortable: false },
    ];
    const timeCols = timeKeysDesc.map((iso, i) => ({
      field: `t${i}`,
      headerName: df.format(new Date(iso)),
      width: 160,
      sortable: false,
    }));
    return [...staticCols, ...timeCols];
  }, [timeKeysDesc, category]);

  const graphDataAsc = useMemo(() => {
    if (category !== "Laboratory") return [];
    const timesAsc = [...timeKeysDesc].sort((a, b) => new Date(a) - new Date(b));
    return timesAsc.map((iso) => {
      const row = { time: iso };
      for (const t of visibleTests) {
        const hit = t.results.find((r) => r.time === iso);
        row[t.name] = hit ? hit.value : null;
      }
      return row;
    });
  }, [category, timeKeysDesc, visibleTests]);

  const toggleTest = useCallback((name) => {
    setSelectedTests((s) => ({ ...s, [name]: !s[name] }));
  }, []);

  const ToggleButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      style={{
        padding: "6px 10px",
        border: active ? "2px solid #111" : "1px solid #cfcfcf",
        background: active ? "#eaf2ff" : "#fff",
        fontWeight: 600,
        borderRadius: 6,
        cursor: "pointer",
        minWidth: 72,
      }}
    >
      {children}
    </button>
  );

  const RightSelector = () => (
    <div style={{ width: 260, borderLeft: "1px solid #e0e0e0", paddingLeft: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Series</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {visibleTests.map((t) => (
          <label key={t.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={!!selectedTests[t.name]}
              onChange={() => toggleTest(t.name)}
            />
            <span
              style={{
                display: "inline-block",
                width: 14,
                height: 14,
                borderRadius: 3,
                background: brightHSLFromName(t.name),
                border: "1px solid #00000020",
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</span>
          </label>
        ))}
      </div>
      <Divider sx={{ my: 1 }} />
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Reference bar</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {visibleTests.map((t) => (
          <div key={t.name} style={{ fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 24,
                  height: 6,
                  background: brightHSLFromName(t.name),
                  borderRadius: 2,
                  display: "inline-block",
                }}
              />
              <b>{t.name}</b>
            </div>
            <div style={{ opacity: 0.8, marginTop: 4 }}>
              Ref: <code>{t.referenceRange}</code> {t.unit && `(${t.unit})`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Box sx={{ ml: 2, mt: 2 }}>
      <TitledCard emphasized title="Results Review" color="#5EA1F8">
        <CoreGrid container spacing={2}>
          {/* LEFT: Navigator */}
          <CoreGrid item xs={12} sm={4} md={3} lg={3}>
            <Box
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 0,
                padding: 0.5,
                mr: 2,
                height: "100%",
              }}
            >
              <Stack direction="column" spacing={0}>
                {/* Search */}
                <div>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tests..."
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 0,
                      border: "1px solid #e0e0e0",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Laboratory section */}
                <div>
                  <CategoryHeader
                    label="Laboratory"
                    active={category === "Laboratory"}
                    open={expanded.Laboratory}
                    onClick={() => {
                      setCategory("Laboratory");
                      toggle("Laboratory");
                    }}
                  />
                  {expanded.Laboratory && (
                    <div style={{ marginTop: 8, paddingLeft: 18 }}>
                      <Label variant="body2">
                        <b>Panels</b>
                      </Label>
                      <Stack direction="column" spacing={0}>
                        {labPanels.map((p) => (
                          <button
                            key={p}
                            onClick={() => {
                              setCategory("Laboratory");
                              setPanel(p);
                            }}
                            style={{
                              textAlign: "left",
                              padding: "8px 10px",
                              borderRadius: 0,
                              border:
                                panel === p && category === "Laboratory"
                                  ? "1px solid #5EA1F8"
                                  : "1px solid #e0e0e0",
                              background:
                                panel === p && category === "Laboratory" ? "#f4f9ff" : "white",
                              fontWeight: panel === p ? 600 : 400,
                              cursor: "pointer",
                            }}
                          >
                            {p}
                          </button>
                        ))}
                      </Stack>
                    </div>
                  )}
                </div>
              </Stack>
            </Box>
          </CoreGrid>

          {/* RIGHT: Content */}
          <CoreGrid item xs={12} sm={8} md={9} lg={9}>
            {category === "Laboratory" && (
              <>
                <div
                  style={{
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    {panel} • {visibleTests.length} tests • {timeKeysDesc.length} time points
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <ToggleButton active={viewMode === "table"} onClick={() => setViewMode("table")}>
                      Lab
                    </ToggleButton>
                    <ToggleButton active={viewMode === "graph"} onClick={() => setViewMode("graph")}>
                      Graph
                    </ToggleButton>
                  </div>
                </div>

                {viewMode === "table" && (
                  <>
                    <div style={{ width: "100%" }}>
                      <DataGrid
                        rows={rows}
                        columns={columns}
                        slots={{ toolbar: SimpleToolbar }}
                        autoHeight
                        disableRowSelectionOnClick
                        pageSizeOptions={[5, 10, 25]}
                        initialState={{
                          pagination: { paginationModel: { pageSize: 10, page: 0 } },
                        }}
                      />
                    </div>
                    <Divider sx={{ my: 1 }} />
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      Flags: H = High, L = Low. Reference ranges are general and for demo only.
                    </div>
                  </>
                )}

                {viewMode === "graph" && (
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flex: 1, minHeight: 320 }}>
                      <div style={{ height: 360, width: "100%", border: "1px solid #e0e0e0" }}>
                        <LineChart
                          height={360}
                          dataset={graphDataAsc}
                          xAxis={[
                            {
                              dataKey: "time",
                              scaleType: "band",
                              valueFormatter: (iso) =>
                                new Intl.DateTimeFormat("en-US", {
                                  month: "short",
                                  day: "2-digit",
                                }).format(new Date(iso)),
                            },
                          ]}
                          yAxis={[{}]}
                          grid={{ vertical: true, horizontal: true }}
                          slotProps={{
                            xAxis: { tickLabelStyle: { fontSize: 12 } },
                            yAxis: { tickLabelStyle: { fontSize: 12 } },
                          }}
                          series={visibleTests
                            .filter((t) => selectedTests[t.name])
                            .map((t) => ({
                              dataKey: t.name,
                              color: brightHSLFromName(t.name),
                              curve: "linear",
                              showMark: true,
                              connectNulls: true,
                              strokeWidth: 3,
                            }))}
                          margin={{ top: 16, right: 16, left: 48, bottom: 28 }}
                        />
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
                        Tip: Use the checkboxes to include/exclude rows (tests). Colors are stable
                        per test.
                      </div>
                    </div>
                    <RightSelector />
                  </div>
                )}
              </>
            )}
          </CoreGrid>
        </CoreGrid>
      </TitledCard>
    </Box>
  );
}
