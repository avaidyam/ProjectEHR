import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import createStore from 'teaful';
import { TemporalRootProvider } from 'mui-temporal-pickers';

vi.mock('../src/components/ui/Core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/components/ui/Core')>();
  return {
    ...actual,
    RichText: ({ children }: { children?: React.ReactNode }) => <div data-testid="rich-text">{children}</div>,
  };
});

import { AuthContext, AuthProvider, useAuth } from '../src/components/contexts/AuthContext';
import { DatabaseContext, PatientProvider } from '../src/components/contexts/PatientContext';
import { SplitViewProvider, useSplitView } from '../src/components/contexts/SplitViewContext';
import { PromptProvider } from '../src/components/ui/Core';
import { Titlebar } from '../src/components/ui/Titlebar';
import { ResultsReview } from '../src/routes/Patient/routes/Results/Results';
import { ChartReview } from '../src/routes/Patient/routes/ChartReview/ChartReview';
import { ReportViewer } from '../src/routes/Patient/routes/ReportViewer/ReportViewer';
import { NoteViewer } from '../src/routes/Patient/routes/NoteViewer/NoteViewer';
import {
  removeEncounterResult,
  findResultLocation,
  closeTabsForResult,
} from '../src/util/helpers';

function createMockDatabase() {
  return {
    departments: [{ id: 'dept-1', name: 'Internal Medicine' }],
    providers: [{ id: 'prov-1', name: 'Dr. Ada Lovelace', role: 'Physician', specialty: 'IM' }],
    locations: [],
    appointments: [],
    lists: [],
    flowsheets: [],
    orderables: { procedures: {}, result_map: {}, components: {}, rxnorm: [] },
    patients: {
      '1001': {
        id: '1001',
        firstName: 'Test',
        lastName: 'Patient',
        encounters: {
          'enc-prior': {
            id: 'enc-prior',
            startDate: '2026-01-01T10:00:00Z',
            type: 'Outpatient',
            status: 'Signed',
            department: 'dept-1',
            provider: 'prov-1',
            orders: [],
            conditionals: {
              'lab-prior-cond': ['CBC'],
            },
            labs: [
              {
                id: 'lab-prior-cond',
                date: '2026-01-01T11:00:00Z',
                test: 'Prior Conditional CBC',
                status: 'Completed',
                abnormal: false,
                collected: '2026-01-01T11:00:00Z',
                resulted: '2026-01-01T11:30:00Z',
                resultingAgency: 'LabCorp',
                components: [{ name: 'WBC', value: 7.2, units: 'K/uL', low: 4, high: 11 }],
              },
            ],
            imaging: [],
            notes: [],
            problems: [],
          },
          'enc-curr': {
            id: 'enc-curr',
            startDate: '2026-02-01T10:00:00Z',
            type: 'Emergency',
            status: 'In Progress',
            department: 'dept-1',
            provider: 'prov-1',
            orders: [],
            conditionals: {
              'lab-cond': ['BMAMA'],
              'img-cond': ['XRCHESTA'],
            },
            labs: [
              {
                id: 'lab-visible',
                date: '2026-02-01T11:00:00Z',
                test: 'Visible Lipid Panel',
                status: 'Completed',
                abnormal: false,
                collected: '2026-02-01T11:00:00Z',
                resulted: '2026-02-01T11:30:00Z',
                resultingAgency: 'Main Lab',
                components: [{ name: 'LDL', value: 95, units: 'mg/dL', low: 0, high: 100 }],
              },
              {
                id: 'lab-cond',
                date: '2026-02-01T12:00:00Z',
                test: 'Hidden Conditional BMP',
                status: 'Completed',
                abnormal: true,
                collected: '2026-02-01T12:00:00Z',
                resulted: '2026-02-01T12:30:00Z',
                resultingAgency: 'Main Lab',
                components: [{ name: 'Sodium', value: 131, units: 'mmol/L', low: 135, high: 145 }],
              },
              {
                date: '2026-02-01T12:30:00Z',
                test: 'Legacy Lab Without ID',
                status: 'Completed',
                abnormal: false,
                collected: '2026-02-01T12:30:00Z',
                resulted: '2026-02-01T13:00:00Z',
                resultingAgency: 'Main Lab',
                components: [{ name: 'Potassium', value: 4.1, units: 'mmol/L', low: 3.5, high: 5.0 }],
              },
            ],
            imaging: [
              {
                id: 'img-cond',
                date: '2026-02-01T12:15:00Z',
                statusDate: '2026-02-01T12:45:00Z',
                test: 'Hidden Chest X-Ray',
                status: 'Final Result',
                abnormal: false,
                acuity: 'Routine',
                provider: 'prov-1',
                resultingAgency: 'Radiology',
                image: '',
              },
            ],
            notes: [
              {
                id: 'note-1',
                date: '2026-02-01T10:30:00Z',
                serviceDate: '2026-02-01T10:30:00Z',
                type: 'Progress Notes',
                author: 'prov-1',
                status: 'Signed',
                summary: 'Initial Progress Note',
                content: '<p>Patient doing well.</p>',
              },
            ],
            problems: [],
          },
        },
      },
    },
  };
}

