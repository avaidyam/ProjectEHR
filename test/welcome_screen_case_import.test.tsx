import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../src/routes/Login/Login';
import { AuthProvider } from '../src/components/contexts/AuthContext';
import { DatabaseProvider } from '../src/components/contexts/PatientContext';
import { PromptProvider } from '../src/components/ui/Core';
import { mergeSingleDataset, extractSinglePatientInfo } from '../src/components/ui/databaseManagement/useDatabaseOperations';
import { SinglePatientAppointmentModal } from '../src/components/ui/databaseManagement/SinglePatientAppointmentModal';

describe('mergeSingleDataset', () => {
  it('merges a new patient into the database', () => {
    const prevDb = {
      patients: {},
      departments: [],
      appointments: [],
    };
    const newCase = {
      patients: {
        '1001': {
          mrn: '1001',
          firstName: 'Alice',
          lastName: 'Smith',
          encounters: {
            'enc-1': { id: 'enc-1', date: '2026-03-01' },
          },
        },
      },
    };
    const stats = {
      patientsAdded: 0,
      encountersAdded: 0,
      departmentsAdded: 0,
      otherRecordsAdded: 0,
    };

    const result = mergeSingleDataset(prevDb, newCase, stats);

    expect(stats.patientsAdded).toBe(1);
    expect(stats.encountersAdded).toBe(0);
    expect(result.patients['1001'].firstName).toBe('Alice');
    expect(result.patients['1001'].encounters['enc-1']).toBeDefined();
  });

  it('merges a new encounter into an existing patient without overwriting', () => {
    const prevDb = {
      patients: {
        '1001': {
          mrn: '1001',
          firstName: 'Alice',
          lastName: 'Smith',
          encounters: {
            'enc-1': { id: 'enc-1', date: '2026-03-01' },
          },
        },
      },
      departments: [],
    };
    const incomingCase = {
      patients: {
        '1001': {
          encounters: {
            'enc-2': { id: 'enc-2', date: '2026-03-15' },
          },
        },
      },
    };
    const stats = {
      patientsAdded: 0,
      encountersAdded: 0,
      departmentsAdded: 0,
      otherRecordsAdded: 0,
    };

    const result = mergeSingleDataset(prevDb, incomingCase, stats);

    expect(stats.patientsAdded).toBe(0);
    expect(stats.encountersAdded).toBe(1);
    expect(result.patients['1001'].encounters['enc-1']).toBeDefined();
    expect(result.patients['1001'].encounters['enc-2']).toBeDefined();
  });

  it('merges departments and appointments without duplication', () => {
    const prevDb = {
      departments: [{ id: 'dept-1', name: 'Emergency' }],
      appointments: [{ id: 'appt-1', patient: { mrn: '1001', enc: 'enc-1' } }],
    };
    const incomingCase = {
      departments: [
        { id: 'dept-1', name: 'Emergency' }, // duplicate, should be skipped
        { id: 'dept-2', name: 'Cardiology' }, // new
      ],
      appointments: [
        { id: 'appt-1', patient: { mrn: '1001', enc: 'enc-1' } }, // duplicate
        { id: 'appt-2', patient: { mrn: '1002', enc: 'enc-2' } }, // new
      ],
    };
    const stats = {
      patientsAdded: 0,
      encountersAdded: 0,
      departmentsAdded: 0,
      otherRecordsAdded: 0,
    };

    const result = mergeSingleDataset(prevDb, incomingCase, stats);

    expect(stats.departmentsAdded).toBe(1);
    expect(stats.otherRecordsAdded).toBe(1);
    expect(result.departments).toHaveLength(2);
    expect(result.appointments).toHaveLength(2);
  });

  it('normalizes a raw patient object when importing', () => {
    const prevDb = {
      patients: {},
      departments: [],
    };
    const rawPatientCase = {
      mrn: '5555',
      firstName: 'Bob',
      lastName: 'Brown',
      department: 'dept-1',
      encounters: {},
    };
    const stats = {
      patientsAdded: 0,
      encountersAdded: 0,
      departmentsAdded: 0,
      otherRecordsAdded: 0,
    };

    // If wrapped or passed via normalized wrapper
    const wrapped = rawPatientCase.mrn && !(rawPatientCase as any).patients
      ? {
          patients: { [rawPatientCase.mrn]: rawPatientCase },
          departments: [{ id: rawPatientCase.department, name: rawPatientCase.department }],
        }
      : rawPatientCase;

    const result = mergeSingleDataset(prevDb, wrapped, stats);

    expect(stats.patientsAdded).toBe(1);
    expect(result.patients['5555'].lastName).toBe('Brown');
  });

  describe('extractSinglePatientInfo', () => {
    it('detects a single patient from dataset', () => {
      const dataset = {
        patients: {
          '4641821': {
            mrn: '4641821',
            firstName: 'Joe',
            lastName: 'Kirk',
            encounters: { '550': { id: '550' } },
          },
        },
      };
      const info = extractSinglePatientInfo([dataset]);
      expect(info).not.toBeNull();
      expect(info?.patientId).toBe('4641821');
      expect(info?.patientName).toBe('Kirk, Joe');
      expect(info?.encounterId).toBe('550');
    });

    it('detects a single patient from raw patient object', () => {
      const rawPatient = {
        mrn: '9999',
        firstName: 'Jane',
        lastName: 'Doe',
      };
      const info = extractSinglePatientInfo([rawPatient]);
      expect(info).not.toBeNull();
      expect(info?.patientId).toBe('9999');
      expect(info?.patientName).toBe('Doe, Jane');
    });

    it('returns null if multiple patients are in the dataset', () => {
      const dataset = {
        patients: {
          '1001': { mrn: '1001', firstName: 'Alice', lastName: 'A' },
          '1002': { mrn: '1002', firstName: 'Bob', lastName: 'B' },
        },
      };
      const info = extractSinglePatientInfo([dataset]);
      expect(info).toBeNull();
    });

    it('returns null if multiple datasets have different patients', () => {
      const dataset1 = { patients: { '1001': { mrn: '1001' } } };
      const dataset2 = { patients: { '1002': { mrn: '1002' } } };
      const info = extractSinglePatientInfo([dataset1, dataset2]);
      expect(info).toBeNull();
    });
  });

  describe('SinglePatientAppointmentModal', () => {
    it('renders with today as default date and Emergency Department as default location', async () => {
      const onClose = vi.fn();
      const onConfirm = vi.fn();

      render(
        <DatabaseProvider>
          <PromptProvider>
            <SinglePatientAppointmentModal
              open={true}
              onClose={onClose}
              patientId="4641821"
              patientName="Kirk, Joe"
              onConfirm={onConfirm}
            />
          </PromptProvider>
        </DatabaseProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/create appointment for patient/i)).toBeInTheDocument();
      });

      // Shows patient name
      expect(screen.getByText(/Kirk, Joe/i)).toBeInTheDocument();

      // Date input defaults to today
      const dateInput = screen.getByLabelText(/appointment date/i) as HTMLInputElement;
      expect(dateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Default location is an emergency room
      expect(screen.getByDisplayValue(/emergency department/i)).toBeInTheDocument();

      // Clicking Create Appointment calls onConfirm with date and locationId
      const createBtn = screen.getByRole('button', { name: /create appointment/i });
      fireEvent.click(createBtn);

      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          date: dateInput.value,
          locationId: expect.any(String),
        })
      );
    });

    it('allows cancelling without creating an appointment', async () => {
      const onClose = vi.fn();
      const onConfirm = vi.fn();

      render(
        <DatabaseProvider>
          <PromptProvider>
            <SinglePatientAppointmentModal
              open={true}
              onClose={onClose}
              patientId="4641821"
              patientName="Kirk, Joe"
              onConfirm={onConfirm}
            />
          </PromptProvider>
        </DatabaseProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/create appointment for patient/i)).toBeInTheDocument();
      });

      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelBtn);

      expect(onClose).toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });
});

