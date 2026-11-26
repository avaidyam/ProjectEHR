import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DatabaseProvider, sampleStore, useDatabase } from 'components/contexts/PatientContext';
import { PatientLists } from '../src/routes/PatientList/PatientList';
import { matchesPatientSearch } from '../src/routes/PatientList/components/PatientsTable';

describe('matchesPatientSearch', () => {
  const samplePatient = {
    id: '1016257',
    firstName: 'Jane',
    lastName: 'Doe',
    birthdate: '1980-05-12T00:00:00Z',
    gender: 'Female',
    location: 'Adult Medicine',
    bedStatus: 'In Room',
    status: 'Admitted',
    address: { city: 'Urbana' },
  };

  it('returns true when query is empty or whitespace', () => {
    expect(matchesPatientSearch(samplePatient, '')).toBe(true);
    expect(matchesPatientSearch(samplePatient, '   ')).toBe(true);
  });

  it('matches first/last name in either order, MRN, DOB, location, and status', () => {
    expect(matchesPatientSearch(samplePatient, 'Jane')).toBe(true);
    expect(matchesPatientSearch(samplePatient, 'doe, jane')).toBe(true);
    expect(matchesPatientSearch(samplePatient, 'jane doe')).toBe(true);
    expect(matchesPatientSearch(samplePatient, '1016257')).toBe(true);
    expect(matchesPatientSearch(samplePatient, '1980')).toBe(true);
    expect(matchesPatientSearch(samplePatient, 'adult medicine')).toBe(true);
    expect(matchesPatientSearch(samplePatient, 'admitted')).toBe(true);
    expect(matchesPatientSearch(samplePatient, 'doe adult')).toBe(true);
  });

  it('returns false when query does not match patient data and safely ignores object addresses', () => {
    expect(matchesPatientSearch(samplePatient, 'nonexistent')).toBe(false);
    expect(matchesPatientSearch(samplePatient, 'Jane nonmatching')).toBe(false);
    expect(matchesPatientSearch(samplePatient, 'object')).toBe(false);
  });
});

describe('PatientLists Search button', () => {
  const Harness = () => {
    const [, setDb] = useDatabase()();
    return (
      <>
        <button onClick={() => setDb(sampleStore)}>Load Sample</button>
        <button onClick={() => setDb((prev) => ({ ...prev, patients: {}, appointments: [] }))}>
          Empty Database
        </button>
        <Routes>
          <Route path="/list" element={<PatientLists />} />
          <Route path="/list/:listId" element={<PatientLists />} />
        </Routes>
      </>
    );
  };

  const renderPatientLists = (initialPath = '/list/all-patients') =>
    render(
      <MemoryRouter initialEntries={[initialPath]}>
        <DatabaseProvider>
          <Harness />
        </DatabaseProvider>
      </MemoryRouter>
    );

  it('shows "No patients" when database is empty (even with search text) and "No matching patients" only when nonzero patients fail search', async () => {
    renderPatientLists('/list/all-patients');

    await waitFor(() => {
      expect(screen.getByText('No patients')).toBeInTheDocument();
    });
    expect(screen.queryByText(/loading patients/i)).not.toBeInTheDocument();

    // Searching on an empty database should still display "No patients", not "No matching patients"
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    const searchInput = await screen.findByPlaceholderText('Search current list...');
    fireEvent.change(searchInput, { target: { value: 'ZZZ_NO_MATCH_99999' } });
    await waitFor(() => {
      expect(screen.getByText('No patients')).toBeInTheDocument();
    });
    expect(screen.queryByText('No matching patients')).not.toBeInTheDocument();

    // Load sample patients -> non-matching search displays "No matching patients"
    fireEvent.click(screen.getByRole('button', { name: 'Load Sample' }));
    await waitFor(() => {
      expect(screen.getByText('No matching patients')).toBeInTheDocument();
    });

    // Empty the database again -> reverts to "No patients" instead of "Loading patients..." or "No matching patients"
    fireEvent.click(screen.getByRole('button', { name: 'Empty Database' }));
    await waitFor(() => {
      expect(screen.getByText('No patients')).toBeInTheDocument();
    });
    expect(screen.queryByText(/loading patients/i)).not.toBeInTheDocument();
    expect(screen.queryByText('No matching patients')).not.toBeInTheDocument();
  });

  it('toggles search input from the toolbar Search button and filters the currently displayed list', async () => {
    renderPatientLists('/list/all-patients');

    const loadSampleBtn = await screen.findByRole('button', { name: 'Load Sample' });
    fireEvent.click(loadSampleBtn);

    // Wait for sample list patients to render in DataGrid
    await waitFor(() => {
      expect(screen.getAllByRole('row').length).toBeGreaterThan(2);
    });

    const initialRows = screen.getAllByRole('row');
    // Pick the first data row's text (name/MRN) from the current list so test is resilient to sample fixture updates
    const dataRows = initialRows.slice(1);
    expect(dataRows.length).toBeGreaterThan(1);

    const firstRowCells = dataRows[0].querySelectorAll('[role="gridcell"]');
    const firstNameText = firstRowCells[0]?.textContent?.trim() || '';
    const firstMrnText = firstRowCells[1]?.textContent?.trim() || '';
    const secondMrnText = dataRows[1].querySelectorAll('[role="gridcell"]')[1]?.textContent?.trim() || '';
    expect(firstNameText).not.toBe('');
    expect(firstMrnText).not.toBe('');
    expect(secondMrnText).not.toBe(firstMrnText);

    // Search input should start hidden until the Search button is clicked
    expect(screen.queryByPlaceholderText('Search current list...')).not.toBeInTheDocument();

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    const searchInput = await screen.findByPlaceholderText('Search current list...');
    expect(searchInput).toBeInTheDocument();

    // Filter by MRN -> narrows rows to only matching patient
    fireEvent.change(searchInput, { target: { value: firstMrnText } });
    await waitFor(() => {
      const filteredRows = screen.getAllByRole('row').slice(1);
      expect(filteredRows).toHaveLength(1);
      expect(filteredRows[0].textContent).toContain(firstMrnText);
      expect(screen.queryByText(secondMrnText)).not.toBeInTheDocument();
    });

    // Non-matching query -> shows empty search state instead of crashing
    fireEvent.change(searchInput, { target: { value: 'ZZZ_NO_MATCH_99999' } });
    await waitFor(() => {
      expect(screen.getByText('No matching patients')).toBeInTheDocument();
    });

    // Clicking Clear search restores all rows while keeping the input open
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    await waitFor(() => {
      expect(screen.getAllByRole('row').slice(1)).toHaveLength(dataRows.length);
    });

    // Search by name then toggle Search button off -> closes input and resets filter
    const lastName = firstNameText.split(',')[0].trim();
    fireEvent.change(searchInput, { target: { value: lastName } });
    await waitFor(() => {
      expect(screen.getAllByRole('row').slice(1).length).toBeLessThanOrEqual(dataRows.length);
    });

    fireEvent.click(searchButton);
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Search current list...')).not.toBeInTheDocument();
      expect(screen.getAllByRole('row').slice(1)).toHaveLength(dataRows.length);
    });
  });
});