function Harness({
  initialFacultyMode = false,
  initialSideTabs = [],
  initialMainTabs = [{ 'Chart Review': {} }],
  children,
}: {
  initialFacultyMode?: boolean;
  initialSideTabs?: any[];
  initialMainTabs?: any[];
  children: React.ReactNode;
}) {
  const storeRef = React.useRef<ReturnType<typeof createStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createStore(createMockDatabase() as any);
  }
  const [isFacultyMode, setIsFacultyMode] = React.useState(initialFacultyMode);
  const [mainTabs, setMainTabs] = React.useState<any[]>(initialMainTabs);
  const [sideTabs, setSideTabs] = React.useState<any[]>(initialSideTabs);
  const [windowTabs, setWindowTabs] = React.useState<any[]>([]);
  const [selectedMainTab, setSelectedMainTab] = React.useState(0);
  const [selectedSideTab, setSelectedSideTab] = React.useState(0);

  const splitViewValue = React.useMemo(
    () => ({
      mainTabs,
      setMainTabs,
      sideTabs,
      setSideTabs,
      windowTabs,
      setWindowTabs,
      selectedMainTab,
      setSelectedMainTab,
      selectedSideTab,
      setSelectedSideTab,
      closeMainTab: (index: number) => setMainTabs((prev) => prev.filter((_, i) => i !== index)),
      closeSideTab: (index: number) => setSideTabs((prev) => prev.filter((_, i) => i !== index)),
      closeWindowTab: (index: number) => setWindowTabs((prev) => prev.filter((_, i) => i !== index)),
      closeTab: vi.fn(() => true),
      openTab: vi.fn(() => 0),
    }),
    [mainTabs, sideTabs, windowTabs, selectedMainTab, selectedSideTab]
  );

  return (
    <MemoryRouter>
      <TemporalRootProvider>
        <PromptProvider>
          <AuthContext.Provider
            value={{
              isAuthenticated: true,
              isPasswordSet: false,
              isFacultyMode,
              enabledEncounters: {},
              setFacultyMode: setIsFacultyMode,
              setPassword: vi.fn(),
              verifyPassword: vi.fn(async () => true),
              updateEncounters: vi.fn(),
              login: vi.fn(),
              logout: () => setIsFacultyMode(false),
            }}
          >
            <DatabaseContext.Provider value={storeRef.current.useStore as any}>
              <PatientProvider patient={'1001' as any} encounter={'enc-curr' as any}>
                <SplitViewProvider value={splitViewValue}>
                  {children}
                </SplitViewProvider>
              </PatientProvider>
            </DatabaseContext.Provider>
          </AuthContext.Provider>
        </PromptProvider>
      </TemporalRootProvider>
    </MemoryRouter>
  );
}

