import React, { useMemo, useState, useCallback } from "react";
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton } from "@mui/x-data-grid";
import { Box, Grid as CoreGrid, Stack, TitledCard, Divider, Label } from "components/ui/Core.jsx";
import { LineChart } from "@mui/x-charts/LineChart";

/** ---------------------------
 * Mock JSON: Epic-style data
 * --------------------------- */
const MOCK_RESULTS = {
  laboratory: {
    panels: [
      {
        name: "Lipids",
        tests: [
          {
            name: "Triglycerides",
            unit: "mg/dL",
            referenceRange: "< 150",
            results: [
              { time: "2025-08-08T09:15:00Z", value: 172, flag: "H" },
              { time: "2025-06-10T08:30:00Z", value: 170, flag: "H" },
              { time: "2025-03-02T07:40:00Z", value: 130, flag: "" },
            ],
          },
          {
            name: "Total Cholesterol",
            unit: "mg/dL",
            referenceRange: "< 200",
            results: [
              { time: "2025-08-08T09:15:00Z", value: 208, flag: "H" },
              { time: "2025-06-10T08:30:00Z", value: 195, flag: "" },
              { time: "2025-03-02T07:40:00Z", value: 188, flag: "" },
            ],
          },
          {
            name: "LDL (calc)",
            unit: "mg/dL",
            referenceRange: "< 100",
            results: [
              { time: "2025-08-08T09:15:00Z", value: 132, flag: "H" },
              { time: "2025-06-10T08:30:00Z", value: 118, flag: "H" },
              { time: "2025-03-02T07:40:00Z", value: 110, flag: "H" },
            ],
          },
          {
            name: "HDL",
            unit: "mg/dL",
            referenceRange: "> 40",
            results: [
              { time: "2025-08-08T09:15:00Z", value: 46, flag: "" },
              { time: "2025-06-10T08:30:00Z", value: 44, flag: "" },
              { time: "2025-03-02T07:40:00Z", value: 50, flag: "" },
            ],
          },
        ],
      },
      {
        name: "Chemistry",
        tests: [
          {
            name: "Glucose (Fasting)",
            unit: "mg/dL",
            referenceRange: "70–99",
            results: [
              { time: "2025-08-08T09:15:00Z", value: 102, flag: "H" },
              { time: "2025-06-10T08:30:00Z", value: 96, flag: "" },
              { time: "2025-03-02T07:40:00Z", value: 92, flag: "" },
            ],
          },
          {
            name: "Creatinine",
            unit: "mg/dL",
            referenceRange: "0.6–1.3",
            results: [
              { time: "2025-08-08T09:15:00Z", value: 1.0, flag: "" },
              { time: "2025-06-10T08:30:00Z", value: 1.1, flag: "" },
              { time: "2025-03-02T07:40:00Z", value: 1.0, flag: "" },
            ],
          },
          {
            name: "eGFR",
            unit: "mL/min/1.73m²",
            referenceRange: "≥ 60",
            results: [
              { time: "2025-08-08T09:15:00Z", value: 78, flag: "" },
              { time: "2025-06-10T08:30:00Z", value: 76, flag: "" },
              { time: "2025-03-02T07:40:00Z", value: 80, flag: "" },
            ],
          },
        ],
      },
      {
        name: "Hematology",
        tests: [
          {
            name: "Hemoglobin",
            unit: "g/dL",
            referenceRange: "13.5–17.5",
            results: [
              { time: "2025-08-08T09:15:00Z", value: 14.2, flag: "" },
              { time: "2025-06-10T08:30:00Z", value: 13.9, flag: "" },
              { time: "2025-03-02T07:40:00Z", value: 14.6, flag: "" },
            ],
          },
          {
            name: "WBC",
            unit: "10^3/µL",
            referenceRange: "4.5–11.0",
            results: [
              { time: "2025-08-08T09:15:00Z", value: 6.8, flag: "" },
              { time: "2025-06-10T08:30:00Z", value: 5.9, flag: "" },
              { time: "2025-03-02T07:40:00Z", value: 7.2, flag: "" },
            ],
          },
          {
            name: "Platelets",
            unit: "10^3/µL",
            referenceRange: "150–450",
            results: [
              { time: "2025-08-08T09:15:00Z", value: 210, flag: "" },
              { time: "2025-06-10T08:30:00Z", value: 198, flag: "" },
              { time: "2025-03-02T07:40:00Z", value: 225, flag: "" },
            ],
          },
        ],
      },
    ],
  },
  radiology: [
    {
      date: "2025-07-01T14:10:00Z",
      modality: "CT",
      name: "CT Chest w/ Contrast",
      impression: "No acute cardiopulmonary process. Stable pulmonary nodule (4mm).",
    },
    {
      date: "2025-04-11T10:25:00Z",
      modality: "XR",
      name: "Chest X-ray PA/LAT",
      impression: "No focal consolidation. Mild bronchitic changes.",
    },
  ],
  cardiology: [
    {
      date: "2025-05-20T09:00:00Z",
      type: "ECG",
      summary: "Normal sinus rhythm, rate 74 bpm, no acute ST-T wave changes.",
    },
    {
      date: "2025-02-14T12:30:00Z",
      type: "Echocardiogram",
      summary: "LVEF ~ 60%, normal chamber sizes, no significant valvular disease.",
    },
  ],
};

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
        borderRadius: 0,
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

