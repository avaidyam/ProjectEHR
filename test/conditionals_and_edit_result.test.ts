import { describe, it, expect } from 'vitest';
import { filterDocuments } from '../src/util/helpers';
import { search_orders } from '../src/routes/Patient/routes/OrderCart/components/OrderPicker';
import orderablesData from '../src/util/data/orderables.json';

describe('filterDocuments with conditional labs and imaging', () => {
  const mockLabs = [
    { id: 'lab-bmp', test: 'Basic Metabolic Panel', date: '2026-01-23T00:00:00Z' },
    { id: 'lab-cbc', test: 'Complete Blood Count', date: '2026-01-23T00:00:00Z' },
    { id: 'lab-unconditional', test: 'Routine Urinalysis', date: '2026-01-23T00:00:00Z' },
  ];

  const mockImaging = [
    { id: 'img-ct-single', test: 'CT BRAIN W/O CONTRAST', date: '2026-01-23T00:00:00Z' },
    { id: 'img-ct-double', test: 'CT BRAIN FOLLOW-UP', date: '2026-01-23T00:00:00Z' },
    { id: 'img-unconditional', test: 'Chest X-Ray', date: '2026-01-23T00:00:00Z' },
  ];

  const mockConditionals = {
    'lab-bmp': ['BMAMA'],
    'lab-cbc': ['Complete Blood Count'],
    'img-ct-single': ['CTBRAINW'],
    'img-ct-double': ['CTBRAINW', 'CTBRAINW'],
  };

  it('hides conditional labs and imaging when no orders exist', () => {
    const orders: any[] = [];
    const visibleLabs = filterDocuments(mockLabs, mockConditionals, orders);
    const visibleImaging = filterDocuments(mockImaging, mockConditionals, orders);

    expect(visibleLabs.map(l => l.id)).toEqual(['lab-unconditional']);
    expect(visibleImaging.map(i => i.id)).toEqual(['img-unconditional']);
  });

  it('shows conditional lab when order code matches', () => {
    const orders = [{ id: '1', code: 'BMAMA', name: 'Basic Metabolic Panel (BMP), Serum' }];
    const visibleLabs = filterDocuments(mockLabs, mockConditionals, orders);

    expect(visibleLabs.map(l => l.id)).toEqual(['lab-bmp', 'lab-unconditional']);
  });

  it('shows conditional lab when order name matches requirement', () => {
    const orders = [{ id: '2', name: 'Complete Blood Count' }];
    const visibleLabs = filterDocuments(mockLabs, mockConditionals, orders);

    expect(visibleLabs.map(l => l.id)).toEqual(['lab-cbc', 'lab-unconditional']);
  });

  it('handles order multiplicity for imaging (requires 2 orders for double CT)', () => {
    // With 1 order, single CT is visible, but double CT remains hidden
    const singleOrder = [{ id: 'ord-1', code: 'CTBRAINW', name: 'CT BRAIN' }];
    let visibleImaging = filterDocuments(mockImaging, mockConditionals, singleOrder);
    expect(visibleImaging.map(i => i.id)).toEqual(['img-ct-single', 'img-unconditional']);

    // With 2 orders, both single and double CT are visible
    const doubleOrders = [
      { id: 'ord-1', code: 'CTBRAINW', name: 'CT BRAIN' },
      { id: 'ord-2', code: 'CTBRAINW', name: 'CT BRAIN' },
    ];
    visibleImaging = filterDocuments(mockImaging, mockConditionals, doubleOrders);
    expect(visibleImaging.map(i => i.id)).toEqual(['img-ct-single', 'img-ct-double', 'img-unconditional']);
  });

  it('handles case-insensitivity in order matching', () => {
    const orders = [{ id: '1', code: 'bmama', name: 'basic metabolic panel' }];
    const visibleLabs = filterDocuments(mockLabs, mockConditionals, orders);
    expect(visibleLabs.map(l => l.id)).toEqual(['lab-bmp', 'lab-unconditional']);
  });

  it('hides conditional labs when orders are reset or discontinued', () => {
    let orders = [
      { id: '1', code: 'BMAMA', name: 'Basic Metabolic Panel (BMP), Serum' },
      { id: '2', name: 'Complete Blood Count' },
      { id: 'ord-1', code: 'CTBRAINW', name: 'CT BRAIN' }
    ];

    // Initially both conditional labs and single imaging are visible
    let visibleLabs = filterDocuments(mockLabs, mockConditionals, orders);
    let visibleImaging = filterDocuments(mockImaging, mockConditionals, orders);
    expect(visibleLabs.map(l => l.id)).toEqual(['lab-bmp', 'lab-cbc', 'lab-unconditional']);
    expect(visibleImaging.map(i => i.id)).toEqual(['img-ct-single', 'img-unconditional']);

    // Case 1: Individual order discontinuation (e.g. from Orders Mgmt tab + Signed)
    // Order 1 is discontinued, setting discontinueDate directly in encounter orders
    orders = orders.map(o => o.id === '1' ? { ...o, discontinueDate: 123456789 } : o);
    // filterDocuments receives the encounter orders list directly and must ignore discontinued orders
    visibleLabs = filterDocuments(mockLabs, mockConditionals, orders);
    // lab-bmp should now be hidden!
    expect(visibleLabs.map(l => l.id)).toEqual(['lab-cbc', 'lab-unconditional']);

    // Case 1b: Order with status = 'discontinued' is also ignored directly
    const ordersWithDiscontinuedStatus = [
      { id: '1', code: 'BMAMA', name: 'Basic Metabolic Panel (BMP), Serum', status: 'discontinued' },
      { id: '2', name: 'Complete Blood Count' }
    ];
    const visibleLabsWithStatus = filterDocuments(mockLabs, mockConditionals, ordersWithDiscontinuedStatus);
    expect(visibleLabsWithStatus.map(l => l.id)).toEqual(['lab-cbc', 'lab-unconditional']);

    // Case 2: Reset case (remove all orders via Manage Orders -> Reset Case)
    const activeOrdersAfterReset: any[] = [];
    visibleLabs = filterDocuments(mockLabs, mockConditionals, activeOrdersAfterReset);
    visibleImaging = filterDocuments(mockImaging, mockConditionals, activeOrdersAfterReset);
    // All conditional labs and imaging must now be invisible!
    expect(visibleLabs.map(l => l.id)).toEqual(['lab-unconditional']);
    expect(visibleImaging.map(i => i.id)).toEqual(['img-unconditional']);
  });
});


