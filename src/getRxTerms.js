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
   
    // Call the getMedicalCodes function to get the data
    // Initialize an empty array to store the formatted results
    const formattedResult = [];

    // Iterate through each drug and its strengths
    data[1].forEach((drug, index) => {
        const id = data[2]["RXCUIS"][index]
        const name = drug;
        const dose = data[2]["STRENGTHS_AND_FORMS"][index];
        const route = getRouteFromDose(dose);
        const frequency = "string"; // Set frequency as needed
        const refills = 0; // Set refills as needed

            // Create the formatted entry and push it to the array
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

        formattedResult.push(formattedEntry);
    });

    return formattedResult;
} 

// Function to extract the route from the dose
function getRouteFromDose(dose) {
    const uniqueRoutes = new Set();

    dose.forEach(doseItem => {
        const words = doseItem.split(" ");
        const route = words[words.length - 1];
        uniqueRoutes.add(route);
    });

    return Array.from(uniqueRoutes);
}