describe('result deletion helpers', () => {
  it('removes a lab result by id and cleans up matching conditional without mutating input', () => {
    const encounter: any = {
      id: 'enc-1',
      labs: [{ id: 'l1', test: 'BMP' }, { id: 'l2', test: 'CBC' }],
      imaging: [{ id: 'i1', test: 'CXR' }],
      conditionals: { l1: ['BMAMA'], l2: ['CBC'], keep: ['OTHER'] },
    };

    const updated = removeEncounterResult(encounter, { collection: 'labs', id: 'l1' });
    expect(updated.labs.map((l) => l.id)).toEqual(['l2']);
    expect(updated.conditionals).toEqual({ l2: ['CBC'], keep: ['OTHER'] });
    expect(encounter.labs).toHaveLength(2);
    expect(encounter.conditionals.l1).toEqual(['BMAMA']);
  });

  it('falls back to itemRef when a result has no id', () => {
    const target = { test: 'Legacy Lab' };
    const keep = { test: 'Other Lab' };
    const encounter: any = {
      id: 'enc-1',
      labs: [target, keep],
      imaging: [],
      conditionals: {},
    };

    const updated = removeEncounterResult(encounter, { collection: 'labs', itemRef: target });
    expect(updated.labs).toEqual([keep]);
  });

  it('deletes and shifts index-based conditional keys when an item is removed', () => {
    const lab0 = { test: 'First Conditional Lab' };
    const lab1 = { test: 'Second Unconditional Lab' };
    const lab2 = { test: 'Third Conditional Lab' };
    const encounter: any = {
      id: 'enc-1',
      labs: [lab0, lab1, lab2],
      imaging: [],
      conditionals: {
        'labs.0': ['CBC'],
        'labs.2': ['BMAMA'],
        'notes.0': ['H&P'],
      },
    };

    const updated = removeEncounterResult(encounter, { collection: 'labs', itemRef: lab0 });
    expect(updated.labs).toEqual([lab1, lab2]);
    expect(updated.conditionals).toEqual({
      'labs.1': ['BMAMA'],
      'notes.0': ['H&P'],
    });
  });

  it('removes only the matching object reference when duplicate IDs exist', () => {
    const first = { id: 'dup-id', summary: 'First Note' };
    const second = { id: 'dup-id', summary: 'Second Note' };
    const encounter: any = {
      id: 'enc-1',
      notes: [first, second],
      conditionals: { 'dup-id': ['ORD'] },
    };

    const updated = removeEncounterResult(encounter, {
      collection: 'notes',
      id: 'dup-id',
      itemRef: first,
    });
    expect(updated.notes).toEqual([second]);
    expect(updated.conditionals).toEqual({ 'dup-id': ['ORD'] });
  });

  it('finds result location from explicit metadata or by scanning encounters', () => {
    const db = createMockDatabase();
    const encounters = db.patients['1001'].encounters as any;

    expect(
      findResultLocation(encounters, { _encounterId: 'enc-prior', _collection: 'labs', _docId: 'lab-prior-cond' })
    ).toMatchObject({ encounterId: 'enc-prior', collection: 'labs', id: 'lab-prior-cond' });

    expect(findResultLocation(encounters, { id: 'img-cond' })).toMatchObject({
      encounterId: 'enc-curr',
      collection: 'imaging',
      id: 'img-cond',
    });

    expect(findResultLocation(encounters, { id: 'missing' })).toBeNull();
  });

  it('closes matching Report and Imaging Viewer tabs across panes and clamps selection', () => {
    const setMainTabs = vi.fn();
    const setSideTabs = vi.fn();
    const setWindowTabs = vi.fn();
    const setSelectedMainTab = vi.fn();
    const setSelectedSideTab = vi.fn();

    closeTabsForResult(
      {
        mainTabs: [{ 'Chart Review': {} }, { Report: { data: { id: 'lab-1' } } }],
        sideTabs: [{ 'Imaging Viewer': { data: { _docId: 'lab-1' } } }, { Orders: {} }],
        windowTabs: [{ Report: { data: { id: 'lab-2' } } }],
        setMainTabs,
        setSideTabs,
        setWindowTabs,
        setSelectedMainTab,
        setSelectedSideTab,
      },
      'lab-1'
    );

    expect(setMainTabs).toHaveBeenCalledWith([{ 'Chart Review': {} }]);
    expect(setSideTabs).toHaveBeenCalledWith([{ Orders: {} }]);
    expect(setWindowTabs).not.toHaveBeenCalled();
    expect(setSelectedMainTab).toHaveBeenCalledTimes(1);
    expect(setSelectedSideTab).toHaveBeenCalledTimes(1);
  });
});