describe('EditResult orderables robustness', () => {
  it('safely extracts components even when orderables is empty or undefined', () => {
    // Simulating empty orderables store state from reset or corrupt DB
    const emptyOrderables = {} as any;
    const compsEmpty = emptyOrderables?.components || (orderablesData as any)?.components || {};
    expect(() => Object.entries(compsEmpty)).not.toThrow();
    const componentList = Object.entries(compsEmpty).map(([key, value]) => ({ label: value, id: key }));
    expect(componentList.length).toBeGreaterThan(0);

    // Simulating undefined orderables
    const undefinedOrderables = undefined as any;
    const compsUndefined = undefinedOrderables?.components || (orderablesData as any)?.components || {};
    expect(() => Object.entries(compsUndefined)).not.toThrow();
  });

  it('safely accesses result_map even when orderables is empty', () => {
    const emptyOrderables = {} as any;
    const resultMap = emptyOrderables?.result_map || (orderablesData as any)?.result_map || {};
    expect(() => resultMap['some-test-id']).not.toThrow();
  });
});

describe('search_orders flexible token and code matching', () => {
  it('matches multi-word queries independent of token order (chest xr vs xr chest)', () => {
    const resChestXR = search_orders(orderablesData as any, 'chest xr', 10);
    const resXRChest = search_orders(orderablesData as any, 'xr chest', 10);

    expect(resChestXR.some(x => x.code === 'XRCH1V')).toBe(true);
    expect(resXRChest.some(x => x.code === 'XRCH1V')).toBe(true);
    expect(resChestXR.some(x => x.name.toLowerCase().includes('chest') && x.name.toLowerCase().includes('xr'))).toBe(true);
  });

  it('matches orders by code and handles punctuation variations (pt/inr vs ptinr vs code ptinrpoc)', () => {
    const resPtinr = search_orders(orderablesData as any, 'ptinr', 10);
    const resPtSlashInr = search_orders(orderablesData as any, 'pt/inr', 10);
    const resCode = search_orders(orderablesData as any, 'ptinrpoc', 10);

    expect(resPtinr.some(x => x.code === 'PTINRPOC' && x.name === 'PT/INR (POC)')).toBe(true);
    expect(resPtSlashInr.some(x => x.code === 'PTINRPOC' && x.name === 'PT/INR (POC)')).toBe(true);
    expect(resCode.some(x => x.code === 'PTINRPOC' && x.name === 'PT/INR (POC)')).toBe(true);
  });

  it('matches medications by brand alias (tylenol for acetaminophen)', () => {
    const resTylenol = search_orders(orderablesData as any, 'tylenol', 10, 'medications');
    expect(resTylenol.length).toBeGreaterThan(0);
    expect(resTylenol.some(x => x.name.toLowerCase().includes('tylenol'))).toBe(true);
  });
});

