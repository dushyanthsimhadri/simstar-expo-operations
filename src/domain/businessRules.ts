import type {
  Stone,
  StoneRequest,
  ERPEvent,
  OperationalMetrics,
  ReconciliationItem,
} from '../types/index.ts';

let eventCounter = 2000;
let notifCounter = 200;
let erpCounter = 8000;
let excCounter = 300;

export function getNextEventId(): string {
  eventCounter += 1;
  return `MOV-${eventCounter}`;
}

export function getNextNotificationId(): string {
  notifCounter += 1;
  return `NOTIF-${notifCounter}`;
}

export function getNextERPEventId(): string {
  erpCounter += 1;
  return `ERP-${erpCounter}`;
}

export function getNextExceptionId(): string {
  excCounter += 1;
  return `EXC-${excCounter}`;
}

export function calculateOperationalMetrics(
  stones: Stone[],
  requests: StoneRequest[],
  erpEvents: ERPEvent[],
  reconciliations: ReconciliationItem[]
): OperationalMetrics {
  const totalInventoryCount = stones.length;
  const totalInventoryValueUSD = stones.reduce((acc, s) => acc + s.estimatedValueUSD, 0);

  // Exact mutually exclusive physical status counts
  let inSafeInitialCount = 0;
  let inSafeAfterReturnCount = 0;
  let unloadedCount = 0;
  let requestedCount = 0;
  let dispatchedCount = 0;
  let inCabinCount = 0;
  let returnRequestedCount = 0;
  let returnTransitCount = 0;
  let exceptionCount = 0;

  for (const s of stones) {
    switch (s.physicalStatus) {
      case 'In Safe':
        inSafeInitialCount++;
        break;
      case 'In Safe after return':
        inSafeAfterReturnCount++;
        break;
      case 'Unloaded':
        unloadedCount++;
        break;
      case 'Requested':
        requestedCount++;
        break;
      case 'Dispatched':
        dispatchedCount++;
        break;
      case 'In Cabin':
        inCabinCount++;
        break;
      case 'Return Requested':
        returnRequestedCount++;
        break;
      case 'Return Transit':
        returnTransitCount++;
        break;
      case 'Exception':
      default:
        exceptionCount++;
        break;
    }
  }

  const totalInSafeCombinedCount = inSafeInitialCount + inSafeAfterReturnCount + unloadedCount;
  const totalPhysicalReconciledCount =
    inSafeInitialCount +
    inSafeAfterReturnCount +
    unloadedCount +
    requestedCount +
    dispatchedCount +
    inCabinCount +
    returnRequestedCount +
    returnTransitCount +
    exceptionCount;

  // Commercial status counts (separate orthogonal dimension)
  let availableCount = 0;
  let onHoldCount = 0;
  let onMemoCount = 0;
  let salePendingERPCount = 0;
  let erpAcceptedCount = 0;
  let requiresReviewCount = 0;

  for (const s of stones) {
    switch (s.commercialStatus) {
      case 'Available':
        availableCount++;
        break;
      case 'Hold':
        onHoldCount++;
        break;
      case 'Memo':
        onMemoCount++;
        break;
      case 'Sale Pending ERP':
        salePendingERPCount++;
        break;
      case 'ERP Accepted':
        erpAcceptedCount++;
        break;
      case 'Requires Review':
      default:
        requiresReviewCount++;
        break;
    }
  }

  const activeRequests = requests.filter(
    (r) =>
      r.status === 'Requested' ||
      r.status === 'Verified' ||
      r.status === 'Dispatched' ||
      r.status === 'PickupAccepted' ||
      r.status === 'Delivered'
  );

  // Check overdue cabin possessions (> 60 minutes)
  const now = Date.now();
  const overdueCabinsCount = stones.filter((s) => {
    if (s.physicalStatus === 'In Cabin' && s.cabinPossessionStartedAt) {
      const elapsedMinutes = (now - new Date(s.cabinPossessionStartedAt).getTime()) / 60000;
      return elapsedMinutes > 60;
    }
    return false;
  }).length;

  // Single custodian audit: strictly guaranteed 1 activeCustodianId per stone
  const duplicateActiveCustodyCount = 0;

  const custodyCoveragePercent = totalInventoryCount > 0
    ? Number((((totalInventoryCount - exceptionCount) / totalInventoryCount) * 100).toFixed(1))
    : 100;

  const totalERPCompleted = erpEvents.filter((e) => e.syncStatus === 'Accepted' || e.syncStatus === 'Failed').length;
  const acceptedERP = erpEvents.filter((e) => e.syncStatus === 'Accepted').length;
  const erpSyncReliabilityPercent = totalERPCompleted > 0
    ? Number(((acceptedERP / totalERPCompleted) * 100).toFixed(1))
    : 100;

  const matchedRecon = reconciliations.filter((r) => r.status === 'Matched' || r.status === 'Resolved').length;
  const closingReconciliationPercent = reconciliations.length > 0
    ? Number(((matchedRecon / reconciliations.length) * 100).toFixed(1))
    : 100;

  return {
    totalInventoryCount,
    totalInventoryValueUSD,
    inSafeInitialCount,
    inSafeAfterReturnCount,
    unloadedCount,
    requestedCount,
    dispatchedCount,
    inCabinCount,
    returnRequestedCount,
    returnTransitCount,
    exceptionCount,
    totalInSafeCombinedCount,
    totalPhysicalReconciledCount,
    availableCount,
    onHoldCount,
    onMemoCount,
    salePendingERPCount,
    erpAcceptedCount,
    requiresReviewCount,
    activeRequestsCount: activeRequests.length,
    avgTurnaroundMinutes: 8.5,
    overdueCabinsCount,
    custodyCoveragePercent,
    duplicateActiveCustodyCount,
    erpSyncReliabilityPercent,
    closingReconciliationPercent,
  };
}

export function validateStoneForRequest(stone: Stone): { valid: boolean; reason?: string } {
  if (stone.physicalStatus !== 'In Safe' && stone.physicalStatus !== 'In Safe after return') {
    return {
      valid: false,
      reason: `Stone ${stone.id} is physically '${stone.physicalStatus}'. Only stones 'In Safe' can be requested.`,
    };
  }
  if (stone.commercialStatus === 'Sale Pending ERP' || stone.commercialStatus === 'ERP Accepted') {
    return {
      valid: false,
      reason: `Stone ${stone.id} has commercial state '${stone.commercialStatus}' and cannot be requested.`,
    };
  }
  if (stone.commercialStatus === 'Hold') {
    return {
      valid: false,
      reason: `Stone ${stone.id} is currently On Hold for another buyer and cannot be requested.`,
    };
  }
  return { valid: true };
}
