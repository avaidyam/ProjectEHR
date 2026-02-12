import * as React from 'react';

import { Fade, Paper, Popper, Typography } from '@mui/material';
import { usePatient, useDatabase, Database } from 'components/contexts/PatientContext';
import { filterDocuments } from 'util/helpers';

const _isBPProblematic = ({ systolic, diastolic }: { systolic: number, diastolic: number }) => systolic > 130 || diastolic > 90;

export const VitalsPopup = ({ vitals, definition }: { vitals: Database.Flowsheet.Entry[], definition: Database.Flowsheet.Definition }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [open, setOpen] = React.useState(false);

  const rowsToShow = definition?.rows?.filter((row) => {
    return vitals.some((v) => v[row.name] != null && v[row.name] !== "");
  }) ?? [];

  let bpRowAdded = false;
  const processedRows = rowsToShow.flatMap((row) => {
    if (row.name.startsWith('bloodPressure')) {
      if (bpRowAdded) return [];
      bpRowAdded = true;
      return [{ name: 'bp', label: 'Blood Pressure (mmHg)' }];
    }
    return [row];
  });

  return (
    <div style={{ display: 'flex', flexDirection: "column" }}
      onMouseEnter={(e) => {
        setOpen(true);
        setAnchorEl(e.currentTarget);
      }} onMouseLeave={() => {
        setOpen(false);
        setAnchorEl(null);
      }}>
      <span>Temp: {vitals[0]?.temp}</span>
      <span
        style={_isBPProblematic({ systolic: vitals[0]?.sbp, diastolic: vitals[0]?.dbp }) ? { backgroundColor: 'rgb(219, 40, 40, 0.7)', borderColor: 'rgb(219, 40, 40, 1)' } : {}}
      >
        BP: {vitals[0]?.sbp}/{vitals[0]?.dbp}
      </span>
      <span>HR: {vitals[0]?.hr}</span>
      <span
        style={vitals[0]?.bmi > 30 ? { backgroundColor: 'rgb(219, 40, 40, 0.7)', borderColor: 'rgb(219, 40, 40, 1)' } : {}}
      >
        BMI: {vitals[0]?.bmi} ({vitals[0]?.weight} lbs)
      </span>
      <Popper open={open} anchorEl={anchorEl} placement="right" transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={100}>
            <Paper
              style={{
                display: "flex",
                border: '1px solid',
                padding: '1em',
                fontSize: '0.9em',
              }}
            >
              <div style={{ display: 'flex', flexDirection: "column", padding: "10px 10px 10px 10px" }}>
                <span style={{ visibility: 'hidden' }}>hidden</span>
                {processedRows.map((row) => (
                  <span key={row.name}>{row.label || row.name}</span>
                ))}
              </div>
              <div style={{ display: "flex", flex: 1 }}>
                {vitals.map((entry) => (
                  <div
                    key={entry.date?.toString()}
                    style={{ display: 'flex', flexDirection: "column", textAlign: "right", padding: "10px 10px 10px 10px" }}
                  >
                    <span>{new Date(entry.date).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' })}</span>
                    {processedRows.map((row) => {
                      if (row.name === 'bp') {
                        const { sbp: sys, dbp: dia } = entry;
                        if (sys == null && dia == null) return <br key={row.name} />;
                        return <span key={row.name}>{sys ?? 'x'} / {dia ?? 'x'}</span>;
                      }
                      return <span key={row.name}>{entry[row.name] ?? <br />}</span>
                    })}
                  </div>
                ))}
              </div>
            </Paper>
          </Fade>
        )}
      </Popper>
    </div>
  );
};

export const SidebarVitals = () => {
  const { useEncounter } = usePatient()
  const [flowsheets] = useEncounter().flowsheets([])
  const [conditionals] = useEncounter().conditionals()
  const [orders] = useEncounter().orders()
  const [flowsheetDefs] = useDatabase().flowsheets()

  const allFlowsheets = flowsheets?.filter(f => f.flowsheet === "1002339" as Database.Flowsheet.Definition.ID) ?? []
  const vitalsDefinition = flowsheetDefs?.find(f => f.id === "1002339" as Database.Flowsheet.Definition.ID)
  const vitals2 = filterDocuments(allFlowsheets, conditionals, orders)

  const _t = (x: Database.Flowsheet.Entry) => new Date(x.date).getTime()
  const allVitals = (vitals2 ?? []).toSorted((a, b) => _t(b) - _t(a))
  const mostRecentDate = allVitals[0]?.date;
  const vitalsDateLabel = mostRecentDate ? ` ${new Date(mostRecentDate).toLocaleDateString()}` : '';

  if (!vitalsDefinition) {
    return <i>No vitals definition found</i>
  }

  return (
    <div style={{ display: 'flex', flexDirection: "column" }}>
      <Typography variant="h6" color="inherit" component="div" style={{ fontSize: '1.25em' }}>
        Vitals{vitalsDateLabel}
      </Typography>
      {allVitals[0] ? (
        <VitalsPopup vitals={allVitals} definition={vitalsDefinition} />
      ) : (
        <i>No vitals to display</i>
      )}
    </div>
  );
};
