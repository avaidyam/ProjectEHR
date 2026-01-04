import React, { useEffect, useState, useMemo } from 'react';
import { Box, Button, ButtonGroup, Autocomplete, TextField, RichTextEditor, Icon, Label, Grid, Window, DatePicker, dayjs } from 'components/ui/Core.jsx';
import { Typography } from '@mui/material';

/**
 * Parse a dose string like "500 mg Tab" or "100 mg/5ml Susp" to extract:
 * - strengthValue: numeric value (500, 100)
 * - strengthUnit: unit (mg, mcg, g, etc.)
 * - perVolume: for liquid doses, the volume (5 for "100 mg/5ml")
 * - perVolumeUnit: unit for volume (ml)
 * - form: dosage form (Tab, Cap, Susp, Sol, etc.)
 * - formLabel: human-readable label for the form (tablet, capsule, mL, etc.)
 */
const parseDoseString = (doseStr) => {
  if (!doseStr) return null;
  
  // Match patterns like "500 mg Tab", "100 mg/5ml Susp", "4 mg/ml Injection 200 ml"
  // Pattern 1: Simple - "500 mg Tab"
  const simpleMatch = doseStr.match(/^([\d.]+)\s*(mg|mcg|g|mEq|units?)\s+(.+)$/i);
  
  // Pattern 2: Concentration - "100 mg/5ml Susp" or "4 mg/ml Injection"
  const concMatch = doseStr.match(/^([\d.]+)\s*(mg|mcg|g|mEq|units?)\/([\d.]*)(ml|l)\s+(.+)$/i);
  
  if (concMatch) {
    const [, strengthValue, strengthUnit, perVolume, perVolumeUnit, form] = concMatch;
    const volumeVal = perVolume ? parseFloat(perVolume) : 1;
    return {
      strengthValue: parseFloat(strengthValue),
      strengthUnit: strengthUnit.toLowerCase(),
      perVolume: volumeVal,
      perVolumeUnit: perVolumeUnit.toLowerCase(),
      form: form.trim(),
      formLabel: 'mL',
      isLiquid: true
    };
  }
  
  if (simpleMatch) {
    const [, strengthValue, strengthUnit, form] = simpleMatch;
    const formLower = form.toLowerCase();
    let formLabel = 'unit';
    
    // Determine human-readable form label
    if (formLower.includes('tab')) formLabel = 'tablet';
    else if (formLower.includes('cap')) formLabel = 'capsule';
    else if (formLower.includes('puff')) formLabel = 'puff';
    else if (formLower.includes('patch')) formLabel = 'patch';
    else if (formLower.includes('supp')) formLabel = 'suppository';
    else if (formLower.includes('pwdr') || formLower.includes('powder')) formLabel = 'packet';
    else if (formLower.includes('lozenge')) formLabel = 'lozenge';
    else if (formLower.includes('gum')) formLabel = 'piece';
    else if (formLower.includes('film')) formLabel = 'film';
    else if (formLower.includes('spray')) formLabel = 'spray';
    
    return {
      strengthValue: parseFloat(strengthValue),
      strengthUnit: strengthUnit.toLowerCase(),
      perVolume: null,
      perVolumeUnit: null,
      form: form.trim(),
      formLabel,
      isLiquid: false
    };
  }
  
  return null;
};

/**
 * Calculate the number of units needed for a given dose
 */
const calculateDose = (desiredDose, desiredUnit, parsedDose) => {
  if (!parsedDose || !desiredDose || desiredDose <= 0) return null;
  
  // Normalize units for comparison
  const normalizeUnit = (unit) => {
    const u = unit?.toLowerCase() || '';
    if (u === 'g' || u === 'gram' || u === 'grams') return 'g';
    if (u === 'mg' || u === 'milligram' || u === 'milligrams') return 'mg';
    if (u === 'mcg' || u === 'microgram' || u === 'micrograms' || u === 'µg') return 'mcg';
    if (u === 'meq') return 'meq';
    if (u === 'unit' || u === 'units') return 'units';
    return u;
  };
  
  // Convert to base unit (mg) for calculation
  const toMg = (value, unit) => {
    const normalizedUnit = normalizeUnit(unit);
    if (normalizedUnit === 'g') return value * 1000;
    if (normalizedUnit === 'mcg') return value / 1000;
    return value; // assume mg
  };
  
  const desiredMg = toMg(desiredDose, desiredUnit);
  const strengthMg = toMg(parsedDose.strengthValue, parsedDose.strengthUnit);
  
  if (parsedDose.isLiquid) {
    // For liquids: calculate mL needed
    // e.g., 160 mg/5ml -> to get 320 mg, need (320/160)*5 = 10 ml
    const mlPerMgRatio = parsedDose.perVolume / strengthMg;
    const mlNeeded = desiredMg * mlPerMgRatio;
    return {
      quantity: mlNeeded,
      label: parsedDose.formLabel,
      isLiquid: true
    };
  } else {
    // For solid doses: calculate number of units
    const unitsNeeded = desiredMg / strengthMg;
    return {
      quantity: unitsNeeded,
      label: parsedDose.formLabel,
      isLiquid: false
    };
  }
};

