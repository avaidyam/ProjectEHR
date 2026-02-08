import React, { useMemo, useState, useCallback } from "react";
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton } from "@mui/x-data-grid";
import { Box, Grid as CoreGrid, Stack, TitledCard, Divider, Label, Spacer } from "components/ui/Core.jsx";
import { LineChart } from "@mui/x-charts/LineChart";
import { usePatient } from "components/contexts/PatientContext.jsx";
import { useSplitView } from "components/contexts/SplitViewContext.jsx";
import { Tooltip, Button, Icon } from "@mui/material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { filterDocuments } from "util/helpers";

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
  const [documents] = useEncounter().labs();
  const [conditionals] = useEncounter().conditionals();
  const [orders] = useEncounter().orders();

  const visibleSym = filterDocuments(documents, conditionals, orders);
  return useMemo(() => {
    const labs = (visibleSym || []);
    const panels = {};

    for (const doc of (labs || [])) {
      const panelName = doc.Test || "Unknown Panel";
      const time = doc["date"] || doc.collected;
      if (!panels[panelName]) panels[panelName] = {};

      for (const r of doc.components || []) {
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
          low: r.low ?? null,
          high: r.high ?? null,
          agency: doc.resultingAgency || "",
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
  }, [visibleSym]);
}

export default function ResultsReviewEpic() {
  const labPanelsData = useNormalizedLabs();
  const { openTab } = useSplitView();

  const [category, setCategory] = useState("Laboratory");
  const [panel, setPanel] = useState(labPanelsData[0]?.name || "");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState({ Laboratory: true });

  const [viewMode, setViewMode] = useState("table"); // "table" | "graph"
  const toggle = (name) => setExpanded((s) => ({ ...s, [name]: !s[name] }));

  const activePanel = useMemo(
    () => labPanelsData.find((p) => p.name === panel) || labPanelsData[0],
    [panel, labPanelsData]
  );

  const allTestsInPanel = activePanel?.tests || [];

  // Map of testName -> boolean (selected) for the ACTIVE panel (used by graph & right selector)
  const [selectedTests, setSelectedTests] = useState(() =>
    (activePanel?.tests || []).reduce((acc, t) => ({ ...acc, [t.name]: true }), {})
  );

  // When panel changes, keep previous choices if possible; default newly seen tests to true
  React.useEffect(() => {
    setSelectedTests((prev) => {
      const base = {};
      for (const t of allTestsInPanel) base[t.name] = prev[t.name] ?? true;
      return base;
    });
  }, [panel]); // eslint-disable-line react-hooks/exhaustive-deps

  // ------------------------------------
  // 🌳 TreeView: panels-only (CBC, CMP, ...)
  // ------------------------------------
  const panelId = (p) => `panel:${p}`;

  const treeItems = useMemo(() => {
    // Panels only (no test children)
    const panels = labPanelsData.map((p) => ({
      id: panelId(p.name),
      label: p.name,
    }));

    return [
      {
        id: "cat:Laboratory",
        label: "Laboratory",
        children: panels,
      },
    ];
  }, [labPanelsData]);

  // Tree state (store only panel ids)
  const [treeSelection, setTreeSelection] = useState([]);
  const [treeExpanded, setTreeExpanded] = useState([
    "cat:Laboratory",
    panel ? panelId(panel) : "cat:Laboratory",
  ]);

  // No propagation needed now (no children)
  const selectionPropagation = { descendants: false, parents: false };

  // Click a panel to focus it (label click does not toggle checkbox selection by default)
  const handleTreeItemClick = useCallback((event, itemId) => {
    if (typeof itemId === "string" && itemId.startsWith("panel:")) {
      const name = itemId.slice("panel:".length);
      setCategory("Laboratory");
      setPanel(name);
      setTreeExpanded((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
    }
  }, []);

  // Selection = panel ids only
  const handleTreeSelect = useCallback((event, ids) => {
    const next = Array.isArray(ids) ? ids : [ids];
    setTreeSelection(next.filter((id) => typeof id === "string" && id.startsWith("panel:")));
  }, []);

  // Auto-check the active panel so it shows in the table immediately
  React.useEffect(() => {
    if (!panel) return;
    const pid = panelId(panel);
    setTreeSelection((prev) => (prev.includes(pid) ? prev : [...prev, pid]));
  }, [panel]);

  // ------------------------------------
  // TABLE COMBINATION LOGIC (across selected PANELS)
  // ------------------------------------

  // Which panels are checked
  const selectedPanels = useMemo(() => {
    return new Set(
      treeSelection
        .filter((id) => typeof id === "string" && id.startsWith("panel:"))
        .map((id) => id.slice("panel:".length))
    );
  }, [treeSelection]);

  // TABLE tests = union of tests from all selected panels (filtered by search)
  const tableTests = useMemo(() => {
    if (category !== "Laboratory") return [];
    const q = query.trim().toLowerCase();
    const out = [];

    for (const p of labPanelsData) {
      if (!selectedPanels.has(p.name)) continue;
      for (const t of p.tests || []) {
        if (q && !t.name.toLowerCase().includes(q)) continue;
        out.push({ ...t, panelName: p.name });
      }
    }
    return out;
  }, [category, labPanelsData, selectedPanels, query]);

  // Time keys for TABLE (from combined tests)
  const timeKeysDescTable = useMemo(() => {
    if (category !== "Laboratory") return [];
    const allTimes = new Set();
    tableTests.forEach((t) => t.results.forEach((r) => allTimes.add(r.time)));
    return Array.from(allTimes)
      .sort((a, b) => new Date(b) - new Date(a))
      .slice(0, 6);
  }, [category, tableTests]);

  // Build TABLE rows
  const rowsTable = useMemo(() => {
    if (category !== "Laboratory") return [];
    const fmtDateTime = (iso) => {
      const d = new Date(iso);
      const datePart = d.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "2-digit",
      });
      const timePart = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return `${datePart} ${timePart}`;
    };

    return tableTests.map((t, idx) => {
      const row = { id: idx + 1, test: t.name };
      timeKeysDescTable.forEach((iso, i) => {
        const hit = t.results.find((r) => r.time === iso);
        row[`t${i}`] = hit
          ? {
            value: hit.value,
            flag: hit.flag,
            iso,
            test: t.name,
            ref: t.referenceRange || "",
            unit: t.unit || "",
            agency: hit.agency || "",
            label: fmtDateTime(iso),
          }
          : null;
      });
      return row;
    });
  }, [category, tableTests, timeKeysDescTable]);

  // TABLE columns
  const columnsTable = useMemo(() => {
    if (category !== "Laboratory") return [];

    const staticCols = [{ field: "test", headerName: "Test", width: 160, sortable: false }];

    const timeCols = timeKeysDescTable.map((iso, i) => {
      const d = new Date(iso);
      const datePart = d.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "2-digit",
      });
      const timePart = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      return {
        field: `t${i}`,
        headerName: `${datePart}\n${timePart}`,
        renderHeader: () => (
          <div style={{ whiteSpace: "pre-line", textAlign: "left", lineHeight: 1.2 }}>
            {`${datePart}\n${timePart}`}
          </div>
        ),
        width: 100,
        sortable: false,
        renderCell: (params) => {
          const cell = params.value;
          if (!cell) return <span style={{ opacity: 0.6 }}>—</span>;

          const isOut = cell.flag === "H" || cell.flag === "L";
          const display = `${cell.value}${isOut ? " !" : ""}`;

          const tooltipContent = (
            <div style={{ maxWidth: 260, lineHeight: 1.25 }}>
              <div style={{ fontWeight: 800, fontSize: 17, color: "#5EA1F8", marginBottom: 4 }}>
                {cell.test}
              </div>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 6 }}>{cell.label}</div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 24,
                  color: isOut ? "#d32f2f" : "inherit",
                  marginBottom: 6,
                }}
              >
                {display}
              </div>
              {cell.ref && (
                <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>
                  Ref range: {cell.ref}
                </div>
              )}
              {cell.agency && (
                <div style={{ fontSize: 12, opacity: 0.9 }}>Resulting agency: {cell.agency}</div>
              )}
            </div>
          );

          return (
            <Tooltip
              title={tooltipContent}
              arrow
              followCursor
              placement="top"
              PopperProps={{
                modifiers: [{ name: "offset", options: { offset: [0, 8] } }],
                sx: {
                  "& .MuiTooltip-tooltip": {
                    backgroundColor: "white",
                    color: "#111",
                    boxShadow: "0px 2px 10px rgba(0,0,0,0.15)",
                    border: "1px solid #ddd",
                    opacity: 1,
                    padding: "8px 10px",
                    borderRadius: "8px",
                  },
                  "& .MuiTooltip-arrow": { color: "white" },
                },
              }}
              enterDelay={150}
            >
              <span
                style={{
                  color: isOut ? "#d32f2f" : "inherit",
                  fontWeight: isOut ? 700 : 500,
                  display: "inline-block",
                  width: "100%",
                }}
              >
                {display}
              </span>
            </Tooltip>
          );
        },
      };
    });

    return [...staticCols, ...timeCols];
  }, [timeKeysDescTable, category]);

  // -----------------------------
  // GRAPH remains per ACTIVE panel
  // -----------------------------
  const visibleTestsForGraph = useMemo(() => {
    const q = query.trim().toLowerCase();
    const selectedNames = new Set(
      Object.entries(selectedTests)
        .filter(([, v]) => v)
        .map(([name]) => name)
    );
    const tests = allTestsInPanel.filter((t) => selectedNames.has(t.name));
    return q ? tests.filter((t) => t.name.toLowerCase().includes(q)) : tests;
  }, [allTestsInPanel, selectedTests, query]);

  const timeKeysDescGraph = useMemo(() => {
    const allTimes = new Set();
    visibleTestsForGraph.forEach((t) => t.results.forEach((r) => allTimes.add(r.time)));
    return Array.from(allTimes).sort((a, b) => new Date(b) - new Date(a)).slice(0, 6);
  }, [visibleTestsForGraph]);

  const graphDataAsc = useMemo(() => {
    const timesAsc = [...timeKeysDescGraph].sort((a, b) => new Date(a) - new Date(b));
    return timesAsc.map((iso) => {
      const row = { time: iso };
      for (const t of visibleTestsForGraph) {
        const hit = t.results.find((r) => r.time === iso);
        row[t.name] = hit ? hit.value : null;
      }
      return row;
    });
  }, [timeKeysDescGraph, visibleTestsForGraph]);

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
        {visibleTestsForGraph.map((t) => (
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
        {visibleTestsForGraph.map((t) => (
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
      <TitledCard
        emphasized
        title="Results Review"
        color="#5EA1F8"
        toolbar={
          <Button
            variant="contained"
            size="small"
            startIcon={<Icon>add</Icon>}
            onClick={() => openTab("Edit Result", {}, "main", true)}
          >
            New Result
          </Button>
        }
      >
        <CoreGrid container spacing={2}>
          {/* LEFT: Navigator (TreeView) */}
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

                {/* Panels-only TreeView */}
                <div style={{ marginTop: 8 }}>
                  <RichTreeView
                    items={treeItems}
                    checkboxSelection
                    multiSelect
                    selectionPropagation={selectionPropagation}
                    selectedItems={treeSelection}
                    onSelectedItemsChange={handleTreeSelect}
                    expandedItems={treeExpanded}
                    onExpandedItemsChange={(e, ids) => setTreeExpanded(ids)}
                    defaultExpandedItems={["cat:Laboratory"]}
                    onItemClick={handleTreeItemClick}
                    sx={{
                      height: 420,
                      overflowY: "auto",
                      "& .MuiTreeItem-content": { py: 0.25 },
                    }}
                  />
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
                    {panel} • {tableTests.length} tests • {timeKeysDescTable.length} time points
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
                        rows={rowsTable}
                        columns={columnsTable}
                        slots={{ toolbar: SimpleToolbar }}
                        autoHeight
                        disableRowSelectionOnClick

                        /* Compact look */
                        density="compact"
                        rowHeight={28}
                        headerHeight={34}
                        sx={{
                          fontSize: 12,
                          "& .MuiDataGrid-cell": { py: 0.25, px: 0.5, lineHeight: 1.1 },
                          "& .MuiDataGrid-columnHeaders": { minHeight: 34 },
                          "& .MuiDataGrid-columnHeader": { py: 0, px: 0.5 },
                          "& .MuiDataGrid-columnHeaderTitle": {
                            whiteSpace: "pre-line",
                            textAlign: "left",
                            lineHeight: 1.15,
                          },
                          "& .MuiDataGrid-virtualScrollerContent .MuiDataGrid-row": {
                            borderTop: "1px solid #f1f1f1",
                          },
                          "& .MuiDataGrid-footerContainer": { minHeight: 32 },
                        }}

                        // Keep or remove pagination as you prefer:
                        initialState={{
                          pagination: { paginationModel: { pageSize: 100, page: 0 } },
                        }}
                        pageSizeOptions={[100, 200, 300]}
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
                          series={visibleTestsForGraph
                            .filter(Boolean)
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