export default function ResultsReviewEpic() {
  const [category, setCategory] = useState("Laboratory");
  const [panel, setPanel] = useState("Lipids");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState({
    Laboratory: true,
    Radiology: false,
    Cardiology: false,
  });
  const [radiologySub, setRadiologySub] = useState(null);
  const [cardiologySub, setCardiologySub] = useState(null);

  // NEW: toggle Table vs Graph
  const [viewMode, setViewMode] = useState("table"); // "table" | "graph"

  const toggle = (name) => setExpanded((s) => ({ ...s, [name]: !s[name] }));

  const labPanels = MOCK_RESULTS.laboratory.panels.map((p) => p.name);

  const activePanel = useMemo(
    () =>
      MOCK_RESULTS.laboratory.panels.find((p) => p.name === panel) ||
      MOCK_RESULTS.laboratory.panels[0],
    [panel]
  );

  const allTestsInPanel = activePanel?.tests || [];

  // NEW: right-side selector of visible series for the graph
  const [selectedTests, setSelectedTests] = useState(() =>
    (activePanel?.tests || []).reduce((acc, t) => ({ ...acc, [t.name]: true }), {})
  );

  // keep selections in sync when panel changes
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

  // --- Graph prep ---
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

  const radiologyMatchesSub = (study) => {
    if (!radiologySub) return true;
    if (radiologySub === "CT") return study.modality === "CT";
    if (radiologySub === "Diagnostic") return study.modality !== "CT";
    return true;
  };

  const cardiologyMatchesSub = (item) => {
    if (!cardiologySub) return true;
    if (cardiologySub === "EKG Tracing") return item.type === "ECG" || item.type === "EKG";
    if (cardiologySub === "Echocardiogram") return item.type === "Echocardiogram";
    return true;
  };

  const toggleTest = useCallback((name) => {
    setSelectedTests((s) => ({ ...s, [name]: !s[name] }));
  }, []);

  // --- UI helpers ---
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
          {/* LEFT: Navigator with border + margin-right */}
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
                    placeholder={
                      category === "Laboratory" ? "Search tests..." : "Search studies..."
                    }
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

                {/* Radiology section */}
                <div>
                  <CategoryHeader
                    label="Radiology"
                    active={category === "Radiology"}
                    open={expanded.Radiology}
                    onClick={() => {
                      setCategory("Radiology");
                      toggle("Radiology");
                    }}
                  />
                  {expanded.Radiology && (
                    <div style={{ marginTop: 8, paddingLeft: 18 }}>
                      <Stack direction="column" spacing={0}>
                        {["CT", "Diagnostic"].map((name) => (
                          <button
                            key={name}
                            onClick={() => {
                              setCategory("Radiology");
                              setRadiologySub(name);
                            }}
                            style={{
                              textAlign: "left",
                              padding: "8px 10px",
                              borderRadius: 0,
                              border:
                                radiologySub === name && category === "Radiology"
                                  ? "1px solid #5EA1F8"
                                  : "1px solid #e0e0e0",
                              background:
                                radiologySub === name && category === "Radiology"
                                  ? "#f4f9ff"
                                  : "white",
                              fontWeight: radiologySub === name ? 600 : 400,
                              cursor: "pointer",
                            }}
                          >
                            {name}
                          </button>
                        ))}
                      </Stack>
                    </div>
                  )}
                </div>

                {/* Cardiology section */}
                <div>
                  <CategoryHeader
                    label="Cardiology"
                    active={category === "Cardiology"}
                    open={expanded.Cardiology}
                    onClick={() => {
                      setCategory("Cardiology");
                      toggle("Cardiology");
                    }}
                  />
                  {expanded.Cardiology && (
                    <div style={{ marginTop: 8, paddingLeft: 18 }}>
                      <Stack direction="column" spacing={0}>
                        {["EKG Tracing", "Echocardiogram"].map((name) => (
                          <button
                            key={name}
                            onClick={() => {
                              setCategory("Cardiology");
                              setCardiologySub(name);
                            }}
                            style={{
                              textAlign: "left",
                              padding: "8px 10px",
                              borderRadius: 0,
                              border:
                                cardiologySub === name && category === "Cardiology"
                                  ? "1px solid #5EA1F8"
                                  : "1px solid #e0e0e0",
                              background:
                                cardiologySub === name && category === "Cardiology"
                                  ? "#f4f9ff"
                                  : "white",
                              fontWeight: cardiologySub === name ? 600 : 400,
                              cursor: "pointer",
                            }}
                          >
                            {name}
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
                {/* Top summary & mode switch */}
                <div style={{
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}>
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
                              new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" })
                                .format(new Date(iso)),
                          },
                        ]}
                        // Just define a yAxis entry; omit min/max entirely
                        yAxis={[{}]}
                        // ✅ Turn on gridlines
                        grid={{ vertical: true, horizontal: true }}

                        // Optional: style tick labels via slotProps
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
                            // no label inside the chart
                          }))}
                        margin={{ top: 16, right: 16, left: 48, bottom: 28 }}
                      />
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
                        Tip: Use the checkboxes to include/exclude rows (tests). Colors are stable per test.
                      </div>
                    </div>
                    {/* Right control & reference bar */}
                    <RightSelector />
                  </div>
                )}
              </>
            )}

            {category === "Radiology" && (
              <Stack direction="column" spacing={0}>
                {MOCK_RESULTS.radiology
                  .filter((x) => radiologyMatchesSub(x))
                  .filter((x) =>
                    query.trim()
                      ? (x.name + " " + x.modality + " " + x.impression)
                          .toLowerCase()
                          .includes(query.trim().toLowerCase())
                      : true
                  )
                  .map((study, i) => (
                    <div key={i}>
                      <div style={{ fontWeight: 600 }}>{study.name}</div>
                      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                        {study.modality} • {df.format(new Date(study.date))}
                      </div>
                      <div style={{ fontSize: 13 }}>{study.impression}</div>
                      {i < MOCK_RESULTS.radiology.length - 1 && <Divider sx={{ my: 1 }} />}
                    </div>
                  ))}
              </Stack>
            )}

            {category === "Cardiology" && (
              <Stack direction="column" spacing={0}>
                {MOCK_RESULTS.cardiology
                  .filter((x) => cardiologyMatchesSub(x))
                  .filter((x) =>
                    query.trim()
                      ? (x.type + " " + x.summary)
                          .toLowerCase()
                          .includes(query.trim().toLowerCase())
                      : true
                  )
                  .map((item, i) => (
                    <div key={i}>
                      <div style={{ fontWeight: 600 }}>
                        {item.type} • {df.format(new Date(item.date))}
                      </div>
                      <div style={{ fontSize: 13, marginTop: 4 }}>{item.summary}</div>
                      {i < MOCK_RESULTS.cardiology.length - 1 && <Divider sx={{ my: 1 }} />}
                    </div>
                  ))}
              </Stack>
            )}
          </CoreGrid>
        </CoreGrid>
      </TitledCard>
    </Box>
  );
}
