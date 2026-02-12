import * as React from 'react';
import { Box, Button, ButtonGroup, Autocomplete, TextField, RichTextEditor, Icon, Label, Grid, Window, DatePicker, dayjs } from 'components/ui/Core';
import { Typography } from '@mui/material';

/**
 * Parse a dose string like "500 mg Tab" or "100 mg/5ml Susp" to extract:
 * - strengthValue: numeric value (500, 100)
 * - strengthUnit: unit (mg, mcg, g, etc.)
 * - perVolume: for liquid doses, the volume (5 for "100 mg/5ml")
 * - perVolumeUnit: unit for volume (ml)
 * - form: dosage form (Tab, Cap, Susp, Sol, etc.)
 * - formLabel: human-readable label for the form (tablet, capsule, mL, etc.)
 * - isCombo: true if this is a combination medication (e.g., "400-5 mg Tab")
 * - secondaryStrength: for combo meds, the second component strength
 */
const parseDoseString = (doseStr: string | null | undefined) => {
  if (!doseStr) return null;

  // Normalize unit abbreviations and formatting
  let normalizedStr = doseStr
    .replace(/\bunt\b/gi, 'units')  // "unt" -> "units"
    .replace(/\bunit\b/gi, 'units') // ensure plural
    .replace(/,/g, '');             // remove commas from numbers like "1,500"

  // Skip percentage-based formulations (creams, gels, etc.) - can't calculate pills
  if (/%/.test(normalizedStr)) {
    return null;
  }

  // Skip cell-based and viral particle formulations
  if (/cells?\//i.test(normalizedStr) || /viral-particles/i.test(normalizedStr)) {
    return null;
  }

  // Skip complex multi-component formulations (more than 2 components)
  // Matches patterns like "X-X-X" where X can be decimals
  if (/[\d.]+\s*-\s*[\d.]+\s*-\s*[\d.]+/.test(normalizedStr)) {
    return null;
  }

  // Skip variable units (can't calculate)
  if (/var\s*units/i.test(normalizedStr)) {
    return null;
  }

  // Skip radioactive doses (mci = millicuries)
  if (/mci\//i.test(normalizedStr)) {
    return null;
  }

  // Skip size-based formulations (implants, patches by area)
  if (/\d+\s*(cm|sqcm|sq)\s+(Drug Implant|Medicated)/i.test(normalizedStr)) {
    return null;
  }

  // Skip special units that can't be calculated
  if (/sq-hdm|var\s/i.test(normalizedStr)) {
    return null;
  }

  // Skip gene therapy doses (vector-genomes)
  if (/vector-genomes/i.test(normalizedStr)) {
    return null;
  }

  // Skip inverted ratios (units/mg instead of mg/unit)
  if (/unt\/mg|units\/mg/i.test(normalizedStr)) {
    return null;
  }

  // Skip volume-only doses with no strength (e.g., "0.3 ml Inhalant")
  if (/^[\d.]+\s*(ml|l)\s+\w/i.test(normalizedStr)) {
    return null;
  }

  // Skip dose per area (e.g., "0.004 mg/sqcm Medicated Tape")
  if (/\/sqcm/i.test(normalizedStr)) {
    return null;
  }

  // Skip German units (ein = Einheit)
  if (/ein\/ml/i.test(normalizedStr)) {
    return null;
  }

  // Skip unusual concentrations (ml/ml) and allergen units (BAU)
  if (/ml\/ml|bau\s/i.test(normalizedStr)) {
    return null;
  }

  // Pattern 1: Combo medication - "400-5 mg Tab" or "25-20 mg Tab" or "12.5-10 mg Tab"
  const comboMatch = normalizedStr.match(/^([\d.]+)-([\d.]+)\s*(mg|mcg|g|mEq|units?)\s+(.+)$/i);

  // Pattern 2: Combo liquid - "0.12-0.12 mg/ml Injection"
  const comboLiquidMatch = normalizedStr.match(/^([\d.]+)-([\d.]+)\s*(mg|mcg|g|mEq|units?)\/([\d.]*)(ml|l)\s+(.+)$/i);

  // Pattern 3: Simple - "500 mg Tab"
  const simpleMatch = normalizedStr.match(/^([\d.]+)\s*(mg|mcg|g|mEq|units?)\s+(.+)$/i);

  // Pattern 4: Concentration - "100 mg/5ml Susp" or "4 mg/ml Injection"
  const concMatch = normalizedStr.match(/^([\d.]+)\s*(mg|mcg|g|mEq|units?)\/([\d.]*)(ml|l)\s+(.+)$/i);

  // Pattern 5: Per-puff/spray/injection - "10 mg/puff DPI 1 puff" or "20 mcg/injection Pen Injector"
  const puffMatch = normalizedStr.match(/^([\d.]+)\s*(mg|mcg)\/(puff|actuation|spray|injection)\s+(.+)$/i);
  const comboPuffMatch = normalizedStr.match(/^([\d.]+)-([\d.]+)\s*(mg|mcg)\/(puff|actuation|spray|injection)\s+(.+)$/i);

  // Pattern 6: Per-hour patch - "0.208 mg/hr 168 HR Patch"
  const patchMatch = normalizedStr.match(/^([\d.]+)\s*(mg|mcg)\/hr\s+(.+)$/i);

  // Pattern 7: Combo patch - "0.000542-0.00625 mg/hr System"
  const comboPatchMatch = normalizedStr.match(/^([\d.]+)-([\d.]+)\s*(mg|mcg)\/hr\s+(.+)$/i);

  // Pattern 8: Prefilled syringe with dose/volume - "30 mg/0.3 ml Prefilled Syringe"
  const prefilledMatch = normalizedStr.match(/^([\d.]+)\s*(mg|mcg|g|mEq|units?)\/([\d.]+)\s*(ml)\s+(Prefilled Syringe.*)$/i);

  // Helper to determine form label
  const getFormLabel = (form: string) => {
    const formLower = form.toLowerCase();
    if (formLower.includes('tab')) return 'tablet';
    if (formLower.includes('cap')) return 'capsule';
    if (formLower.includes('puff')) return 'puff';
    if (formLower.includes('patch')) return 'patch';
    if (formLower.includes('supp')) return 'suppository';
    if (formLower.includes('pwdr') || formLower.includes('powder')) return 'packet';
    if (formLower.includes('lozenge')) return 'lozenge';
    if (formLower.includes('gum')) return 'piece';
    if (formLower.includes('film')) return 'film';
    if (formLower.includes('spray')) return 'spray';
    if (formLower.includes('syringe')) return 'syringe';
    if (formLower.includes('injection') || formLower.includes('inj')) return 'injection';
    return 'unit';
  };

  // Handle combo puff (inhaler) - e.g., "100-50 mcg/puff MDI 60 puff"
  if (comboPuffMatch) {
    const [, primaryStrength, secondaryStrength, strengthUnit, , form] = comboPuffMatch;
    return {
      strengthValue: parseFloat(primaryStrength),
      secondaryStrength: parseFloat(secondaryStrength),
      strengthUnit: strengthUnit.toLowerCase(),
      perVolume: 1,
      perVolumeUnit: 'puff',
      form: form.trim(),
      formLabel: 'puff',
      isLiquid: false,
      isCombo: true,
      isPuff: true
    };
  }

  // Handle simple puff (inhaler) - e.g., "10 mg/puff DPI 1 puff"
  if (puffMatch) {
    const [, strengthValue, strengthUnit, , form] = puffMatch;
    return {
      strengthValue: parseFloat(strengthValue),
      secondaryStrength: null,
      strengthUnit: strengthUnit.toLowerCase(),
      perVolume: 1,
      perVolumeUnit: 'puff',
      form: form.trim(),
      formLabel: 'puff',
      isLiquid: false,
      isCombo: false,
      isPuff: true
    };
  }

  // Handle prefilled syringe - e.g., "30 mg/0.3 ml Prefilled Syringe 0.3 ml"
  if (prefilledMatch) {
    const [, strengthValue, strengthUnit, volume, volumeUnit, form] = prefilledMatch;
    return {
      strengthValue: parseFloat(strengthValue),
      secondaryStrength: null,
      strengthUnit: strengthUnit.toLowerCase(),
      perVolume: parseFloat(volume),
      perVolumeUnit: volumeUnit.toLowerCase(),
      form: form.trim(),
      formLabel: 'syringe',
      isLiquid: false, // Treated as a unit (1 syringe) rather than volume
      isCombo: false,
      isPrefilled: true
    };
  }

  // Handle combo patch - e.g., "0.000542-0.00625 mg/hr System"
  if (comboPatchMatch) {
    const [, primaryStrength, secondaryStrength, strengthUnit, form] = comboPatchMatch;
    return {
      strengthValue: parseFloat(primaryStrength),
      secondaryStrength: parseFloat(secondaryStrength),
      strengthUnit: strengthUnit.toLowerCase(),
      perVolume: 1,
      perVolumeUnit: 'hr',
      form: form.trim(),
      formLabel: 'patch',
      isLiquid: false,
      isCombo: true,
      isPatch: true
    };
  }

  // Handle per-hour patch - e.g., "0.208 mg/hr 168 HR Patch"
  if (patchMatch) {
    const [, strengthValue, strengthUnit, form] = patchMatch;
    return {
      strengthValue: parseFloat(strengthValue),
      secondaryStrength: null,
      strengthUnit: strengthUnit.toLowerCase(),
      perVolume: 1,
      perVolumeUnit: 'hr',
      form: form.trim(),
      formLabel: 'patch',
      isLiquid: false,
      isCombo: false,
      isPatch: true
    };
  }

  // Handle combo liquid (e.g., "0.12-0.12 mg/ml Injection 0.5 ml")
  if (comboLiquidMatch) {
    const [, primaryStrength, secondaryStrength, strengthUnit, perVolume, perVolumeUnit, form] = comboLiquidMatch;
    const volumeVal = perVolume ? parseFloat(perVolume) : 1;
    return {
      strengthValue: parseFloat(primaryStrength),
      secondaryStrength: parseFloat(secondaryStrength),
      strengthUnit: strengthUnit.toLowerCase(),
      perVolume: volumeVal,
      perVolumeUnit: perVolumeUnit.toLowerCase(),
      form: form.trim(),
      formLabel: 'mL',
      isLiquid: true,
      isCombo: true
    };
  }

  // Handle combo medications (e.g., "400-5 mg Tab")
  if (comboMatch) {
    const [, primaryStrength, secondaryStrength, strengthUnit, form] = comboMatch;
    return {
      strengthValue: parseFloat(primaryStrength),
      secondaryStrength: parseFloat(secondaryStrength),
      strengthUnit: strengthUnit.toLowerCase(),
      perVolume: null,
      perVolumeUnit: null,
      form: form.trim(),
      formLabel: getFormLabel(form),
      isLiquid: false,
      isCombo: true
    };
  }

  // Handle simple liquid concentration
  if (concMatch) {
    const [, strengthValue, strengthUnit, perVolume, perVolumeUnit, form] = concMatch;
    const volumeVal = perVolume ? parseFloat(perVolume) : 1;
    return {
      strengthValue: parseFloat(strengthValue),
      secondaryStrength: null,
      strengthUnit: strengthUnit.toLowerCase(),
      perVolume: volumeVal,
      perVolumeUnit: perVolumeUnit.toLowerCase(),
      form: form.trim(),
      formLabel: 'mL',
      isLiquid: true,
      isCombo: false
    };
  }

  // Handle simple solid dose
  if (simpleMatch) {
    const [, strengthValue, strengthUnit, form] = simpleMatch;
    return {
      strengthValue: parseFloat(strengthValue),
      secondaryStrength: null,
      strengthUnit: strengthUnit.toLowerCase(),
      perVolume: null,
      perVolumeUnit: null,
      form: form.trim(),
      formLabel: getFormLabel(form),
      isLiquid: false,
      isCombo: false
    };
  }

  return null;
};

