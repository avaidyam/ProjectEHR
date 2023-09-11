function getMedicalCodes(searchTerm, callback) {
    var rxtermsApiUrl = `https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${searchTerm}&ef=STRENGTHS_AND_FORMS`;
    var icd10ApiUrl = `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${searchTerm}`;
    var loincApiUrl = `https://clinicaltables.nlm.nih.gov/api/loinc_items/v3/search?terms=${searchTerm}&type=panel&df=text,LOINC_NUM`;

    $.get(rxtermsApiUrl, function (rxtermsData) {
        $.get(icd10cmApiUrl, function (icd10cmData) {
            $.get(loincApiUrl, function (loincData) {
                var result = {
                    rxterms: rxtermsData,
                    icd10cm: icd10Data,
                    loinc: loincData
                };
                callback(result);
            });
        });
    });
}