describe('filterDocuments with alternative conditional orders (OR and AND logic)', () => {
  const mockDocs = [
    { id: 'doc-cxr', test: 'Chest X-Ray' },
    { id: 'doc-complex', test: 'Complex Assessment' },
    { id: 'doc-multiplicity', test: 'Two Views Required' }
  ];

  const conditionals = {
    // Single condition fulfilled by ANY alternative order (OR logic)
    'doc-cxr': [['XRCH1V', 'XRCH2V', 'XRCH4+V']],
    // Multiple conditions: Condition 1 (XRCH1V OR XRCH2V) AND Condition 2 (CBC)
    'doc-complex': [['XRCH1V', 'XRCH2V'], 'CBC'],
    // Multiplicity: Requires 2 orders, each matching the alternative options
    'doc-multiplicity': [['XRCH1V', 'XRCH2V'], ['XRCH1V', 'XRCH2V']]
  };

  it('makes document visible when any of the alternative orders is placed (OR logic)', () => {
    // No orders placed: hidden
    expect(filterDocuments(mockDocs, conditionals, []).map(d => d.id)).toEqual([]);

    // Placing XRCH1V fulfills doc-cxr
    const orders1 = [{ id: '1', code: 'XRCH1V', name: 'XR Chest 1 View' }];
    expect(filterDocuments(mockDocs, conditionals, orders1).map(d => d.id)).toEqual(['doc-cxr']);

    // Placing XRCH2V also fulfills doc-cxr
    const orders2 = [{ id: '2', code: 'XRCH2V', name: 'XR Chest 2 Views' }];
    expect(filterDocuments(mockDocs, conditionals, orders2).map(d => d.id)).toEqual(['doc-cxr']);

    // Placing XRCH4+V also fulfills doc-cxr
    const orders3 = [{ id: '3', code: 'XRCH4+V', name: 'XR Chest 4+ Views' }];
    expect(filterDocuments(mockDocs, conditionals, orders3).map(d => d.id)).toEqual(['doc-cxr']);

    // Placing an unrelated order does NOT fulfill doc-cxr
    const unrelated = [{ id: '4', code: 'BMAMA', name: 'Basic Metabolic Panel' }];
    expect(filterDocuments(mockDocs, conditionals, unrelated).map(d => d.id)).toEqual([]);
  });

  it('evaluates AND logic across conditions while supporting OR logic within each condition', () => {
    // Only placing XRCH1V fulfills doc-cxr, but NOT doc-complex (CBC is missing)
    const orders1 = [{ id: '1', code: 'XRCH1V', name: 'XR Chest 1 View' }];
    expect(filterDocuments(mockDocs, conditionals, orders1).map(d => d.id)).toEqual(['doc-cxr']);

    // Placing only CBC does NOT fulfill doc-complex
    const orders2 = [{ id: '2', code: 'CBC', name: 'Complete Blood Count' }];
    expect(filterDocuments(mockDocs, conditionals, orders2).map(d => d.id)).toEqual([]);

    // Placing XRCH2V AND CBC fulfills both doc-cxr and doc-complex!
    const ordersBoth = [
      { id: '1', code: 'XRCH2V', name: 'XR Chest 2 Views' },
      { id: '2', code: 'CBC', name: 'Complete Blood Count' }
    ];
    expect(filterDocuments(mockDocs, conditionals, ordersBoth).map(d => d.id)).toEqual(['doc-cxr', 'doc-complex']);
  });

  it('correctly handles multiplicity with alternative orders without double-counting', () => {
    // 1 order (XRCH1V) does NOT fulfill doc-multiplicity (requires 2)
    const singleOrder = [{ id: '1', code: 'XRCH1V', name: 'XR Chest 1 View' }];
    expect(filterDocuments(mockDocs, conditionals, singleOrder).map(d => d.id)).toEqual(['doc-cxr']);

    // 2 orders (e.g. 1 XRCH1V and 1 XRCH2V) fulfills doc-multiplicity
    const twoOrders = [
      { id: '1', code: 'XRCH1V', name: 'XR Chest 1 View' },
      { id: '2', code: 'XRCH2V', name: 'XR Chest 2 Views' }
    ];
    expect(filterDocuments(mockDocs, conditionals, twoOrders).map(d => d.id)).toEqual(['doc-cxr', 'doc-multiplicity']);
  });

  it('correctly handles multiplicity with alternative orders across repeat images (e.g. Harrison Snodgrass CT scans)', () => {
    const ctDocs = [
      { id: 'img-ct-1', test: 'CT BRAIN W/O CONTRAST' },
      { id: 'img-ct-2', test: 'CT BRAIN W/O CONTRAST' },
    ];
    const ctConditionals = {
      // 1st CT scan accepts CTBRAINW or PETCTBRA
      'img-ct-1': [['CTBRAINW', 'PETCTBRA']],
      // 2nd CT scan requires 2 CT scans
      'img-ct-2': ['CTBRAINW', 'CTBRAINW'],
    };

    // Case A: 1 order for PETCTBRA -> 1st CT shows up, 2nd CT is hidden
    const order1 = [{ id: 'ord-1', code: 'PETCTBRA', name: 'PETCT BRAIN METABOLIC' }];
    expect(filterDocuments(ctDocs, ctConditionals, order1).map(d => d.id)).toEqual(['img-ct-1']);

    // Case B: 1 PETCTBRA + 1 CTBRAINW -> both 1st CT and 2nd CT show up!
    const order1And2 = [
      { id: 'ord-1', code: 'PETCTBRA', name: 'PETCT BRAIN METABOLIC' },
      { id: 'ord-2', code: 'CTBRAINW', name: 'CT BRAIN WITHOUT CONTRAST' },
    ];
    expect(filterDocuments(ctDocs, ctConditionals, order1And2).map(d => d.id)).toEqual(['img-ct-1', 'img-ct-2']);

    // Case C: 2 CTBRAINW orders -> both 1st CT and 2nd CT show up!
    const twoStandardOrders = [
      { id: 'ord-1', code: 'CTBRAINW', name: 'CT BRAIN WITHOUT CONTRAST' },
      { id: 'ord-2', code: 'CTBRAINW', name: 'CT BRAIN WITHOUT CONTRAST' },
    ];
    expect(filterDocuments(ctDocs, ctConditionals, twoStandardOrders).map(d => d.id)).toEqual(['img-ct-1', 'img-ct-2']);

    // Case D: 2 PETCTBRA orders -> both 1st CT and 2nd CT show up!
    const twoPetOrders = [
      { id: 'ord-1', code: 'PETCTBRA', name: 'PETCT BRAIN METABOLIC' },
      { id: 'ord-2', code: 'PETCTBRA', name: 'PETCT BRAIN METABOLIC' },
    ];
    expect(filterDocuments(ctDocs, ctConditionals, twoPetOrders).map(d => d.id)).toEqual(['img-ct-1', 'img-ct-2']);

    // Case E: Discontinuing 1 order leaves only 1st CT visible
    const discontinuedOrder = [
      { id: 'ord-1', code: 'PETCTBRA', name: 'PETCT BRAIN METABOLIC' },
      { id: 'ord-2', code: 'CTBRAINW', name: 'CT BRAIN WITHOUT CONTRAST', discontinueDate: 12345678 },
    ];
    expect(filterDocuments(ctDocs, ctConditionals, discontinuedOrder).map(d => d.id)).toEqual(['img-ct-1']);
  });

  it('hides and shows documents without UUID id (e.g. Yeoman Prince labs and imaging)', () => {
    // Like Yeoman Prince encounter 2:
    const princeLabs = [
      { test: 'PT/INR', components: [{ name: 'PT', value: 12 }], date: '2024-01-01' }, // index 0
      { test: 'Comprehensive Metabolic Panel', components: [{ name: 'GLU', value: 100 }], date: '2024-01-01' }, // index 1
      { test: 'Unconditional Lab', components: [{ name: 'CBC', value: 5 }], date: '2024-01-01' }, // index 2
    ];

    const princeImaging = [
      { test: 'XR CHEST AP OR PA ONLY', accessionNumber: '123455', image: 'base64data', date: '2025-09-17' }, // index 0
      { test: 'Unconditional Imaging', image: 'base64data', date: '2025-09-17' }, // index 1
    ];

    // Test Case 1: Conditionals keyed by path ('labs.0' and 'imaging.0') as saved by ManageConditionalsWindow
    const pathConditionals = {
      'labs.0': ['PTINR'],
      'imaging.0': [['XRCHEST1', 'XRCHEST2']],
    };

    // No orders: conditional lab and imaging are hidden
    expect(filterDocuments(princeLabs, pathConditionals, [], 'labs').map(l => l.test))
      .toEqual(['Comprehensive Metabolic Panel', 'Unconditional Lab']);
    expect(filterDocuments(princeImaging, pathConditionals, [], 'imaging').map(i => i.test))
      .toEqual(['Unconditional Imaging']);

    // Auto-detect category without explicit category argument:
    expect(filterDocuments(princeLabs, pathConditionals, []).map(l => l.test))
      .toEqual(['Comprehensive Metabolic Panel', 'Unconditional Lab']);
    expect(filterDocuments(princeImaging, pathConditionals, []).map(i => i.test))
      .toEqual(['Unconditional Imaging']);

    // With PTINR order signed: PT/INR shows up
    const ptinrOrder = [{ id: 'o-1', code: 'PTINR', name: 'PT/INR (POC)' }];
    expect(filterDocuments(princeLabs, pathConditionals, ptinrOrder, 'labs').map(l => l.test))
      .toEqual(['PT/INR', 'Comprehensive Metabolic Panel', 'Unconditional Lab']);

    // With XRCHEST2 order signed: XR CHEST shows up
    const xrOrder = [{ id: 'o-2', code: 'XRCHEST2', name: 'XR CHEST 2 VIEWS' }];
    expect(filterDocuments(princeImaging, pathConditionals, xrOrder, 'imaging').map(i => i.test))
      .toEqual(['XR CHEST AP OR PA ONLY', 'Unconditional Imaging']);

    // Test Case 2: Conditionals keyed by doc.test ('PT/INR')
    const testNameConditionals = {
      'PT/INR': ['PTINR'],
      'XR CHEST AP OR PA ONLY': ['XRCHEST1'],
    };
    expect(filterDocuments(princeLabs, testNameConditionals, []).map(l => l.test))
      .toEqual(['Comprehensive Metabolic Panel', 'Unconditional Lab']);
    expect(filterDocuments(princeLabs, testNameConditionals, ptinrOrder).map(l => l.test))
      .toEqual(['PT/INR', 'Comprehensive Metabolic Panel', 'Unconditional Lab']);
  });
});

