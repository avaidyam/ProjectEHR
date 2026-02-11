import * as React from 'react';
import { DateHelpers } from 'util/helpers.js';
import { Fade, Paper, Popper, Typography } from '@mui/material';
import { usePatient, useDatabase } from 'components/contexts/PatientContext';
import { filterDocuments } from 'util/helpers.js';

const _isBPProblematic = ({ systolic, diastolic }: any) => systolic > 130 || diastolic > 90;

export const VitalsPopup = ({ vitals, definition, ...props }: any) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const handleMenuOpen = (e: any) => {
        setOpen(true);
        setAnchorEl(e.currentTarget);
    };
    const handleMenuClose = () => {
        setOpen(false);
        setAnchorEl(null);
    };

    const rowsToShow = definition?.rows?.filter((row: any) => {
        return vitals.some((v: any) => v[row.name] != null && v[row.name] !== "");
    }) ?? [];

    let bpRowAdded = false;
    const processedRows = rowsToShow.flatMap((row: any) => {
        if (row.name.startsWith('bloodPressure')) {
            if (bpRowAdded) return [];
            bpRowAdded = true;
            return [{ name: 'bp', label: 'Blood Pressure (mmHg)' }];
        }
        return [row];
    });

    return (
        <div style={{ display: 'flex', flexDirection: "column" }} onMouseEnter={handleMenuOpen} onMouseLeave={handleMenuClose}>
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
                                {processedRows.map((row: any) => (
                                    <span key={row.name}>{row.label || row.name}</span>
                                ))}
                            </div>
                            <div style={{ display: "flex", flex: 1 }}>
                                {vitals.map((entry: any) => (
                                    <div
                                        key={entry.date}
                                        style={{ display: 'flex', flexDirection: "column", textAlign: "right", padding: "10px 10px 10px 10px" }}
                                    >
                                        <span>{(DateHelpers as any).convertToDateTime(entry.date).toFormat('MM/dd/yy')}</span>
                                        {processedRows.map((row: any) => {
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
    const [flowsheets] = (useEncounter() as any).flowsheets([])
    const [conditionals] = (useEncounter() as any).conditionals()
    const [orders] = (useEncounter() as any).orders()
    const [flowsheetDefs] = (useDatabase() as any).flowsheets()

    const allFlowsheets = (flowsheets as any[])?.filter((f: any) => f.flowsheet === "1002339") ?? []
    const vitalsDefinition = (flowsheetDefs as any[])?.find((f: any) => f.id === "1002339")
    const vitals2 = filterDocuments(allFlowsheets, conditionals, orders)

    const _t = (x: any) => (DateHelpers as any).convertToDateTime(x.date).toMillis()
    const allVitals = (vitals2 ?? []).toSorted((a: any, b: any) => _t(b) - _t(a))
    const mostRecentDate = allVitals[0]?.date;
    const mostRecentDT = (DateHelpers as any).convertToDateTime(mostRecentDate);
    const vitalsDateLabel = mostRecentDT && mostRecentDT.isValid ? ` ${(DateHelpers as any).standardFormat(mostRecentDate)}` : '';

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
