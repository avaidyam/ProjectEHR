import React from 'react';
import DateHelpers from 'util/helpers';
import { Alert } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext';
import { filterDocuments } from 'util/helpers';

export const SidebarSepsisAlert = () => {
    const { useEncounter } = usePatient();
    const [flowsheets] = useEncounter().flowsheets([]);
    const [labs] = useEncounter().labs([]);
    const [conditionals] = useEncounter().conditionals()
    const [orders] = useEncounter().orders()

    const allFlowsheets = flowsheets?.filter(f => f.flowsheet === "1002339") ?? []
    const vitals2 = filterDocuments(allFlowsheets, conditionals, orders)
    const labsFiltered = filterDocuments(labs, conditionals, orders)

    const _t = (x) => DateHelpers.convertToDateTime(x.date).toMillis()
    const allVitals = (vitals2 ?? []).toSorted((a, b) => _t(b) - _t(a))

    const _t2 = (x) => DateHelpers.convertToDateTime(x["date"]).toMillis()
    const wbcLabs = labsFiltered
        .toSorted((a, b) => _t2(b) - _t2(a))
        .flatMap(d => d.components)
        .filter(x => x?.name === "WBC")
        .map(x => x?.value > x?.high)
        .filter(x => x)

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