/**
 * Calculate the number of units needed for a given dose
 * For combo medications, the calculation is based on the primary (first) component
 * and the secondary component is calculated proportionally
 */
const calculateDose = (desiredDose: number, desiredUnit: string, parsedDose: any) => {
  if (!parsedDose || !desiredDose || desiredDose <= 0) return null;

  // Normalize units for comparison
  const normalizeUnit = (unit: string | null | undefined) => {
    const u = unit?.toLowerCase() || '';
    if (u === 'g' || u === 'gram' || u === 'grams') return 'g';
    if (u === 'mg' || u === 'milligram' || u === 'milligrams') return 'mg';
    if (u === 'mcg' || u === 'microgram' || u === 'micrograms' || u === 'µg') return 'mcg';
    if (u === 'meq') return 'meq';
    if (u === 'unit' || u === 'units' || u === 'unt') return 'units';
    return u;
  };

  // Convert to base unit (mg) for calculation
  const toMg = (value: number, unit: string) => {
    const normalizedUnit = normalizeUnit(unit);
    if (normalizedUnit === 'g') return value * 1000;
    if (normalizedUnit === 'mcg') return value / 1000;
    return value; // assume mg or other unit
  };

  const desiredMg = toMg(desiredDose, desiredUnit);
  const strengthMg = toMg(parsedDose.strengthValue, parsedDose.strengthUnit);

  // Handle puff-based doses (inhalers)
  if (parsedDose.isPuff) {
    // For puffs: calculate number of puffs needed
    // e.g., 100 mcg/puff -> to get 200 mcg, need 2 puffs
    const puffsNeeded = desiredMg / strengthMg;

    let secondaryAmount = null;
    if (parsedDose.isCombo && parsedDose.secondaryStrength) {
      secondaryAmount = puffsNeeded * parsedDose.secondaryStrength;
    }

    return {
      quantity: puffsNeeded,
      label: 'puff',
      isLiquid: false,
      isPuff: true,
      isCombo: parsedDose.isCombo,
      secondaryAmount,
      secondaryUnit: parsedDose.strengthUnit,
      primaryStrength: parsedDose.strengthValue,
      secondaryStrength: parsedDose.secondaryStrength
    };
  }

  // Handle patch doses (transdermal)
  if (parsedDose.isPatch) {
    // For patches: the dose is per hour, so calculate based on rate
    // This is more informational - patches are typically whole units
    const rateRatio = desiredMg / strengthMg;

    return {
      quantity: rateRatio,
      label: 'patch',
      isLiquid: false,
      isPatch: true,
      isCombo: false,
      secondaryAmount: null,
      secondaryUnit: null,
      primaryStrength: parsedDose.strengthValue,
      note: rateRatio === 1 ? null : `(${rateRatio.toFixed(2)}x the patch rate)`
    };
  }

  if (parsedDose.isLiquid) {
    // For liquids: calculate mL needed
    // e.g., 160 mg/5ml -> to get 320 mg, need (320/160)*5 = 10 ml
    const mlPerMgRatio = parsedDose.perVolume / strengthMg;
    const mlNeeded = desiredMg * mlPerMgRatio;

    // For combo liquids, calculate the secondary component
    let secondaryAmount = null;
    if (parsedDose.isCombo && parsedDose.secondaryStrength) {
      // Secondary amount is proportional: (mlNeeded / perVolume) * secondaryStrength
      secondaryAmount = (mlNeeded / parsedDose.perVolume) * parsedDose.secondaryStrength;
    }

    return {
      quantity: mlNeeded,
      label: parsedDose.formLabel,
      isLiquid: true,
      isCombo: parsedDose.isCombo,
      secondaryAmount,
      secondaryUnit: parsedDose.strengthUnit
    };
  } else {
    // For solid doses: calculate number of units
    const unitsNeeded = desiredMg / strengthMg;

    // For combo medications, calculate the secondary component amount
    let secondaryAmount = null;
    if (parsedDose.isCombo && parsedDose.secondaryStrength) {
      // Secondary amount = unitsNeeded * secondaryStrength per unit
      secondaryAmount = unitsNeeded * parsedDose.secondaryStrength;
    }

    return {
      quantity: unitsNeeded,
      label: parsedDose.formLabel,
      isLiquid: false,
      isCombo: parsedDose.isCombo,
      secondaryAmount,
      secondaryUnit: parsedDose.strengthUnit,
      primaryStrength: parsedDose.strengthValue,
      secondaryStrength: parsedDose.secondaryStrength
    };
  }
};

