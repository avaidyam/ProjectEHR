import * as React from 'react';
import { createFilterOptions } from '@mui/material';
import { Autocomplete } from './Core';
import { useDatabase } from '../contexts/PatientContext';
import * as Database from '../contexts/Database';

export interface BaseSelectFieldProps<T, V> {
  value: V | null;
  onChange: (value: V | null) => void;
  label?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

export const DepartmentSelectField: React.FC<BaseSelectFieldProps<Database.Department, Database.Department.ID>> = ({
  value,
  onChange,
  label = "Department",
  ...props
}) => {
  const [departments] = useDatabase().departments();
  const selectedValue = departments?.find(d => d.id === value) || null;

  return (
    <Autocomplete
      label={label}
      options={departments || []}
      getOptionLabel={(option: Database.Department) => option.name}
      value={selectedValue}
      onChange={(_e, newValue: Database.Department | null) => onChange(newValue?.id || null)}
      {...props}
    />
  );
};

export const SpecialtySelectField: React.FC<BaseSelectFieldProps<string, Database.Specialty>> = ({
  value,
  onChange,
  label = "Specialty",
  ...props
}) => {
  return (
    <Autocomplete
      freeSolo
      label={label}
      options={Database.Specialty.SPECIALTIES}
      value={value}
      onChange={(_e, newValue) => onChange(newValue as Database.Specialty || null)}
      onInputChange={(_e, newValue) => onChange(newValue as Database.Specialty || null)}
      {...props}
    />
  );
};

export const ProviderSelectField: React.FC<BaseSelectFieldProps<Database.Provider, Database.Provider.ID> & { departmentIds?: Database.Department.ID[] }> = ({
  value,
  onChange,
  departmentIds,
  label = "Provider",
  ...props
}) => {
  const [providers] = useDatabase().providers();

  const filteredOptions = React.useMemo(() => {
    if (!providers) return [];
    if (!departmentIds || departmentIds.length === 0) return providers;
    return providers.filter(p => departmentIds.includes(p.department));
  }, [providers, departmentIds]);

  const selectedValue = providers?.find(p => p.id === value) || null;

  return (
    <Autocomplete
      label={label}
      options={filteredOptions}
      getOptionLabel={(option: Database.Provider) => option.name}
      value={selectedValue}
      onChange={(_e, newValue: Database.Provider | null) => onChange(newValue?.id || null)}
      {...props}
    />
  );
};

export const LocationSelectField: React.FC<BaseSelectFieldProps<Database.Location, Database.Location.ID> & { departmentIds?: Database.Department.ID[] }> = ({
  value,
  onChange,
  departmentIds,
  label = "Location",
  ...props
}) => {
  const [locations] = useDatabase().locations();

  const filteredOptions = React.useMemo(() => {
    if (!locations) return [];
    if (!departmentIds || departmentIds.length === 0) return locations;
    return locations.filter(l => departmentIds.includes(l.departmentId));
  }, [locations, departmentIds]);

  const selectedValue = locations?.find(l => l.id === value) || null;

  return (
    <Autocomplete
      label={label}
      options={filteredOptions}
      getOptionLabel={(option: Database.Location) => option.name}
      value={selectedValue}
      onChange={(_e, newValue: Database.Location | null) => onChange(newValue?.id || null)}
      {...props}
    />
  );
};

const ordersFilter = createFilterOptions({
  limit: 100,
  stringify: (option: any) => `${option.name} ${option.id}`,
});

export const OrderSelectField: React.FC<BaseSelectFieldProps<any, string> & { onSelect?: (value: any) => void, freeSolo?: boolean }> = ({
  value,
  onChange,
  onSelect,
  label = "Search to add conditional order...",
  ...props
}) => {
  const [orderables] = useDatabase().orderables();

  const options = React.useMemo(() => {
    const procedures = (orderables as any)?.procedures || {};
    return [
      ...Object.entries(procedures).map(([id, name]) => ({ id, name: name as string })),
      ...((orderables as any)?.rxnorm || []).map((rx: any) => ({ id: rx.name, name: rx.name }))
    ];
  }, [orderables]);

  const selectedValue = React.useMemo(() => {
    if (!value) return null;
    return options.find(o => o.id === value);
  }, [options, value]);

  return (
    <Autocomplete
      label={label}
      options={options}
      getOptionLabel={(option) => typeof option === 'string' ? option : option.name || ''}
      filterOptions={ordersFilter}
      value={selectedValue}
      onChange={(_e, newValue: any) => {
        if (onSelect) onSelect(newValue);
        const val = typeof newValue === 'string' ? newValue : newValue?.id || null;
        onChange(val);
      }}
      {...props}
    />
  );
};
