async function getRxTerms(searchTerm) {
    try {
        const rxtermsApiUrl = `https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${searchTerm}&ef=STRENGTHS_AND_FORMS,RXCUIS`;
        const rxtermsResponse = await fetch(rxtermsApiUrl);

        const rxtermsData = await rxtermsResponse.json();
        
        results = formatRxTerms(rxtermsData);

        return results;
    } catch (error) {
        throw error;
    }
}

function formatRxTerms(data) {
     const formattedResult = new Map()

    data[1].forEach((drug, index) => {
        const drugAndRoute = drug.split(" (");
        
        const name = drugAndRoute[0];
        const route = drugAndRoute[1];

        const id = data[2]["SXDG_RXCUI"][index];
        const dose = data[2]["STRENGTHS_AND_FORMS"][index];
        const frequency = "string"; // Set frequency as needed
        const refills = 0; // Set refills as needed

        if (formattedResult.has(name)){
            entry = formattedResult.get(name);
            entry.id.push(id);
            entry.fields.dose.push(dose);
            entry.fields.route.push(route);
        }else{
           const formattedEntry = {
            id: [id],
            name,
            fields: {
                dose: [dose],
                route: [route],
                frequency,
                refills,
            },
            };


            formattedResult.set(name,formattedEntry);
        }

    });

    return Array.from(formattedResult.values());;
}