describe('Titlebar Faculty Mode toggle', () => {
  it('toggles Faculty Mode without a password and resets on logout', () => {
    const store = createStore(createMockDatabase() as any);
    const AuthProbe = () => {
      const auth = useAuth();
      return <span data-testid="faculty-flag">{String(auth?.isFacultyMode)}</span>;
    };

    render(
      <MemoryRouter>
        <TemporalRootProvider>
          <PromptProvider>
            <AuthProvider>
              <DatabaseContext.Provider value={store.useStore as any}>
                <Titlebar onLogout={vi.fn()} />
                <AuthProbe />
              </DatabaseContext.Provider>
            </AuthProvider>
          </PromptProvider>
        </TemporalRootProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('faculty-flag')).toHaveTextContent('false');
    expect(screen.queryByText('Faculty Mode')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /ProjectEHR/i }));
    const toggleItem = screen.getByRole('menuitem', { name: /Faculty Mode/i });
    fireEvent.click(toggleItem);

    expect(screen.getByTestId('faculty-flag')).toHaveTextContent('true');
    expect(screen.getByText('Faculty Mode', { selector: '.MuiChip-label' })).toBeInTheDocument();

    // Clicking the menu item again turns it off immediately
    fireEvent.click(screen.getByRole('menuitem', { name: /Faculty Mode/i }));
    expect(screen.getByTestId('faculty-flag')).toHaveTextContent('false');
    expect(screen.queryByText('Faculty Mode', { selector: '.MuiChip-label' })).not.toBeInTheDocument();
  });
});

describe('ResultsReview student vs faculty mode', () => {
  it('hides New Result button and conditional results for students', () => {
    render(
      <Harness initialFacultyMode={false}>
        <ResultsReview />
      </Harness>
    );

    expect(screen.queryByRole('button', { name: /New Result/i })).not.toBeInTheDocument();
    expect(screen.getAllByText('LDL').length).toBeGreaterThan(0);
    expect(screen.queryByText('Sodium')).not.toBeInTheDocument();
  });

  it('shows New Result button and conditional results for faculty without orders', () => {
    render(
      <Harness initialFacultyMode={true}>
        <ResultsReview />
      </Harness>
    );

    expect(screen.getByRole('button', { name: /New Result/i })).toBeInTheDocument();
    expect(screen.getAllByText('LDL').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sodium').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hidden Chest X-Ray').length).toBeGreaterThan(0);
  });
});