/**
 * Format the calculated dose for display
 */
const formatCalculatedDose = (calc) => {
  if (!calc) return null;
  
  const { quantity, label, isLiquid } = calc;
  
  // Round to reasonable precision
  let displayQty;
  if (isLiquid) {
    // For liquids, show up to 2 decimal places
    displayQty = Math.round(quantity * 100) / 100;
  } else {
    // For solids, show common fractions or decimals
    if (Math.abs(quantity - Math.round(quantity)) < 0.01) {
      displayQty = Math.round(quantity);
    } else if (Math.abs(quantity - Math.round(quantity * 2) / 2) < 0.01) {
      // Close to 0.5
      displayQty = Math.round(quantity * 2) / 2;
    } else if (Math.abs(quantity - Math.round(quantity * 4) / 4) < 0.01) {
      // Close to 0.25
      displayQty = Math.round(quantity * 4) / 4;
    } else {
      displayQty = Math.round(quantity * 100) / 100;
    }
  }
  
  // Pluralize label
  const pluralLabel = displayQty === 1 ? label : (label + 's').replace('capsules', 'capsules').replace('tablets', 'tablets');
  
  return `${displayQty} ${pluralLabel}`;
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

const consultParams = []

const alwaysParams = [{ name: "Comments", required: false, type: "html" }]

export const OrderComposer = ({ medication: tempMed, open, onSelect, ...props }) => {
  const [params, setParams] = useState({})
  const [doseAmount, setDoseAmount] = useState('') // The numeric dose amount (e.g., "1600")
  const [doseUnit, setDoseUnit] = useState('mg') // The unit for the dose amount
  const [selectedFormulation, setSelectedFormulation] = useState('') // The selected package/formulation (e.g., "800 mg Tab")

  // Get available formulations for the selected route
  const availableFormulations = useMemo(() => {
    return Object.values(tempMed?.route?.[params["Route"]] ?? {})
  }, [tempMed, params["Route"]])

  // set the default route when medication changes
  useEffect(() => {
    setParams(prev => ({ ...prev, ['Route']: Object.keys(tempMed?.route ?? {})?.[0] ?? '' }))
    setDoseAmount('')
    setSelectedFormulation('')
  }, [tempMed])

  // set the default formulation when route changes
  useEffect(() => {
    const formulations = Object.values(tempMed?.route?.[params["Route"]] ?? {})
    setSelectedFormulation(formulations[0] ?? '')
    setDoseAmount('')
  }, [tempMed, params["Route"]])

  // Parse the selected formulation and calculate units needed
  const parsedFormulation = useMemo(() => {
    return parseDoseString(selectedFormulation);
  }, [selectedFormulation])
  
  const calculatedDose = useMemo(() => {
    if (!doseAmount || !parsedFormulation) return null;
    return calculateDose(parseFloat(doseAmount), doseUnit, parsedFormulation);
  }, [doseAmount, doseUnit, parsedFormulation])
  
  const calculatedDoseDisplay = useMemo(() => formatCalculatedDose(calculatedDose), [calculatedDose])

  // if this is an Rx then substitute the Route and Dose options
  // Push a default Comments field that exists for ALL orders.
  let displayParams = [...(!!tempMed?.route ? rxParams : consultParams), ...alwaysParams]
  if (!!tempMed?.route) {
    displayParams[0].options = Object.keys(tempMed?.route ?? {}) 
    // Remove the Dose options since we're handling it specially
    displayParams[1].options = []
  }

  return (
    <Window 
      fullWidth 
      maxWidth="md" 
      title={tempMed?.name ?? ''}
      open={!!open}
      onClose={() => onSelect(null)} 
      ContentProps={{ sx: { p: 0 } }}
      footer={<>
        <Button color="success.light" onClick={() => onSelect({ 
          name: tempMed?.name ?? '', 
          ...params,
          // Include dose information
          Dose: doseAmount && doseUnit ? `${doseAmount} ${doseUnit}` : '',
          Formulation: selectedFormulation,
          CalculatedDose: calculatedDoseDisplay
        })}><Icon>check</Icon>Accept</Button>
        <Button color="error" onClick={() => onSelect(null)}><Icon>clear</Icon>Cancel</Button>
      </>}
    >
      <Grid container spacing={1} sx={{ m: 0, p: 1 }}>
        {displayParams.filter(x => 
          Object.entries(x.condition ?? {}).findIndex(([key, value]) => params[key] !== value) < 0
        ).map(x => (
          <React.Fragment key={x.name}>
            <Grid item xs={3}><Label>{x.name}</Label></Grid>
            <Grid item xs={9}>
              {/* Special handling for Dose field - numeric input + formulation buttons */}
              {x.name === "Dose" && tempMed?.route ? (
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
                    onChange={(e, value) => setDoseUnit(value || 'mg')}
                    disableClearable
                    sx={{ width: 90 }}
                    renderInput={(inputProps) => <TextField {...inputProps} />}
                  />
                  <ButtonGroup
                    exclusive
                    value={selectedFormulation}
                    onChange={(event, value) => {
                      if (value) setSelectedFormulation(value)
                    }}
                    sx={{ ml: 1 }}
                  >
                    {availableFormulations.slice(0, 4).map((form) => (
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
                <>
                  {x.type === "string" && x.options?.length > 0 && 
                    <Autocomplete 
                      fullWidth={false}
                      size="small"
                      options={x.options ?? []}
                      value={params[x.name] ?? null}
                      onChange={(event, value) => setParams(prev => ({ ...prev, [x.name]: value }))}
                      sx={{ display: "inline-flex", width: 300, mr: 1 }}
                    />
                  }
                  {x.type === "string" && (x.options?.length ?? 0) === 0 && 
                    <TextField 
                      fullWidth={false}
                      size="small"
                      value={params[x.name]}
                      onChange={(event, value) => setParams(prev => ({ ...prev, [x.name]: value }))}
                      sx={{ display: "inline-flex", width: 300, mr: 1 }}
                    />
                  }
                  {x.type === "date" && 
                    <DatePicker
                      value={dayjs(`${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getFullYear()}`).add(0, 'day')} // FIXME
                      onChange={(event, value) => setParams(prev => ({ ...prev, [x.name]: value }))}
                      slotProps={{ textField: { size: 'small' } }}
                      sx={{ display: "inline-flex", width: 300, mr: 1 }}
                    />
                  }
                  {x.options?.length > 0 && 
                    <ButtonGroup
                      exclusive
                      value={params[x.name]}
                      onChange={(event, value) => setParams(prev => ({ ...prev, [x.name]: prev[x.name] !== value ? value : undefined }))}
                    >
                      {x.options?.slice(0, 3).map((m) => (<Button key={m} value={m}>{m}</Button>))}
                    </ButtonGroup>
                  }
                  {x.type === "html" && 
                    <Box sx={{ width: "98%" }}><RichTextEditor disableStickyFooter /></Box>
                  }
                </>
              )}
            </Grid>
            
            {/* Calculated Dose Display - shown after the Dose field for medications */}
            {x.name === "Dose" && tempMed?.route && (
              <>
                <Grid item xs={3}></Grid>
                <Grid item xs={9}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mt: 0.5,
                    mb: 1,
                    py: 1,
                    px: 1.5,
                    bgcolor: calculatedDoseDisplay ? 'action.hover' : 'transparent',
                    borderRadius: 1,
                    minHeight: 36
                  }}>
                    {calculatedDoseDisplay ? (
                      <>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          Calculated dose:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600, 
                            color: calculatedDose?.quantity < 1 || (calculatedDose?.quantity % 1 !== 0 && !calculatedDose?.isLiquid) 
                              ? 'warning.dark' 
                              : 'success.dark'
                          }}
                        >
                          {calculatedDoseDisplay}
                        </Typography>
                      </>
                    ) : doseAmount && !selectedFormulation ? (
                      <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                        Select a formulation from the buttons above
                      </Typography>
                    ) : doseAmount && selectedFormulation && !parsedFormulation ? (
                      <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                        Unable to parse selected formulation
                      </Typography>
                    ) : null}
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
