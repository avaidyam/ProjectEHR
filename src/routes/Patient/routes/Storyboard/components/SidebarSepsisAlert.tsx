import * as React from 'react';

import { Alert } from '@mui/material';
import { Database, usePatient } from 'components/contexts/PatientContext';
import { filterDocuments } from 'util/helpers';

export const SidebarSepsisAlert = () => {
  const { useEncounter } = usePatient();
  const [flowsheets] = useEncounter().flowsheets([]);
  const [labs] = useEncounter().labs([]);
  const [conditionals] = useEncounter().conditionals()
  const [orders] = useEncounter().orders()

  const allFlowsheets = flowsheets?.filter((f: any) => f.flowsheet === "1002339") ?? []
  const vitals2 = filterDocuments(allFlowsheets, conditionals, orders)
  const labsFiltered = filterDocuments(labs!, conditionals, orders)

  const _t = (x: Database.Flowsheet.Entry | Database.Lab) => !!x.date ? Temporal.Instant.from(x.date).epochMilliseconds : 0
  const allVitals = (vitals2 ?? []).toSorted((a, b) => _t(b) - _t(a))

  const wbcLabs = (labsFiltered ?? [])
    .toSorted((a, b) => _t(b) - _t(a))
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
