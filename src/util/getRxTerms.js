import _ from 'lodash';

/* SAMPLE OUTPUT for search term: Aspirin

Format is as follows 
id: This is the SX_RXCUI which is unique for each Name+Route combination of a drug on the RxTerms database.
name: Name of drug
fields.dose: The dose of the drug is returned in the same order as the corresponding route list
fields.route: The route of the drug
fields.frequency: placeholder
fields.refills: placeholder

[
  {
    "id": [
      "1154070",
      "1294937",
      "1154071"
    ],
    "name": "Aspirin",
    "fields": {
      "dose": [
        [
          " 81 mg Cap",
          " 81 mg DR Tab",
          " 81 mg Tab",
          "325 mg Cap",
          "325 mg DR Tab",
          "325 mg Tab",
          "500 mg DR Tab",
          "500 mg Tab",
          "650 mg DR Tab",
          "650 mg Tab"
        ],
        [
          "81 mg Tab"
        ],
        [
          "300 mg Suppository",
          "600 mg Suppository"
        ]
      ],
      "route": [
        "Oral Pill",
        "Chewable",
        "Rectal"
      ],
      "frequency": "string",
      "refills": [0,1,2,3]
    }
  }, */

const cbcjson = {
    "id": "00000", 
    "name": "CBC w/ DIFF",
    "fields": {
      "type": ["Outpatient", "Inpatient"],
      "status": ["Normal", "Standing", "Future"],
      "standing": {
        "frequency": ["1 month", "2 months", "3 months", "4 months", "6 months", "1 year"],
        "count": [1, 2, 3, 4, 6, 12]
      },
      "future": {
        "expect_date": ["today", "tomorrow", "1 week", "1 month", "2 months", "3 months", "6 months"],
        "expire_date": ["1 month", "2 months", "3 months", "4 months", "6 months", "1 year", "18 months"]
      },
      "priority": ["Routine", "STAT", "Timed", "Urgent"],
      "class": ["External Collect", "Clinic Collect", "Lab Collect"]
    }
}

function formatRxTerms(data) {
  const formattedResult = new Map();

  const [, drugNames] = data;

  (drugNames || []).forEach((drug, index) => {
    const drugAndRoute = drug.split(/\s+\(|\)\s*/);

    const [name, route] = drugAndRoute;

    /**
     * TODO: this line frequently throws, not sure what correct
     * behavior should be.
     *
     * I added lodash `_.get` here to just avoid throwing while
     * i'm testing the routing stuff - AJB 9/30
     */
    const id = _.get(data[2], ['SXDG_RXCUI', index]);

    const dose = data[2].STRENGTHS_AND_FORMS[index];
    const frequency = 'string'; // Set frequency as needed
    const refills = [0,1,2,3]; // Set refills as needed
    let entry = null;

    if (formattedResult.has(name)) {
      entry = formattedResult.get(name);
      entry.id.push(id);
      entry.fields.dose.push(dose);
      entry.fields.route.push(route.replace(')', ''));
    } else {
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

      formattedResult.set(name, formattedEntry);
    }
  });

  return Array.from(formattedResult.values());
}

// sort json list, also if first letter matches first letter of search phrase, will push to top of list
function sortJson(results, par, firstLetter){
  return results.sort((a, b) => {
      const itemA = a[par].toLowerCase(); 
      const itemB = b[par].toLowerCase(); 
      let retVal = 0;
      if (firstLetter.length !== 0){
        if (itemA.charAt(0) === firstLetter && itemB.charAt(0) !== firstLetter){
          retVal = -1;
        }
        else if (itemB.charAt(0) === firstLetter && itemA.charAt(0) !== firstLetter){
          retVal = 1;
        }
      }
      else if (itemA < itemB) {
        retVal = -1;
      }
      else if (itemA > itemB) {
        retVal = 1;
      }
      return retVal;
   })
}

// DO NOT USE THIS FUNCTION ANYMORE!
export async function __getRxTerms(searchTerm) {
  /** disabled nonfunctional try-catch to make eslint happy */
  // try 
  const rxtermsApiUrl = `https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${searchTerm}&ef=STRENGTHS_AND_FORMS,RXCUIS&maxList=500`;
  const rxtermsResponse = await fetch(rxtermsApiUrl);

  const rxtermsData = await rxtermsResponse.json();
  const results = formatRxTerms(rxtermsData);

  // appending CBC w/ DIFF lab to list of possible orders
  if ("cbc w/ diff".includes(searchTerm.toLowerCase())){
    results.push(cbcjson); 
  }

  return sortJson(results, 'name', searchTerm.charAt(0).toLowerCase());
  // } catch (error) {
  //   throw error;
  // }
}
