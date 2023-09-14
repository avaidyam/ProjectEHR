export async function getRxTerms(searchTerm) {
    const rxtermsApiUrl = `https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${searchTerm}&ef=STRENGTHS_AND_FORMS,RXCUIS`;
    const rxtermsResponse = await fetch(rxtermsApiUrl);
    const rxtermsData = await rxtermsResponse.json();
    return formatRxTerms(rxtermsData);
}

export function formatRxTerms(data) {
    const formattedResult = data[1].map((drug, index) => {
        const id = data[2]["RXCUIS"][index];
        const name = drug;
        const dose = data[2]["STRENGTHS_AND_FORMS"][index];
        const route = getRouteFromDose(dose);
        const frequency = "string"; // Set frequency as needed
        const refills = 0; // Set refills as needed

        const formattedEntry = {
            id,
            name,
            fields: {
                dose,
                route,
                frequency,
                refills,
            },
        };

        return formattedEntry;
    });

    return formattedResult;
}


// Function to extract the route from the dose
export function getRouteFromDose(dose) {
    const uniqueRoutes = new Set();

    dose.forEach(doseItem => {
        const words = doseItem.split(" ");
        const route = words[words.length - 1];
        uniqueRoutes.add(route);
    });

    return Array.from(uniqueRoutes);
}