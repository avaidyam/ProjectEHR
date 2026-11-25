import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { ResultsReview } from '../src/routes/Patient/routes/Results/Results';
import { SplitViewProvider, SplitViewContextType } from '../src/components/contexts/SplitViewContext';
import { PatientContext } from '../src/components/contexts/PatientContext';

function makeStoreHook(initialValue: any) {
  return () => [initialValue, vi.fn()];
}

describe('ResultsReview double-click image result', () => {
  it('opens the Report tab when double clicking on an image result cell', () => {
    const imagingDoc = {
      id: 'img-1',
      test: 'XR CHEST AP',
      date: '2026-11-24T12:00:00Z',
      resultingAgency: 'Radiology',
      image: 'data:image/jpeg;base64,/9j/4AAQ',
      narrative: 'Normal chest radiograph.',
      impression: 'No acute cardiopulmonary process.',
    };

    const openTab = vi.fn();
    const splitViewValue = {
      openTab,
      closeTab: vi.fn(),
      mainTabs: [],
      sideTabs: [],
      windowTabs: [],
    } as unknown as SplitViewContextType;

    const patientValue = {
      useChart: () => makeStoreHook({}),
      useEncounter: () => ({
        labs: makeStoreHook([]),
        imaging: makeStoreHook([imagingDoc]),
        conditionals: makeStoreHook({}),
        orders: makeStoreHook([]),
      }),
    } as any;

    render(
      <SplitViewProvider value={splitViewValue}>
        <PatientContext.Provider value={patientValue}>
          <ResultsReview />
        </PatientContext.Provider>
      </SplitViewProvider>
    );

    const testCell = screen.getByRole('gridcell', { name: 'XR CHEST AP' });
    expect(testCell).toBeInTheDocument();

    // Find the image result cell in the same row
    const row = testCell.closest('[role="row"]')!;
    const gridCells = row.querySelectorAll('[role="gridcell"]');
    const imageCell = gridCells[1];
    expect(imageCell).toBeTruthy();

    fireEvent.doubleClick(imageCell);

    expect(openTab).toHaveBeenCalledWith('Report', { data: imagingDoc }, 'side', false);
  });
});