/**
 * Format the calculated dose for display
 */
const formatCalculatedDose = (calc: any) => {
  if (!calc) return null;

  const { quantity, label, isLiquid, isCombo, secondaryAmount, secondaryUnit, primaryStrength, secondaryStrength } = calc;

  // Round to reasonable precision
  const roundQuantity = (qty: number, liquid: boolean) => {
    if (liquid) {
      // For liquids, show up to 2 decimal places
      return Math.round(qty * 100) / 100;
    } else {
      // For solids, show common fractions or decimals
      if (Math.abs(qty - Math.round(qty)) < 0.01) {
        return Math.round(qty);
      } else if (Math.abs(qty - Math.round(qty * 2) / 2) < 0.01) {
        // Close to 0.5
        return Math.round(qty * 2) / 2;
      } else if (Math.abs(qty - Math.round(qty * 4) / 4) < 0.01) {
        // Close to 0.25
        return Math.round(qty * 4) / 4;
      } else {
        return Math.round(qty * 100) / 100;
      }
    }
  };

  const displayQty = roundQuantity(quantity, isLiquid);

  // Pluralize label
  const pluralLabel = displayQty === 1 ? label : (label + 's').replace('capsules', 'capsules').replace('tablets', 'tablets');

  let result = `${displayQty} ${pluralLabel}`;

  // For combo medications, add info about the secondary component
  if (isCombo && secondaryAmount != null && secondaryStrength != null) {
    const displaySecondary = Math.round(secondaryAmount * 100) / 100;
    result += ` (includes ${displaySecondary} ${secondaryUnit} of secondary)`;
  }

  return result;
};