describe('Welcome Screen (Login Route)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders as a welcome screen with case import and database options rather than forcing login input boxes', async () => {
    const setIsLoggedIn = vi.fn();

    render(
      <MemoryRouter>
        <AuthProvider>
          <DatabaseProvider>
            <PromptProvider>
              <Login setIsLoggedIn={setIsLoggedIn} />
            </PromptProvider>
          </DatabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for DatabaseProvider to be ready
    await waitFor(() => {
      expect(screen.getByText('ProjectEHR')).toBeInTheDocument();
    });

    // Header and Welcome elements
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Clinical Simulation & Case Management')).toBeInTheDocument();

    // No mandatory user ID or password inputs forcing login
    expect(screen.queryByLabelText('User ID')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();

    // Department context UI and configure visibility are removed from UI
    expect(screen.queryByPlaceholderText(/select department/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/configure encounter visibility/i)).not.toBeInTheDocument();

    // Enter EHR button exists and allows effortless launch
    const enterBtn = screen.getByRole('button', { name: /enter ehr/i });
    expect(enterBtn).toBeInTheDocument();

    // Import options exist
    expect(screen.getByText(/import cases/i)).toBeInTheDocument();
    expect(screen.getByText(/drag & drop case json file\(s\) here/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /select json files/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /import url/i })).toBeInTheDocument();

    // Export options exist
    expect(screen.getByRole('button', { name: /export selected case/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export entire database/i })).toBeInTheDocument();

    // Database maintenance options exist
    expect(screen.getByRole('button', { name: /load sample database/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete selected case/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /erase entire database/i })).toBeInTheDocument();

    // Explorer exists
    expect(screen.getByText(/live case explorer/i)).toBeInTheDocument();
  });

  it('allows user to enter the EHR with a single click without requiring login credentials or context selection', async () => {
    const setIsLoggedIn = vi.fn();

    render(
      <MemoryRouter>
        <AuthProvider>
          <DatabaseProvider>
            <PromptProvider>
              <Login setIsLoggedIn={setIsLoggedIn} />
            </PromptProvider>
          </DatabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for DatabaseProvider to be ready
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enter ehr/i })).toBeInTheDocument();
    });

    const enterBtn = screen.getByRole('button', { name: /enter ehr/i });
    fireEvent.click(enterBtn);

    expect(setIsLoggedIn).toHaveBeenCalledWith(true);
    // User login details should be set in localStorage automatically
    expect(localStorage.getItem('userLoginDetails')).not.toBeNull();
  });

  it('enters EHR with backend department context automatically populated without requiring UI selection', async () => {
    const setIsLoggedIn = vi.fn();

    render(
      <MemoryRouter>
        <AuthProvider>
          <DatabaseProvider>
            <PromptProvider>
              <Login setIsLoggedIn={setIsLoggedIn} />
            </PromptProvider>
          </DatabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enter ehr/i })).toBeInTheDocument();
    });

    // Department context UI is not rendered
    expect(screen.queryByPlaceholderText(/select department/i)).not.toBeInTheDocument();

    // User can immediately click Enter EHR
    const enterBtn = screen.getByRole('button', { name: /enter ehr/i });
    fireEvent.click(enterBtn);

    expect(setIsLoggedIn).toHaveBeenCalledWith(true);
    // Backend code ensures user details and department are still safely stored
    const details = JSON.parse(localStorage.getItem('userLoginDetails') || '{}');
    expect(details.username).toBe('User');
    expect(details.department).toBeDefined();
  });
});
