 // Common immunization routes
export const IMMUNIZATION_ROUTES = {
    IM: 'Intramuscular (IM)',
    SC: 'Subcutaneous (SC)',
    ID: 'Intradermal (ID)',
    IN: 'Intranasal (IN)',
    PO: 'Oral (PO)',
    IV: 'Intravenous (IV)'
  };
  
  // Common immunization sites
  export const IMMUNIZATION_SITES = {
    'left_deltoid': 'Left deltoid',
    'right_deltoid': 'Right deltoid',
    'left_thigh': 'Left thigh',
    'right_thigh': 'Right thigh',
    'left_arm': 'Left arm',
    'right_arm': 'Right arm',
    'left_glute': 'Left gluteal',
    'right_glute': 'Right gluteal',
    'oral': 'Oral',
    'nasal': 'Nasal'
  };
  
  // Common mass units
  export const MASS_UNITS = {
    'mg': 'mg',
    'g': 'g',
    'mcg': 'mcg',
    'mg/ml': 'mg/ml',
    'mg/kg': 'mg/kg'
  };
  
  // Common volume units
  export const VOLUME_UNITS = {
    'ml': 'ml',
    'l': 'L',
    'cc': 'cc'
  };
  
  // Common time units
  export const TIME_UNITS = {
    'min': 'minutes',
    'hr': 'hours',
    'day': 'days'
  };
  
  // Format dose for display
  export const formatDose = (dose) => {
    if (!dose) return '';
    const { value, unit } = dose;
    const unitStr = [unit.mass, unit.volume, unit.time].filter(Boolean).join('/');
    return `${value} ${unitStr}`;
  };
  
  // Format date for display
  export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return dateString;
    } catch (error) {
      return 'Invalid Date';
    }
  };
  
  // Parse dose string into structured format
  export const parseDose = (doseString) => {
    if (!doseString) return null;
    
    const parts = doseString.trim().split(' ');
    const value = parseFloat(parts[0]);
    const unitString = parts.slice(1).join(' ');
    
    // Parse unit string into structured format
    const unitParts = unitString.split('/');
    const unit = {
      mass: unitParts[0] || null,
      volume: unitParts[1] || null,
      time: unitParts[2] || null
    };
    
    return { value, unit };
  };
  
  // Validate immunization data
  export const validateImmunization = (immunization) => {
    const errors = [];
    
    if (!immunization.name?.trim()) {
      errors.push('Immunization name is required');
    }
    
    if (!immunization.date) {
      errors.push('Administration date is required');
    }
    
    if (immunization.dose?.value <= 0) {
      errors.push('Dose value must be greater than 0');
    }
    
    if (!immunization.route) {
      errors.push('Route of administration is required');
    }
    
    return errors;
  };
  
  // Get immunization status based on verification and completion
  export const getImmunizationStatus = (immunization) => {
    if (!immunization.verified) {
      return { label: 'Unverified', color: 'warning' };
    }
    
    if (immunization.status === 'completed') {
      return { label: 'Completed', color: 'success' };
    }
    
    if (immunization.status === 'pending') {
      return { label: 'Pending', color: 'info' };
    }
    
    return { label: 'Unknown', color: 'default' };
  };
  
  // Calculate next due date for immunizations (basic implementation)
  export const calculateNextDueDate = (immunization, schedule) => {
    // This would need to be implemented based on specific immunization schedules
    // For now, return null as this requires more complex logic
    return null;
  };
  
  // Group immunizations by type
  export const groupImmunizationsByType = (immunizations) => {
    return immunizations.reduce((acc, record) => {
      const key = record.vaccine; // Changed from record.name to record.vaccine
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(record);
      return acc;
    }, {});
  };
  
  // Sort immunizations by date (most recent first)
  export const sortImmunizationsByDate = (immunizations) => {
    return [...immunizations].sort((a, b) => {
      const dateA = new Date(a.received);
      const dateB = new Date(b.received);
      
      // Handle invalid dates by placing them at the end
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      
      return dateB - dateA;
    });
  };
  
  // Filter immunizations by search term
  export const filterImmunizationsBySearch = (immunizations, searchTerm) => {
    if (!searchTerm) return immunizations;
    
    const term = searchTerm.toLowerCase();
    return immunizations.filter(imm => 
      imm.name.toLowerCase().includes(term) ||
      imm.given_by?.toLowerCase().includes(term) ||
      imm.facility?.toLowerCase().includes(term) ||
      imm.lot?.toLowerCase().includes(term) ||
      imm.manufacturer?.toLowerCase().includes(term)
    );
  };
  
  // Filter immunizations by status
  export const filterImmunizationsByStatus = (immunizations, status) => {
    if (status === 'all') return immunizations;
    
    if (status === 'verified') {
      return immunizations.filter(imm => imm.verified);
    }
    
    if (status === 'unverified') {
      return immunizations.filter(imm => !imm.verified);
    }
    
    return immunizations.filter(imm => imm.status === status);
  };