describe('ChartReview student vs faculty mode', () => {
  it('hides conditional labs and delete buttons for students', () => {
    render(
      <Harness initialFacultyMode={false}>
        <ChartReview />
      </Harness>
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Lab' }));
    expect(screen.getByText('Visible Lipid Panel')).toBeInTheDocument();
    expect(screen.queryByText('Hidden Conditional BMP')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Delete result/i })).not.toBeInTheDocument();
  });

  it('shows conditional labs and deletes a result on confirmation in faculty mode', async () => {
    render(
      <Harness
        initialFacultyMode={true}
        initialSideTabs={[{ Report: { data: { id: 'lab-prior-cond' } } }]}
      >
        <ChartReview />
      </Harness>
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Lab' }));
    expect(screen.getByText('Visible Lipid Panel')).toBeInTheDocument();
    expect(screen.getByText('Hidden Conditional BMP')).toBeInTheDocument();
    expect(screen.getByText('Prior Conditional CBC')).toBeInTheDocument();
    expect(screen.getAllByText('Conditional')).toHaveLength(2);

    const priorRow = screen.getByText('Prior Conditional CBC').closest('[role="row"]') as HTMLElement;
    const deleteBtn = within(priorRow).getByRole('button', { name: /Delete result/i });
    fireEvent.click(deleteBtn);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/Prior Conditional CBC/i)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: /Confirm/i }));

    await waitFor(() => {
      expect(screen.queryByText('Prior Conditional CBC')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Hidden Conditional BMP')).toBeInTheDocument();
  });

  it('does not shift Conditional badge onto the next row when deleting an index-keyed conditional lab at the top', async () => {
    const store = createStore({
      departments: [{ id: 'dept-1', name: 'Internal Medicine' }],
      providers: [{ id: 'prov-1', name: 'Dr. Ada Lovelace', role: 'Physician', specialty: 'IM' }],
      locations: [],
      appointments: [],
      lists: [],
      flowsheets: [],
      orderables: { procedures: {}, result_map: {}, components: {}, rxnorm: [] },
      patients: {
        '1001': {
          id: '1001',
          firstName: 'Test',
          lastName: 'Patient',
          encounters: {
            'enc-curr': {
              id: 'enc-curr',
              startDate: '2026-02-01T10:00:00Z',
              type: 'Emergency',
              status: 'In Progress',
              department: 'dept-1',
              provider: 'prov-1',
              orders: [],
              conditionals: {
                'labs.0': ['BMAMA'],
              },
              labs: [
                {
                  date: '2026-02-01T12:00:00Z',
                  test: 'Top Conditional Lab',
                  status: 'Completed',
                  abnormal: false,
                  components: [{ name: 'Sodium', value: 138 }],
                },
                {
                  date: '2026-02-01T11:00:00Z',
                  test: 'Below Unconditional Lab',
                  status: 'Completed',
                  abnormal: false,
                  components: [{ name: 'Potassium', value: 4.1 }],
                },
              ],
              imaging: [],
              notes: [],
              problems: [],
            },
          },
        },
      },
    } as any);

    const Wrapper = () => {
      const [isFacultyMode, setIsFacultyMode] = React.useState(true);
      const [mainTabs, setMainTabs] = React.useState<any[]>([{ 'Chart Review': {} }]);
      const [sideTabs, setSideTabs] = React.useState<any[]>([]);
      const [windowTabs, setWindowTabs] = React.useState<any[]>([]);
      const [selectedMainTab, setSelectedMainTab] = React.useState(0);
      const [selectedSideTab, setSelectedSideTab] = React.useState(0);
      const splitViewValue = React.useMemo(
        () => ({
          mainTabs,
          setMainTabs,
          sideTabs,
          setSideTabs,
          windowTabs,
          setWindowTabs,
          selectedMainTab,
          setSelectedMainTab,
          selectedSideTab,
          setSelectedSideTab,
          closeMainTab: vi.fn(),
          closeSideTab: vi.fn(),
          closeWindowTab: vi.fn(),
          closeTab: vi.fn(() => true),
          openTab: vi.fn(() => 0),
        }),
        [mainTabs, sideTabs, windowTabs, selectedMainTab, selectedSideTab]
      );
      return (
        <MemoryRouter>
          <TemporalRootProvider>
            <PromptProvider>
              <AuthContext.Provider
                value={{
                  isAuthenticated: true,
                  isPasswordSet: false,
                  isFacultyMode,
                  enabledEncounters: {},
                  setFacultyMode: setIsFacultyMode,
                  setPassword: vi.fn(),
                  verifyPassword: vi.fn(async () => true),
                  updateEncounters: vi.fn(),
                  login: vi.fn(),
                  logout: () => setIsFacultyMode(false),
                }}
              >
                <DatabaseContext.Provider value={store.useStore as any}>
                  <PatientProvider patient={'1001' as any} encounter={'enc-curr' as any}>
                    <SplitViewProvider value={splitViewValue}>
                      <ChartReview />
                    </SplitViewProvider>
                  </PatientProvider>
                </DatabaseContext.Provider>
              </AuthContext.Provider>
            </PromptProvider>
          </TemporalRootProvider>
        </MemoryRouter>
      );
    };

    render(<Wrapper />);
    fireEvent.click(screen.getByRole('tab', { name: 'Lab' }));

    expect(screen.getByText('Top Conditional Lab')).toBeInTheDocument();
    expect(screen.getByText('Below Unconditional Lab')).toBeInTheDocument();
    expect(screen.getAllByText('Conditional')).toHaveLength(1);

    const topRow = screen.getByText('Top Conditional Lab').closest('[role="row"]') as HTMLElement;
    expect(within(topRow).getByText('Conditional')).toBeInTheDocument();

    fireEvent.click(within(topRow).getByRole('button', { name: /Delete result/i }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /Confirm/i }));

    await waitFor(() => {
      expect(screen.queryByText('Top Conditional Lab')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Below Unconditional Lab')).toBeInTheDocument();
    expect(screen.queryByText('Conditional')).not.toBeInTheDocument();
  });
});

describe('ReportViewer student vs faculty mode', () => {
  it('hides Delete Result button for students', () => {
    const sampleDoc: any = {
      id: 'lab-visible',
      test: 'Visible Lipid Panel',
      components: [{ name: 'LDL', value: 95, units: 'mg/dL', low: 0, high: 100 }],
    };

    render(
      <Harness initialFacultyMode={false}>
        <ReportViewer data={sampleDoc} />
      </Harness>
    );

    expect(screen.queryByRole('button', { name: /Delete Result/i })).not.toBeInTheDocument();
  });

  it('shows Conditional badge and deletes result from ReportViewer in faculty mode', async () => {
    const sampleDoc: any = {
      id: 'lab-cond',
      test: 'Hidden Conditional BMP',
      components: [{ name: 'Sodium', value: 131, units: 'mmol/L', low: 135, high: 145 }],
    };

    const StoreProbe = () => {
      const store = React.useContext(DatabaseContext)!;
      const { sideTabs } = useSplitView();
      const [labs] = store.patients['1001'].encounters['enc-curr'].labs();
      const [conditionals] = store.patients['1001'].encounters['enc-curr'].conditionals();
      return (
        <div>
          <span data-testid="lab-count">{labs.length}</span>
          <span data-testid="has-cond">{String('lab-cond' in (conditionals || {}))}</span>
          <span data-testid="side-tab-count">{sideTabs.length}</span>
        </div>
      );
    };

    render(
      <Harness
        initialFacultyMode={true}
        initialSideTabs={[{ Report: { data: sampleDoc } }]}
      >
        <ReportViewer data={sampleDoc} />
        <StoreProbe />
      </Harness>
    );

    expect(screen.getByText('Conditional (Hidden)')).toBeInTheDocument();
    expect(screen.getByTestId('lab-count')).toHaveTextContent('3');
    expect(screen.getByTestId('has-cond')).toHaveTextContent('true');
    expect(screen.getByTestId('side-tab-count')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: /Delete Result/i }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /Confirm/i }));

    await waitFor(() => {
      expect(screen.getByTestId('lab-count')).toHaveTextContent('2');
    });
    expect(screen.getByTestId('has-cond')).toHaveTextContent('false');
    expect(screen.getByTestId('side-tab-count')).toHaveTextContent('0');
  });

  it('deletes a legacy lab without an id when opened via ChartReview double-click payload', async () => {
    const LegacyHarness = () => {
      const store = React.useContext(DatabaseContext)!;
      const { sideTabs } = useSplitView();
      const [labs] = store.patients['1001'].encounters['enc-curr'].labs();
      const legacyLab = labs.find((l: any) => l.test === 'Legacy Lab Without ID');
      const enrichedPayload: any = legacyLab
        ? {
            ...legacyLab,
            kind: 'Lab',
            _encounterId: 'enc-curr',
            _docId: undefined,
            _collection: 'labs',
            _rawDoc: legacyLab,
          }
        : null;

      return (
        <div>
          <span data-testid="legacy-exists">{String(Boolean(legacyLab))}</span>
          <span data-testid="side-tab-count">{sideTabs.length}</span>
          {enrichedPayload && <ReportViewer data={enrichedPayload} />}
        </div>
      );
    };

    render(
      <Harness
        initialFacultyMode={true}
        initialSideTabs={[{ Report: { data: { test: 'Legacy Lab Without ID' } } }]}
      >
        <LegacyHarness />
      </Harness>
    );

    expect(screen.getByTestId('legacy-exists')).toHaveTextContent('true');
    fireEvent.click(screen.getByRole('button', { name: /Delete Result/i }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /Confirm/i }));

    await waitFor(() => {
      expect(screen.getByTestId('legacy-exists')).toHaveTextContent('false');
    });
  });
});

