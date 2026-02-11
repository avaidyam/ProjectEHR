import * as React from 'react';
// @ts-ignore
import groupBy from 'lodash/groupBy';
import { Box, Stack, Divider, Label, Button, ButtonGroup, Icon, DataGrid, TreeView, Autocomplete } from "components/ui/Core";
import { CollapsiblePane } from "components/ui/CollapsiblePane";
import { LineChart } from "@mui/x-charts/LineChart";
import { usePatient } from "components/contexts/PatientContext";
import { useSplitView } from "components/contexts/SplitViewContext";
import { Tooltip } from "@mui/material";
import { filterDocuments } from "util/helpers.js";

const hashCode = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const getColor = (name: string) => `hsl(${hashCode(name) % 360} 85% 45%)`;

const formatDate = (iso: any, format?: string) => {
  const d = new Date(iso);
  if (format === "short") {
    return `${d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "2-digit" })} ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
  }
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(d);
};

function useNormalizedResults() {
  const { useEncounter } = usePatient();
  const [labDocs] = (useEncounter() as any).labs();
  const [imagingDocs] = (useEncounter() as any).imaging();
  const [conditionals] = (useEncounter() as any).conditionals();
  const [orders] = (useEncounter() as any).orders();

  const visibleLabs = filterDocuments(labDocs as any[], conditionals, orders);
  const visibleImaging = filterDocuments(imagingDocs as any[], conditionals, orders);

  return React.useMemo(() => {
    const categories: Record<string, any> = {
      Laboratory: {},
      Imaging: {},
      Cardiac: {},
    };

    // Process Labs
    for (const doc of (visibleLabs as any[]) || []) {
      const panelName = doc.test || doc.Test || "Unknown Panel";
      const time = doc.date || doc.collected;
      if (!categories.Laboratory[panelName]) categories.Laboratory[panelName] = {};

      for (const r of (doc.components as any[]) || []) {
        if (!categories.Laboratory[panelName][r.name]) {
          categories.Laboratory[panelName][r.name] = {
            name: r.name,
            unit: r.units || "",
            referenceRange: r.low != null || r.high != null ? `${r.low ?? ""} – ${r.high ?? ""}`.trim() : "",
            results: [],
          };
        }
        const val = Number(r.value);
        categories.Laboratory[panelName][r.name].results.push({
          time: new Date(time).toISOString(),
          value: val,
          flag: r.low != null && val < r.low ? "L" : r.high != null && val > r.high ? "H" : "",
          low: r.low ?? null,
          high: r.high ?? null,
          agency: doc.resultingAgency || "",
        });
      }
    }

    // Process Imaging
    for (const doc of (visibleImaging as any[]) || []) {
      const testName = doc.test || doc.Test || "Unknown Study";
      const time = doc.date || doc.statusDate || doc.collected;
      if (!categories.Imaging[testName]) {
        categories.Imaging[testName] = {
          name: testName,
          unit: "",
          referenceRange: "",
          results: [],
        };
      }
      categories.Imaging[testName].results.push({
        time: new Date(time).toISOString(),
        value: "image",
        isImage: true,
        test: testName,
        agency: doc.resultingAgency || "",
      });
    }

    return Object.entries(categories).map(([catName, panels]) => ({
      category: catName,
      panels: Object.entries(panels as Record<string, any>).map(([key, tests]) => {
        return {
          name: key,
          tests: catName === "Imaging"
            ? [tests]
            : Object.values(tests as Record<string, any>).map((t: any) => ({
              ...t,
              results: (t.results as any[]).sort((a, b) => (new Date(a.time) as any) - (new Date(b.time) as any)),
            })),
        };
      }),
    })).sort((a: any, b: any) => {
      const order: Record<string, number> = { Laboratory: 1, Imaging: 2, Cardiac: 3 };
      return (order[a.category] || 99) - (order[b.category] || 99);
    });
  }, [visibleLabs, visibleImaging]);
}

const ResultCell = ({ cell }: { cell: any }) => {
  if (!cell) return <span style={{ opacity: 0.6 }}>—</span>;
  const isOut = !cell.isImage && (cell.flag === "H" || cell.flag === "L");
  const display = cell.isImage ? <Icon sx={{ fontSize: 24, verticalAlign: "middle" }}>{cell.value}</Icon> : `${cell.value}${isOut ? " !" : ""}`;

  return (
    <Tooltip
      title={
        <Box sx={{ maxWidth: 260, lineHeight: 1.25 }}>
          <Box sx={{ fontWeight: 800, fontSize: 17, color: "#5EA1F8", mb: 0.5 }}>{cell.test}</Box>
          <Box sx={{ fontSize: 12, opacity: 0.9, mb: 0.75 }}>{cell.label}</Box>
          <Box sx={{ fontWeight: 900, fontSize: 24, color: isOut ? "#d32f2f" : "inherit", mb: 0.75 }}>
            {cell.isImage ? <Icon sx={{ fontSize: 48 }}>{cell.value}</Icon> : display}
          </Box>
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
      <span style={{ color: isOut ? "#d32f2f" : "inherit", fontWeight: isOut ? 700 : 500, width: "100%", display: "inline-block", textAlign: cell.isImage ? "center" : "inherit" }}>
        {display}
      </span>
    </Tooltip>
  );
};

function ResultsNavigator({ treeItems, onComponentsChange }: { treeItems: any[]; onComponentsChange: (components: any[]) => void }) {
  const categories = useNormalizedResults();
  const [query, setQuery] = React.useState("");
  const [treeSelection, setTreeSelection] = React.useState(['cat:Laboratory', 'cat:Imaging', 'cat:Cardiac']);

  const allParents = React.useMemo(() => [...treeItems.map((x: any) => x.id), ...treeItems.flatMap((x: any) => x.children.flatMap((y: any) => y.id))], [treeItems])
  const allItems = React.useMemo(() => treeItems.flatMap((x: any) => x.children.flatMap((y: any) => y.children.map((z: any) => z.label))), [treeItems])

  const selectedComponents = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const selectedIds = new Set(treeSelection);

    return categories.flatMap(cat => {
      const isCatSelected = selectedIds.has(`cat:${cat.category}`);
      return cat.panels.flatMap((panel: any) =>
        panel.tests.filter((test: any) => {
          const isPanelSelected = isCatSelected || selectedIds.has(`panel:${cat.category}:${panel.name}`);
          const isTestSelected = isPanelSelected || selectedIds.has(`test:${cat.category}:${panel.name}:${test.name}`);
          return isTestSelected && (!q || test.name.toLowerCase().includes(q));
        })
      );
    });
  }, [categories, treeSelection, query]);

  // Use a ref to make sure we aren't looping our render infinitely.
  const lastComponentsKeyRef = React.useRef("");
  React.useEffect(() => {
    const key = (selectedComponents as any[]).map((c) => c.name).sort().join(",");
    if (key !== lastComponentsKeyRef.current) {
      lastComponentsKeyRef.current = key;
      onComponentsChange(selectedComponents as any[]);
    }
  }, [selectedComponents, onComponentsChange]);

  return (
    <Stack spacing={1.5} sx={{ p: 1.5, height: "100%" }}>
      <Autocomplete
        freeSolo
        size="small"
        options={allItems}
        inputValue={query}
        onInputChange={(_, val) => setQuery(val)}
        TextFieldProps={{ placeholder: "Search tests..." }}
      />
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <TreeView rich
          items={treeItems}
          checkboxSelection
          multiSelect
          selectionPropagation={{ descendants: true, parents: true }}
          selectedItems={treeSelection}
          onSelectedItemsChange={(_, ids: any) => setTreeSelection(ids)}
          defaultExpandedItems={allParents}
          sx={{ height: "100%", overflowY: "auto", "& .MuiTreeItem-content": { py: 0.25 } }}
        />
      </Box>
    </Stack>
  );
}

function ResultsGraph({ components }: { components: any[] }) {
  const timeKeys = React.useMemo(() => {
    const times = new Set<string>();
    components.forEach((t) => (t.results as any[]).forEach((r) => times.add(r.time)));
    return [...times].sort((a, b) => (new Date(b) as any) - (new Date(a) as any)).slice(0, 6);
  }, [components]);

  const graphData = React.useMemo(() => {
    const timesAsc = [...timeKeys].sort((a, b) => (new Date(a) as any) - (new Date(b) as any));
    return timesAsc.map((iso) => {
      const row: Record<string, any> = { time: iso };
      components.forEach((t) => {
        const hit = (t.results as any[]).find((r: any) => r.time === iso);
        row[t.name] = hit?.value ?? null;
      });
      return row;
    });
  }, [timeKeys, components]);

  return (
    <LineChart
      height={360}
      dataset={graphData}
      xAxis={[{ dataKey: "time", scaleType: "band", valueFormatter: (iso: any) => formatDate(iso) }]}
      yAxis={[{}]}
      grid={{ vertical: true, horizontal: true }}
      slotProps={{ xAxis: { tickLabelStyle: { fontSize: 12 } }, yAxis: { tickLabelStyle: { fontSize: 12 } } } as any}
      series={components.map((t) => ({
        dataKey: t.name,
        color: getColor(t.name),
        curve: "linear",
        showMark: true,
        connectNulls: true,
        strokeWidth: 3,
      }))}
      margin={{ top: 16, right: 16, left: 48, bottom: 28 }}
    />
  );
}

function ResultsGrid({ components }: { components: any[] }) {
  const timeKeys = React.useMemo(() => {
    const times = new Set<string>();
    components.forEach((t) => (t.results as any[]).forEach((r: any) => times.add(r.time)));
    return [...times].sort((a, b) => (new Date(b) as any) - (new Date(a) as any)).slice(0, 6);
  }, [components]);

  const rows = React.useMemo(
    () =>
      components.map((t: any, idx: number) => {
        const row: Record<string, any> = { id: idx + 1, test: t.name };
        timeKeys.forEach((iso: string, i: number) => {
          const hit = (t.results as any[]).find((r: any) => r.time === iso);
          row[`t${i}`] = hit
            ? { value: hit.value, isImage: hit.isImage, flag: hit.flag, iso, test: t.name, ref: t.referenceRange, unit: t.unit, agency: hit.agency, label: formatDate(iso, "short") }
            : null;
        });
        return row;
      }),
    [components, timeKeys]
  );

  const columns = React.useMemo(() => {
    const timeCols = timeKeys.map((iso: string, i: number) => {
      const [datePart, timePart] = formatDate(iso, "short").split(" ");
      return {
        field: `t${i}`,
        headerName: `${datePart}\n${timePart}`,
        renderHeader: () => <div style={{ whiteSpace: "pre-line", textAlign: "left", lineHeight: 1.2 }}>{`${datePart}\n${timePart}`}</div>,
        width: 100,
        sortable: false,
        renderCell: ({ value }: { value: any }) => <ResultCell cell={value} />,
      };
    });
    return [{ field: "test", headerName: "Test", width: 160, sortable: false }, ...timeCols];
  }, [timeKeys]);

  return (
    <DataGrid
      rows={rows}
      columns={columns as any[]}
      hideFooter
      density="compact"
      disableRowSelectionOnClick
      sx={{ '& .MuiDataGrid-cell': { borderRight: '1px solid #f0f0f0' } }}
    />
  );
}

export function ResultsReview() {
  const categories: any[] = useNormalizedResults();
  const { openTab }: any = useSplitView();
  const [viewMode, setViewMode] = React.useState("table");
  const [selectedComponents, setSelectedComponents] = React.useState<any[]>([]);

  const treeItems = React.useMemo(() => categories.map((cat: any) => ({
    id: `cat:${cat.category}`,
    label: cat.category,
    children: (cat.panels as any[]).map((p: any) => ({
      id: `panel:${cat.category}:${p.name}`,
      label: p.name,
      children: (p.tests as any[]).map((t: any) => ({
        id: `test:${cat.category}:${p.name}:${t.name}`,
        label: t.name
      }))
    }))
  })), [categories]);

  return (
    <Stack direction="column" sx={{ height: "100%" }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Label variant="h6">Results Review</Label>
        <ButtonGroup value={viewMode}>
          <Button {...{ toggle: true } as any} value="table" onClick={() => setViewMode("table")}>Lab</Button>
          <Button {...{ toggle: true } as any} value="graph" onClick={() => setViewMode("graph")}>Graph</Button>
        </ButtonGroup>
        <Button
          variant="contained"
          size="small"
          startIcon={<Icon>add</Icon>}
          onClick={() => openTab("Edit Result", {}, "main", true)}
        >
          New Result
        </Button>
      </Stack>
      <Stack direction="row" sx={{ flex: 1, overflow: "hidden" }}>
        <CollapsiblePane width={280} side="left">
          <ResultsNavigator
            treeItems={treeItems}
            onComponentsChange={setSelectedComponents}
          />
        </CollapsiblePane>
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {viewMode === "table" && <ResultsGrid components={selectedComponents} />}
          {viewMode === "graph" && <ResultsGraph components={selectedComponents} />}
        </Box>
      </Stack>
    </Stack>
  );
}
