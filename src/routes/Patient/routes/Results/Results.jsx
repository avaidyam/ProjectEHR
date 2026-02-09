import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Box, Stack, Divider, Label, Button, ButtonGroup, Icon, DataGrid, TreeView } from "components/ui/Core.jsx";
import { CollapsiblePane } from "components/ui/CollapsiblePane";
import { LineChart } from "@mui/x-charts/LineChart";
import { usePatient } from "components/contexts/PatientContext.jsx";
import { useSplitView } from "components/contexts/SplitViewContext.jsx";
import { Tooltip } from "@mui/material";
import { filterDocuments } from "util/helpers";

const hashCode = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const getColor = (name) => `hsl(${hashCode(name) % 360} 85% 45%)`;

const formatDate = (iso, format) => {
  const d = new Date(iso);
  if (format === "short") {
    return `${d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "2-digit" })} ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
  }
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(d);
};

// --- Data Hook ---
function useNormalizedLabs() {
  const { useEncounter } = usePatient();
  const [documents] = useEncounter().labs();
  const [conditionals] = useEncounter().conditionals();
  const [orders] = useEncounter().orders();
  const visibleDocs = filterDocuments(documents, conditionals, orders);

  return useMemo(() => {
    const panels = {};
    for (const doc of visibleDocs || []) {
      const panelName = doc.Test || "Unknown Panel";
      const time = doc.date || doc.collected;
      if (!panels[panelName]) panels[panelName] = {};

      for (const r of doc.components || []) {
        if (!panels[panelName][r.name]) {
          panels[panelName][r.name] = {
            name: r.name,
            unit: r.units || "",
            referenceRange: r.low != null || r.high != null ? `${r.low ?? ""} – ${r.high ?? ""}`.trim() : "",
            results: [],
          };
        }
        const val = Number(r.value);
        panels[panelName][r.name].results.push({
          time: new Date(time).toISOString(),
          value: val,
          flag: r.low != null && val < r.low ? "L" : r.high != null && val > r.high ? "H" : "",
          low: r.low ?? null,
          high: r.high ?? null,
          agency: doc.resultingAgency || "",
        });
      }
    }

    return Object.entries(panels).map(([name, tests]) => ({
      name,
      tests: Object.values(tests).map((t) => ({
        ...t,
        results: t.results.sort((a, b) => new Date(a.time) - new Date(b.time)),
      })),
    }));
  }, [visibleDocs]);
}

const ResultCell = ({ cell }) => {
  if (!cell) return <span style={{ opacity: 0.6 }}>—</span>;
  const isOut = cell.flag === "H" || cell.flag === "L";
  const display = `${cell.value}${isOut ? " !" : ""}`;

  return (
    <Tooltip
      title={
        <Box sx={{ maxWidth: 260, lineHeight: 1.25 }}>
          <Box sx={{ fontWeight: 800, fontSize: 17, color: "#5EA1F8", mb: 0.5 }}>{cell.test}</Box>
          <Box sx={{ fontSize: 12, opacity: 0.9, mb: 0.75 }}>{cell.label}</Box>
          <Box sx={{ fontWeight: 900, fontSize: 24, color: isOut ? "#d32f2f" : "inherit", mb: 0.75 }}>{display}</Box>
          {cell.ref && <Box sx={{ fontSize: 12, opacity: 0.9, mb: 0.5 }}>Ref range: {cell.ref}</Box>}
          {cell.agency && <Box sx={{ fontSize: 12, opacity: 0.9 }}>Resulting agency: {cell.agency}</Box>}
        </Box>
      }
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
            padding: "8px 10px",
            borderRadius: "8px",
          },
          "& .MuiTooltip-arrow": { color: "white" },
        },
      }}
      enterDelay={150}
    >
      <span style={{ color: isOut ? "#d32f2f" : "inherit", fontWeight: isOut ? 700 : 500, width: "100%", display: "inline-block" }}>
        {display}
      </span>
    </Tooltip>
  );
};

const SeriesSelector = ({ tests, selectedTests, onToggle }) => (
  <Box sx={{ width: 260, borderLeft: "1px solid", borderColor: "divider", pl: 1.5 }}>
    <Box sx={{ fontWeight: 700, mb: 1 }}>Series</Box>
    <Stack direction="column" spacing={0.75}>
      {tests.map((t) => (
        <label key={t.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={!!selectedTests[t.name]} onChange={() => onToggle(t.name)} />
          <span style={{ width: 14, height: 14, borderRadius: 3, background: getColor(t.name), border: "1px solid #00000020" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</span>
        </label>
      ))}
    </Stack>
    <Divider sx={{ my: 1 }} />
    <Box sx={{ fontWeight: 700, mb: 1 }}>Reference bar</Box>
    <Stack direction="column" spacing={1}>
      {tests.map((t) => (
        <Box key={t.name} sx={{ fontSize: 12 }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <span style={{ width: 24, height: 6, background: getColor(t.name), borderRadius: 2 }} />
            <b>{t.name}</b>
          </Stack>
          <Box sx={{ opacity: 0.8, mt: 0.5 }}>
            Ref: <code>{t.referenceRange}</code> {t.unit && `(${t.unit})`}
          </Box>
        </Box>
      ))}
    </Stack>
  </Box>
);

function ResultsNavigator({ query, onQueryChange, treeItems, treeSelection, onTreeSelect, treeExpanded, onTreeExpandedChange, onItemClick }) {
  return (
    <CollapsiblePane width={280} side="left">
      <Box sx={{ p: 1.5 }}>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search tests..."
          style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", outline: "none" }}
        />
        <Box sx={{ mt: 1 }}>
          <TreeView rich
            items={treeItems}
            checkboxSelection
            multiSelect
            selectionPropagation={{ descendants: false, parents: false }}
            selectedItems={treeSelection}
            onSelectedItemsChange={onTreeSelect}
            expandedItems={treeExpanded}
            onExpandedItemsChange={(_, ids) => onTreeExpandedChange(ids)}
            defaultExpandedItems={["cat:Laboratory"]}
            onItemClick={onItemClick}
            sx={{ flex: 1, overflowY: "auto", "& .MuiTreeItem-content": { py: 0.25 } }}
          />
        </Box>
      </Box>
    </CollapsiblePane>
  );
}

function ResultsGraph({ graphData, graphTimeKeys, visibleGraphTests, selectedTests, toggleTest }) {
  return (
    <Stack direction="row" spacing={1.5}>
      <Box sx={{ flex: 1, minHeight: 320 }}>
        <Box sx={{ height: 360, width: "100%", border: "1px solid #e0e0e0" }}>
          <LineChart
            height={360}
            dataset={graphData}
            xAxis={[{ dataKey: "time", scaleType: "band", valueFormatter: (iso) => formatDate(iso) }]}
            yAxis={[{}]}
            grid={{ vertical: true, horizontal: true }}
            slotProps={{ xAxis: { tickLabelStyle: { fontSize: 12 } }, yAxis: { tickLabelStyle: { fontSize: 12 } } }}
            series={visibleGraphTests.map((t) => ({
              dataKey: t.name,
              color: getColor(t.name),
              curve: "linear",
              showMark: true,
              connectNulls: true,
              strokeWidth: 3,
            }))}
            margin={{ top: 16, right: 16, left: 48, bottom: 28 }}
          />
        </Box>
      </Box>
      <SeriesSelector tests={visibleGraphTests} selectedTests={selectedTests} onToggle={toggleTest} />
    </Stack>
  );
}

function ResultsGrid({ rows, columns }) {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      hideFooter
      density="compact"
      disableRowSelectionOnClick
      sx={{
        '& .MuiDataGrid-cell': {
          borderRight: '1px solid #f0f0f0',
        }
      }}
    />
  );
}

export default function ResultsReview() {
  const labPanels = useNormalizedLabs();
  const { openTab } = useSplitView();

  const [panel, setPanel] = useState(labPanels[0]?.name || "");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [treeSelection, setTreeSelection] = useState([]);
  const [treeExpanded, setTreeExpanded] = useState(["cat:Laboratory", panel ? `panel:${panel}` : "cat:Laboratory"]);
  const [selectedTests, setSelectedTests] = useState({});

  const activePanel = useMemo(() => labPanels.find((p) => p.name === panel) || labPanels[0], [panel, labPanels]);

  // Sync selected tests when panel changes
  useEffect(() => {
    setSelectedTests((prev) => {
      const base = {};
      for (const t of activePanel?.tests || []) base[t.name] = prev[t.name] ?? true;
      return base;
    });
  }, [activePanel]);

  // Auto-select active panel in tree
  useEffect(() => {
    if (!panel) return;
    const pid = `panel:${panel}`;
    setTreeSelection((prev) => (prev.includes(pid) ? prev : [...prev, pid]));
  }, [panel]);

  // Tree items
  const treeItems = useMemo(
    () => [{ id: "cat:Laboratory", label: "Laboratory", children: labPanels.map((p) => ({ id: `panel:${p.name}`, label: p.name })) }],
    [labPanels]
  );

  // Selected panels from tree
  const selectedPanelNames = useMemo(
    () => new Set(treeSelection.filter((id) => id.startsWith("panel:")).map((id) => id.slice(6))),
    [treeSelection]
  );

  // Filtered tests for table (across all selected panels)
  const tableTests = useMemo(() => {
    const q = query.trim().toLowerCase();
    return labPanels
      .filter((p) => selectedPanelNames.has(p.name))
      .flatMap((p) => p.tests.filter((t) => !q || t.name.toLowerCase().includes(q)).map((t) => ({ ...t, panelName: p.name })));
  }, [labPanels, selectedPanelNames, query]);

  // Time keys for table
  const tableTimeKeys = useMemo(() => {
    const times = new Set();
    tableTests.forEach((t) => t.results.forEach((r) => times.add(r.time)));
    return [...times].sort((a, b) => new Date(b) - new Date(a)).slice(0, 6);
  }, [tableTests]);

  // Table rows
  const tableRows = useMemo(
    () =>
      tableTests.map((t, idx) => {
        const row = { id: idx + 1, test: t.name };
        tableTimeKeys.forEach((iso, i) => {
          const hit = t.results.find((r) => r.time === iso);
          row[`t${i}`] = hit
            ? { value: hit.value, flag: hit.flag, iso, test: t.name, ref: t.referenceRange, unit: t.unit, agency: hit.agency, label: formatDate(iso, "short") }
            : null;
        });
        return row;
      }),
    [tableTests, tableTimeKeys]
  );

  // Table columns
  const tableColumns = useMemo(() => {
    const timeCols = tableTimeKeys.map((iso, i) => {
      const [datePart, timePart] = formatDate(iso, "short").split(" ");
      return {
        field: `t${i}`,
        headerName: `${datePart}\n${timePart}`,
        renderHeader: () => <div style={{ whiteSpace: "pre-line", textAlign: "left", lineHeight: 1.2 }}>{`${datePart}\n${timePart}`}</div>,
        width: 100,
        sortable: false,
        renderCell: ({ value }) => <ResultCell cell={value} />,
      };
    });
    return [{ field: "test", headerName: "Test", width: 160, sortable: false }, ...timeCols];
  }, [tableTimeKeys]);

  // Graph data (active panel only)
  const visibleGraphTests = useMemo(() => {
    const q = query.trim().toLowerCase();
    const selected = Object.entries(selectedTests).filter(([, v]) => v).map(([name]) => name);
    return (activePanel?.tests || []).filter((t) => selected.includes(t.name) && (!q || t.name.toLowerCase().includes(q)));
  }, [activePanel, selectedTests, query]);

  const graphTimeKeys = useMemo(() => {
    const times = new Set();
    visibleGraphTests.forEach((t) => t.results.forEach((r) => times.add(r.time)));
    return [...times].sort((a, b) => new Date(b) - new Date(a)).slice(0, 6);
  }, [visibleGraphTests]);

  const graphData = useMemo(() => {
    const timesAsc = [...graphTimeKeys].sort((a, b) => new Date(a) - new Date(b));
    return timesAsc.map((iso) => {
      const row = { time: iso };
      visibleGraphTests.forEach((t) => {
        const hit = t.results.find((r) => r.time === iso);
        row[t.name] = hit?.value ?? null;
      });
      return row;
    });
  }, [graphTimeKeys, visibleGraphTests]);

  // Handlers
  const handleTreeItemClick = useCallback((_, itemId) => {
    if (itemId?.startsWith("panel:")) {
      setPanel(itemId.slice(6));
      setTreeExpanded((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
    }
  }, []);

  const handleTreeSelect = useCallback((_, ids) => {
    setTreeSelection((Array.isArray(ids) ? ids : [ids]).filter((id) => id?.startsWith("panel:")));
  }, []);

  const toggleTest = useCallback((name) => setSelectedTests((s) => ({ ...s, [name]: !s[name] })), []);

  return (
    <Stack sx={{ height: "100%" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
        <Label variant="h6">Results Review</Label>
        <ButtonGroup value={viewMode}>
          <Button toggle value="table" onClick={() => setViewMode("table")}>Lab</Button>
          <Button toggle value="graph" onClick={() => setViewMode("graph")}>Graph</Button>
        </ButtonGroup>
        <Button variant="contained" size="small" startIcon={<Icon>add</Icon>} onClick={() => openTab("Edit Result", {}, "main", true)}>
          New Result
        </Button>
      </Stack>
      <Stack direction="row" sx={{ flex: 1, overflow: "hidden" }}>
        <ResultsNavigator
          query={query}
          onQueryChange={setQuery}
          treeItems={treeItems}
          treeSelection={treeSelection}
          onTreeSelect={handleTreeSelect}
          treeExpanded={treeExpanded}
          onTreeExpandedChange={setTreeExpanded}
          onItemClick={handleTreeItemClick}
        />
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {viewMode === "table" &&
            <ResultsGrid rows={tableRows} columns={tableColumns} />
          }
          {viewMode === "graph" && (
            <ResultsGraph
              graphData={graphData}
              graphTimeKeys={graphTimeKeys}
              visibleGraphTests={visibleGraphTests}
              selectedTests={selectedTests}
              toggleTest={toggleTest}
            />
          )}
        </Box>
      </Stack>
    </Stack>
  );
}