const rxParams = [
  {
    name: "Route",
    required: true,
    type: "string", // number, string, select, date, richtext, readonly
    options: [],
  },
  {
    name: "Dose",
    required: true,
    type: "string",
    options: [],
  },
  {
    name: "Frequency",
    required: true,
    type: "string",
    options: null,
  },
  {
    name: "Refills",
    required: true,
    type: "select",
    options: [0, 1, 2, 3],
  },
  {
    name: "Order type",
    required: true,
    type: "select",
    options: [
      "Outpatient",
      "Inpatient"
    ],
  },
  {
    name: "Status",
    required: true,
    type: "select",
    options: [
      "Standing",
      "Future"
    ],
  },
  {
    name: "Interval",
    required: true,
    type: "select",
    options: [
      "1 Month",
      "2 Months",
      "3 Months",
      "4 Months",
      "6 Months",
      "1 Year"
    ],
    condition: { "Status": "Standing" },
  },
  {
    name: "Count",
    required: true,
    type: "select",
    options: [1, 2, 3, 4, 6, 12],
    condition: { "Status": "Standing" },
  },
  {
    name: "Expected date",
    required: true,
    type: "date",
    options: [
      "Today",
      "Tomorrow",
      "1 Week",
      "2 Weeks",
      "1 Month",
      "2 Months",
      "3 Months",
      "6 Months"
    ],
    condition: { "Status": "Future" },
  },
  {
    name: "Expires",
    required: true,
    type: "date",
    options: [
      "1 Month",
      "2 Months",
      "3 Months",
      "4 Months",
      "6 Months",
      "1 Year",
      "18 Months"
    ],
    condition: { "Status": "Future" },
  },
  {
    name: "Priority",
    required: true,
    type: "select",
    options: [
      "STAT",
      "Routine",
      "Timed",
    ]
  },
  {
    name: "Class",
    required: true,
    type: "select",
    options: [
      "Lab",
      "Unit"
    ]
  },
]

