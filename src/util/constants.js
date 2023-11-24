export const URL_KEYS = {
  MRN: 'mrn',
  SELECTED_PATIENT_TAB: 'patient_tab',
};

// A very rudimentary FHIR store; filter by `resourceType`, etc to use.
// This is global-scoped because it will need to be accessible from across the app right now;
// that's not good API design though and this will change in the future.
//
// Use the `_misc.json` file for any custom FHIR objects we want to add for our testing needs.
//
// USAGE:
// let enc = PATIENT_DATA.filter(x => x.resourceType === "Encounter")[7]
// let labs = PATIENT_DATA.filter(x => x.resourceType === "Observation" && x.encounter?.reference === `urn:uuid:${enc.id}`)
// console.dir(labs)
// 
// NOTE: `labs` here includes vital signs (like height/weight) -- filter by `category[0].code !== "vital-signs"` to ignore.
//
global.PATIENT_DATA = [];
[
  "_misc",
  "hospitalInformation1559319163815",
  "practitionerInformation1559319163815",
  "Albertina_Klocko_b91a2510-0787-4636-9e3a-6a7e40a3025a",
  "Ernest_Labadie_2468bfa8-f32f-46aa-8b1e-18de0adaabc7",
  "Clelia_Green_6902389e-b6f7-4778-bf89-befb7ebf4b82",
  "Jeffery_Daniel_98cd2b5a-55bf-4fc7-b02d-14373a371444",
  "Delbert_Jaskolski_b4ddcf4a-0b11-43c4-ab11-6942f01af3db",
  "Owen_Howe_20225884-bc96-417d-b095-e7c8368176c4",
  "Donny_Prosacco_a37db082-42ac-4e16-b2db-b501069c3144",
  "Robby_Jacobi_033b7976-2f2f-4114-a9c8-63511b778194",
  "Elijah_Zieme_c7b3535b-25c5-46e9-990e-d4f4afc57897",
  "Willis_Crona_fdf552f5-418c-4f75-b8da-894d3f15b11d",
  "Blake_Eichmann_6c099f2d-1173-468d-b95f-4fbf960b3b55",
  "Brett_Gottlieb_0d2177ba-f67b-4f29-addb-91040de55388",
  "Buster_Hoeger_ad2e3fc5-2b5d-4cb9-8d03-9ea0f4ac8423",
  "Chauncey_Johnston_f4673866-81fb-411a-8486-0c27f2a5b480",
  "Chet_Hoeger_5c6db3d0-c0fc-4eb7-8eae-dbc7847be741",
  "Chet_Thompson_eda17701-070d-4fae-9f7d-c8cd6263b63a",
  "Christian_Balistreri_59339691-0270-4c4a-a34d-338e3008b9c3",
  "Clarence_Mills_0753ad6c-5935-4faa-9cfe-b7269e963d77",
  "Clemente_Kreiger_1484a42d-0eaf-4654-9cbf-6b050a5cd73b",
  "Dannie_Schmitt_22d6efc6-2dc7-4f36-9d27-84fc6609c469",
  "Delbert_Williamson_61d8af4e-34ee-4e65-a055-db3806a0bcc2",
  "Denny_Bins_bc0fbd67-bfe3-46c8-8ce9-ef20b0705b46",
  "Desmond_Gutmann_d49945ce-9f8c-4974-80e3-0b38054dd45d",
  "Edward_Gulgowski_43481611-2459-44f5-ab20-4b142dac160f",
  "Enda_Schaefer_dd760206-6c4e-4e25-a799-f5c563e489a1",
  "Felipe_Cazares_d374d52b-0e57-495a-b373-9150e3cc8286",
  "Floyd_Connelly_66843218-a9f9-4f16-8347-bdc2a0d14265",
  "Fredrick_Kris_ec6a5bb6-b412-4bb6-8219-11d66f52ae8b",
  "Garrett_Thompson_5a72e290-8102-4c8a-84f7-f838387508b2",
  "Geoffrey_Abbott_73a7d6b7-0310-4fff-9b0b-7891a5e390f5",
  "Gustavo_Mejía_59a8543c-e24f-4a01-b28b-47ccde6bc11d",
  "Hershel_Marvin_71a7f9d4-45b7-481b-b571-7ee0caca6e2a",
  "Jacob_Larson_0b324782-31d1-4659-89ab-58e075d6e61f",
  "Jesús_Alvarez_c0580b5a-6fc2-4b72-b691-57a71afb5597",
  "Joaquin_Rodriguez_69ee9841-f4a6-427a-a2fd-f5a891682057",
  "Joie_Morissette_c47db034-eb1c-4100-9448-4d4b3cb6535c",
  "Kermit_Trantow_f1a650a5-737e-4fd7-828e-03c3348b9524",
  "Lemuel_Hodkiewicz_ece76cc5-d728-4ddd-a85d-a47de7d1649a",
  "Liz_Conn_27c911c6-f045-4ffa-af5d-6eba57ac94b2",
  "Louis_Miller_f8bbc4a5-8a9f-45ed-a807-b715feefb2ef",
  "Luigi_Wiegand_e27d88b0-c5e5-4042-ad49-184f6a900ee3",
  "Lupe_Little_f8a42e66-8c03-4ee6-85e3-3817c2942de1",
  "Malcolm_Dach_281f4a03-57e9-4b22-a322-68890ff22172",
  "Michael_Kihn_376f9fc0-ecd8-468a-ad93-3534a14561a3",
  "Ned_Hintz_e4b9259d-0f54-48d1-a35d-b526729a4dfe",
  "Osvaldo_Graham_4fd1c2c4-9b09-4037-b218-a755900d1a8e",
  "Paris_Casper_826f1b71-0205-4543-b019-ce6583b77fc5",
  "Stanley_Balistreri_08ce8462-f56a-4fd6-b986-ea75c5c6edb2",
  "Stephen_McLaughlin_7735ab79-6ac8-4b81-9936-f7ddabd18751",
  "Valentin_Keeling_eec512c0-d680-4dd8-a7ce-5102193974fd",
  "Wiley_Wisoky_0dae4422-bf65-475b-8d93-4c1382168951",
  "Willy_Koepp_ebbb96ce-c538-4ac4-ad6a-7c709ef6639c",
  "Wilson_Marks_68f6dc04-4ae2-41c5-a534-df8f9ea1c00e",
  "Xavier_Lueilwitz_1af31141-7c85-4dc9-8472-8fd3fa953ee8"
].forEach(async (key) => {
  console.log(`Loading generated sample patient data '${key}'...`)
  global.PATIENT_DATA.push(...(await (await fetch(`data/${key}.json`)).json()).entry.map(x => x.resource))
  console.log(`Loaded record count: ${global.PATIENT_DATA.length}`)
})