describe('ChartReview Notes, Encounters, and NoteViewer deletion', () => {
  it('deletes notes from ChartReview in faculty mode while hiding delete buttons for students', async () => {
    const { unmount } = render(
      <Harness initialFacultyMode={false}>
        <ChartReview />
      </Harness>
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Notes' }));
    expect(screen.getByText('Progress Notes')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Delete note/i })).not.toBeInTheDocument();
    unmount();

    render(
      <Harness initialFacultyMode={true}>
        <ChartReview />
      </Harness>
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Notes' }));
    const noteRow = screen.getByText('Progress Notes').closest('[role="row"]') as HTMLElement;
    fireEvent.click(within(noteRow).getByRole('button', { name: /Delete note/i }));

    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /Confirm/i }));

    await waitFor(() => {
      expect(screen.queryByText('Progress Notes')).not.toBeInTheDocument();
    });
  });

  it('deletes prior encounters from ChartReview in faculty mode', async () => {
    render(
      <Harness initialFacultyMode={true}>
        <ChartReview />
      </Harness>
    );

    const priorEncRow = screen.getByText('Outpatient').closest('[role="row"]') as HTMLElement;
    fireEvent.click(within(priorEncRow).getByRole('button', { name: /Delete encounter/i }));

    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /Confirm/i }));

    await waitFor(() => {
      expect(screen.queryByText('Outpatient')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Emergency')).toBeInTheDocument();
  });

  it('deletes a note from NoteViewer in faculty mode and closes the Note tab', async () => {
    const noteDoc: any = {
      id: 'note-1',
      date: '2026-02-01T10:30:00Z',
      serviceDate: '2026-02-01T10:30:00Z',
      type: 'Progress Notes',
      author: 'prov-1',
      status: 'Signed',
      summary: 'Initial Progress Note',
      content: '<p>Patient doing well.</p>',
    };

    const NoteProbe = () => {
      const store = React.useContext(DatabaseContext)!;
      const { sideTabs } = useSplitView();
      const [notes] = store.patients['1001'].encounters['enc-curr'].notes();
      return (
        <div>
          <span data-testid="note-count">{notes.length}</span>
          <span data-testid="side-tab-count">{sideTabs.length}</span>
        </div>
      );
    };

    render(
      <Harness
        initialFacultyMode={true}
        initialSideTabs={[{ Note: { data: noteDoc } }]}
      >
        <NoteViewer data={noteDoc} />
        <NoteProbe />
      </Harness>
    );

    expect(screen.getByTestId('note-count')).toHaveTextContent('1');
    expect(screen.getByTestId('side-tab-count')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: /Delete Note/i }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /Confirm/i }));

    await waitFor(() => {
      expect(screen.getByTestId('note-count')).toHaveTextContent('0');
    });
    expect(screen.getByTestId('side-tab-count')).toHaveTextContent('0');
  });
});