const consultParams: any[] = []

const alwaysParams = [{ name: "Comments", required: false, type: "html" }]

/**
 * Check if any formulation in the list is calculable (can have dose calculated)
 * Returns true if at least one formulation can be parsed for dose calculation
 */
const hasCalculableFormulations = (formulations: any[]) => {
  if (!formulations || formulations.length === 0) return false;
  return formulations.some((f: any) => parseDoseString(f) !== null);
};

/**
 * Get a description for non-calculable formulations (for display purposes)
 */
const getNonCalculableDescription = (formulation: string | null) => {
  if (!formulation) return 'Select formulation';
  const lower = formulation.toLowerCase();
  if (lower.includes('cream') || lower.includes('ointment') || lower.includes('lotion')) {
    return 'Apply as directed';
  }
  if (lower.includes('gel')) {
    return 'Apply as directed';
  }
  if (lower.includes('patch') && lower.includes('sqcm')) {
    return 'Apply patch as directed';
  }
  if (lower.includes('shampoo')) {
    return 'Use as directed';
  }
  if (lower.includes('solution') || lower.includes('sol')) {
    return 'Use as directed';
  }
  return 'Use as directed';
};

export const OrderComposer = ({ medication: tempMed, open, onSelect, ...props }: { medication: any; open: any; onSelect: (item: any) => void;[key: string]: any }) => {
  const [params, setParams] = React.useState<Record<string, any>>({})
  const [doseAmount, setDoseAmount] = React.useState('') // The numeric dose amount (e.g., "1600")
  const [doseUnit, setDoseUnit] = React.useState('mg') // The unit for the dose amount
  const [selectedFormulation, setSelectedFormulation] = React.useState('') // The selected package/formulation (e.g., "800 mg Tab")

  // Handle both standard medication objects and "unpacked" ones with routesMap
  const effectiveRoutes = React.useMemo(() => {
    return tempMed?.routesMap || tempMed?.route || {}
  }, [tempMed])

  const effectiveName = tempMed?.originalName || tempMed?.name || ''

  // Get available formulations for the selected route
  const availableFormulations = React.useMemo(() => {
    return Object.values(effectiveRoutes?.[params["Route"]] ?? {})
  }, [effectiveRoutes, params["Route"]])

  // Check if dose calculation makes sense for this medication/route
  const isDoseCalculable = React.useMemo(() => {
    return hasCalculableFormulations(availableFormulations);
  }, [availableFormulations])

  // set the default route when medication changes
  React.useEffect(() => {
    const initialRoute = (typeof tempMed?.route === 'string' && effectiveRoutes[tempMed.route])
      ? tempMed.route
      : (Object.keys(effectiveRoutes)?.[0] ?? '')

    setParams((prev: Record<string, any>) => ({ ...prev, ['Route']: initialRoute }))
    setDoseAmount('')
    setSelectedFormulation('')
  }, [tempMed, effectiveRoutes])

  // set the default formulation when route changes
  React.useEffect(() => {
    const formulations = Object.values(effectiveRoutes?.[params["Route"]] ?? {})
    if (tempMed?.dose && formulations.includes(tempMed.dose) && params["Route"] === tempMed.route) {
      setSelectedFormulation(tempMed.dose)
    } else {
      setSelectedFormulation((formulations[0] as string) ?? '')
    }

    setDoseAmount('')
  }, [tempMed, effectiveRoutes, params["Route"]])

  // Parse the selected formulation and calculate units needed
  const parsedFormulation = React.useMemo(() => {
    return parseDoseString(selectedFormulation);
  }, [selectedFormulation])

  const calculatedDose = React.useMemo(() => {
    if (!doseAmount || !parsedFormulation) return null;
    return calculateDose(parseFloat(doseAmount), doseUnit, parsedFormulation);
  }, [doseAmount, doseUnit, parsedFormulation])

  const calculatedDoseDisplay = React.useMemo(() => formatCalculatedDose(calculatedDose), [calculatedDose])

  // if this is an Rx then substitute the Route and Dose options
  // Push a default Comments field that exists for ALL orders.
  let displayParams = [...(Object.keys(effectiveRoutes).length > 0 ? rxParams : consultParams), ...alwaysParams]
  if (Object.keys(effectiveRoutes).length > 0) {
    displayParams[0].options = Object.keys(effectiveRoutes)
    // Remove the Dose options since we're handling it specially
    displayParams[1].options = []
  }

  return (
    <Window
      fullWidth
      maxWidth="md"
      title={effectiveName}
      open={!!open}
      onClose={() => onSelect(null)}
      ContentProps={{ sx: { p: 0 } }}
      footer={<>
        <Button color="success" onClick={() => onSelect({
          name: effectiveName,
          code: tempMed.code,
          ...params,
          // Include dose information (only for calculable medications)
          dose: isDoseCalculable && doseAmount && doseUnit ? `${doseAmount} ${doseUnit}` : (selectedFormulation || null),
          formulation: selectedFormulation,
          calculatedDose: isDoseCalculable ? calculatedDoseDisplay : null
        })}><Icon>check</Icon>Accept</Button>
        <Button color="error" onClick={() => onSelect(null)}><Icon>clear</Icon>Cancel</Button>
      </>}
    >
      <Grid container spacing={1} sx={{ m: 0, p: 1 }}>
        {displayParams.filter((x: any) =>
          Object.entries(x.condition ?? {}).findIndex(([key, value]: [string, any]) => params[key] !== value) < 0
        ).map((x: any) => (
          <React.Fragment key={x.name}>
            <Grid size={3}><Label>{x.name}</Label></Grid>
            <Grid size={9}>
              {/* Special handling for Dose field - different UI based on whether dose is calculable */}
              {x.name === "Dose" && tempMed?.route ? (
                isDoseCalculable ? (
                  // Calculable medications: show dose input + formulation buttons
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <TextField
                      fullWidth={false}
                      size="small"
                      type="number"
                      placeholder="Enter dose"
                      value={doseAmount}
                      onChange={(e) => setDoseAmount(e.target.value)}
                      sx={{ width: 120 }}
                      inputProps={{ min: 0, step: "any" }}
                    />
                    <Autocomplete
                      size="small"
                      options={['mg', 'mcg', 'g', 'mEq', 'units']}
                      value={doseUnit}
                      onChange={(e: any, value: any) => setDoseUnit(value || 'mg')}
                      disableClearable
                      sx={{ width: 90 }}
                      renderInput={(inputProps: any) => <TextField {...inputProps} />}
                    />
                    <ButtonGroup
                      exclusive
                      value={selectedFormulation}
                      onChange={((event, value) => {
                        if (value) setSelectedFormulation(value)
                      })}
                      sx={{ ml: 1 }}
                    >
                      {availableFormulations.slice(0, 4).map((form: any) => (
                        <Button
                          key={form}
                          value={form}
                          variant={selectedFormulation === form ? 'contained' : 'outlined'}
                          onClick={() => setSelectedFormulation(form)}
                          sx={{
                            fontSize: '0.75rem',
                            py: 0.5,
                            px: 1,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {form}
                        </Button>
                      ))}
                    </ButtonGroup>
                  </Box>
                ) : (
                  // Non-calculable medications (creams, gels, etc.): just show formulation selection
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <ButtonGroup
                      exclusive
                      value={selectedFormulation}
                      onChange={((event, value) => {
                        if (value) setSelectedFormulation(value)
                      })}
                    >
                      {availableFormulations.slice(0, 4).map((form: any) => (
                        <Button
                          key={form}
                          value={form}
                          variant={selectedFormulation === form ? 'contained' : 'outlined'}
                          onClick={() => setSelectedFormulation(form)}
                          sx={{
                            fontSize: '0.75rem',
                            py: 0.5,
                            px: 1,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {form}
                        </Button>
                      ))}
                    </ButtonGroup>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      {getNonCalculableDescription(selectedFormulation)}
                    </Typography>
                  </Box>
                )
              ) : (
                <>
                  {x.type === "string" && x.options?.length > 0 &&
                    <Autocomplete
                      fullWidth={false}
                      size="small"
                      options={x.options ?? []}
                      value={params[x.name] ?? null}
                      onChange={(event, value) => setParams((prev) => ({ ...prev, [x.name]: value }))}
                      sx={{ display: "inline-flex", width: 300, mr: 1 }}
                    />
                  }
                  {x.type === "string" && (x.options?.length ?? 0) === 0 &&
                    <TextField
                      fullWidth={false}
                      size="small"
                      value={params[x.name]}
                      onChange={(event) => setParams((prev) => ({ ...prev, [x.name]: event.target.value }))}
                      sx={{ display: "inline-flex", width: 300, mr: 1 }}
                    />
                  }
                  {x.type === "date" &&
                    <DatePicker
                      value={dayjs(`${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getFullYear()}`).add(0, 'day')} // FIXME
                      onChange={(event, value) => setParams((prev) => ({ ...prev, [x.name]: value }))}
                      slotProps={{ textField: { size: 'small' } }}
                      sx={{ display: "inline-flex", width: 300, mr: 1 }}
                    />
                  }
                  {x.options?.length > 0 &&
                    <ButtonGroup
                      exclusive
                      value={params[x.name]}
                      onChange={((event, value) => setParams((prev) => ({ ...prev, [x.name]: prev[x.name] !== value ? value : undefined })))}
                    >
                      {x.options?.slice(0, 3).map((m: any) => (<Button key={m} value={m}>{m}</Button>))}
                    </ButtonGroup>
                  }
                  {x.type === "html" &&
                    <Box sx={{ width: "98%" }}><RichTextEditor disableStickyFooter /></Box>
                  }
                </>
              )}
            </Grid>

            {/* Calculated Dose Display - only shown for calculable medications */}
            {x.name === "Dose" && tempMed?.route && isDoseCalculable && (
              <>
                <Grid size={3}></Grid>
                <Grid size={9}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 0.5,
                    mb: 1,
                    py: 0.75,
                    px: 1.5,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    minHeight: 32
                  }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      Calculated dose:
                    </Typography>
                    {calculatedDoseDisplay ? (
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: (calculatedDose?.quantity ?? 0) < 1 || ((calculatedDose?.quantity ?? 0) % 1 !== 0 && !calculatedDose?.isLiquid)
                            ? 'warning.dark'
                            : 'success.dark'
                        }}
                      >
                        {calculatedDoseDisplay}
                      </Typography>
                    ) : doseAmount && !selectedFormulation ? (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                        Select a formulation
                      </Typography>
                    ) : doseAmount && selectedFormulation && !parsedFormulation ? (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                        —
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                        —
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </>
            )}
          </React.Fragment>
        ))}
      </Grid>
    </Window>
  )
}
