import React from 'react';
import { DateHelpers } from 'util/helpers.js';
import { Alert } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext';
import { filterDocuments } from 'util/helpers.js';

export const SidebarSepsisAlert = () => {
    const { useEncounter } = usePatient();
    const [flowsheets] = (useEncounter() as any).flowsheets([]);
    const [labs] = (useEncounter() as any).labs([]);
    const [conditionals] = (useEncounter() as any).conditionals()
    const [orders] = (useEncounter() as any).orders()

    const allFlowsheets = (flowsheets as any[])?.filter((f: any) => f.flowsheet === "1002339") ?? []
    const vitals2 = filterDocuments(allFlowsheets, conditionals, orders)
    const labsFiltered = filterDocuments(labs as any[], conditionals, orders)

    const _t = (x: any) => (DateHelpers as any).convertToDateTime(x.date).toMillis()
    const allVitals = (vitals2 as any[] ?? []).toSorted((a: any, b: any) => _t(b) - _t(a))

    const _t2 = (x: any) => (DateHelpers as any).convertToDateTime(x["date"]).toMillis()
    const wbcLabs = (labsFiltered as any[])
        .toSorted((a: any, b: any) => _t2(b) - _t2(a))
        .flatMap((d: any) => d.components)
        .filter((x: any) => x?.name === "WBC")
        .map((x: any) => x?.value > x?.high)
        .filter((x: any) => x)

    const isSepsis = (allVitals[0]?.rr > 22) && (allVitals[0]?.hr > 100) && (allVitals[0]?.temp > 38) && (wbcLabs.length > 0)

    return isSepsis ?
        <Alert
            icon={false}
            sx={{
                mt: .5, py: 0.1,
                bgcolor: '#ffcb00',
                color: 'black',
                fontWeight: 'bold',
            }}
        >
            Sepsis Alert
        </Alert> :
        <></>
}
