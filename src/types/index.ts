export type PhysicalStatus =
  | 'Unloaded'
  | 'In Safe'
  | 'Requested'
  | 'Dispatched'
  | 'In Cabin'
  | 'Return Requested'
  | 'Return Transit'
  | 'In Safe after return'
  | 'Exception';

export type CommercialStatus =
  | 'Available'
  | 'Hold'
  | 'Memo'
  | 'Sale Pending ERP'
  | 'ERP Accepted'
  | 'Requires Review';

export type UserRole =
  | 'INVENTORY_CONTROLLER'
  | 'SALESPERSON'
  | 'RUNNER'
  | 'ADMIN_SUPERVISOR';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  active: boolean;
  assignedCabinId?: string;
  avatarInitials: string;
}

export interface Cabin {
  id: string;
  name: string;
  code: string;
  assignedSalespersonId?: string;
  vipTier: 'Platinum' | 'Gold' | 'Standard';
  currentActiveStonesCount: number;
}

export interface Stone {
  id: string; // e.g. "DIA-2048"
  certificateReference: string; // e.g. "GIA-2048-EX"
  carat: number;
  shape: 'Round' | 'Cushion' | 'Emerald' | 'Oval' | 'Radiant' | 'Pear' | 'Princess' | 'Marquise';
  colour: 'D' | 'E' | 'F' | 'G' | 'H';
  clarity: 'FL' | 'IF' | 'VVS1' | 'VVS2' | 'VS1' | 'VS2';
  cut: 'Ideal' | 'Excellent' | 'Very Good';
  polish: 'Excellent' | 'Very Good';
  symmetry: 'Excellent' | 'Very Good';
  fluorescence: 'None' | 'Faint' | 'Medium';
  estimatedValueUSD: number;
  physicalStatus: PhysicalStatus;
  commercialStatus: CommercialStatus;
  currentLocationId: string; // e.g. "Safe Compartment A-12", "Cabin 04", "In Transit"
  activeCustodianId: string; // User ID or "SYSTEM_VAULT"
  activeCabinId?: string;
  lastEventId: string;
  version: number;
  updatedAt: string;
  cabinPossessionStartedAt?: string; // ISO string when salesperson confirmed receipt
  rfidTag: string;
  notes?: string;
}

export type RequestStatus =
  | 'Requested'
  | 'Verified'
  | 'Dispatched'
  | 'PickupAccepted' // Explicit Runner Pickup Acceptance
  | 'Delivered'
  | 'Received'
  | 'Cancelled'
  | 'Exception';

export interface StoneRequest {
  id: string; // REQ-XXXX
  stoneId: string;
  requestedBy: string; // User ID (Salesperson)
  cabinId: string;
  status: RequestStatus;
  priority: 'Normal' | 'Urgent' | 'VIP Immediate';
  assignedControllerId?: string;
  assignedRunnerId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  handoverAwaitingSalesperson?: boolean;
}

export type MovementEventType =
  | 'OPENING_CHECKIN'
  | 'STONE_REQUESTED'
  | 'BARCODE_VERIFIED_SUCCESS'
  | 'BARCODE_VERIFIED_MISMATCH'
  | 'RUNNER_ASSIGNED'
  | 'DISPATCH_CONFIRMED'
  | 'RUNNER_PICKUP_ACCEPTED'
  | 'RUNNER_ARRIVED_AT_CABIN'
  | 'SALESPERSON_RECEIPT_CONFIRMED'
  | 'HOLD_PLACED'
  | 'HOLD_RELEASED'
  | 'HOLD_EXPIRED'
  | 'MEMO_ISSUED'
  | 'MEMO_RETURN_REQUESTED'
  | 'RUNNER_PICKUP_RETURN'
  | 'SAFE_RECEIPT_CONFIRMED'
  | 'SALE_INITIATED'
  | 'ERP_SYNC_POSTED'
  | 'ERP_SYNC_FAILED'
  | 'RECONCILIATION_FLAGGED'
  | 'RECONCILIATION_RESOLVED'
  | 'EXCEPTION_ASSIGNED'
  | 'EXCEPTION_INVESTIGATING'
  | 'EXCEPTION_RESOLVED'
  | 'EXCEPTION_VERIFIED';

export interface MovementEvent {
  id: string; // MOV-XXXX
  stoneId: string;
  eventType: MovementEventType;
  fromLocation: string;
  toLocation: string;
  previousCustodianId: string;
  newCustodianId: string;
  actorId: string;
  timestamp: string;
  result: 'SUCCESS' | 'BLOCKED' | 'PENDING_CONFIRMATION' | 'EXCEPTION';
  reason?: string;
  sequenceNumber: number;
  deviceChannel: 'WEB_DESKTOP' | 'HANDHELD_SCANNER' | 'RUNNER_MOBILE' | 'ERP_BRIDGE';
}

export type CommercialType = 'HOLD' | 'MEMO' | 'SALE';

export interface CommercialTransaction {
  id: string; // COM-XXXX
  stoneId: string;
  type: CommercialType;
  buyerReference: string;
  buyerName: string;
  authorisedBy: string; // User ID
  startTimestamp: string;
  expiryOrDueDate: string; // ISO date
  status: 'ACTIVE' | 'EXPIRED' | 'RELEASED' | 'CONVERTED' | 'RETURNED' | 'PENDING_ERP' | 'ERP_CONFIRMED' | 'FAILED' | 'REQUIRES_REVIEW';
  agreedPriceUSD?: number;
  erpEventId?: string;
  notes?: string;
}

export type ERPSyncStatus =
  | 'Captured'
  | 'Pending'
  | 'Accepted'
  | 'Failed'
  | 'Requires Review';

export interface ERPEvent {
  id: string; // ERP-XXXX
  stoneId: string;
  eventType: 'STONE_REQUEST_POST' | 'HOLD_RECORD' | 'HOLD_RELEASE' | 'MEMO_RECORD' | 'MEMO_RETURN' | 'SALE_POST' | 'CLOSING_RECON';
  sequenceNumber: number;
  syncStatus: ERPSyncStatus;
  retryCount: number;
  lastAttemptAt: string;
  createdAt: string;
  errorMessage?: string;
  assignedOwner?: string;
  payloadSummary: string;
  idempotencyKey: string;
  simulatedBridge: string;
}

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: string;
  message: string;
  relatedStoneId?: string;
  relatedRequestId?: string;
  actorId: string;
  timestamp: string;
  severity: NotificationSeverity;
  recipient: UserRole | 'ALL';
  relevantAction?: string;
  actionTargetView?: string;
  read: boolean;
}

export type ExceptionStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'INVESTIGATING'
  | 'RESOLVED'
  | 'VERIFIED';

export type ExceptionCategory =
  | 'BARCODE_MISMATCH'
  | 'ERP_GATEWAY_TIMEOUT'
  | 'RETURN_TRANSIT_PENDING_SAFE'
  | 'OVERDUE_CABIN_VIEWING'
  | 'RECONCILIATION_DISCREPANCY'
  | 'UNAUTHORISED_COMMERCIAL';

export interface ExceptionRecord {
  id: string; // EXC-XXX
  category: ExceptionCategory;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  stoneId?: string;
  actorId: string;
  timestamp: string;
  status: ExceptionStatus;
  assignedOwnerId?: string;
  assignedOwnerName?: string;
  ruleViolated: string;
  systemAction: string;
  suggestedRemedy: string;
  investigationNotes?: string;
  resolutionEvidence?: string;
  resolvedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export type ReconciliationStatus =
  | 'Matched'
  | 'Mismatch'
  | 'Pending Investigation'
  | 'Resolved';

export interface ReconciliationItem {
  stoneId: string;
  expectedLocation: string;
  actualLocation: string;
  expectedCustodian: string;
  actualCustodian: string;
  physicalStatus: PhysicalStatus;
  commercialStatus: CommercialStatus;
  status: ReconciliationStatus;
  notes?: string;
  assignedOwner?: string;
  resolvedAt?: string;
}

export interface OperationalMetrics {
  totalInventoryCount: number;
  totalInventoryValueUSD: number;
  // Mutually exclusive physical state counts:
  inSafeInitialCount: number;
  inSafeAfterReturnCount: number;
  unloadedCount: number;
  requestedCount: number;
  dispatchedCount: number;
  inCabinCount: number;
  returnRequestedCount: number;
  returnTransitCount: number;
  exceptionCount: number;
  // Combined helper counts:
  totalInSafeCombinedCount: number; // inSafeInitialCount + inSafeAfterReturnCount + unloadedCount
  totalPhysicalReconciledCount: number; // Sum of all mutually exclusive counts (must strictly equal totalInventoryCount)
  // Commercial state counts (orthogonal):
  availableCount: number;
  onHoldCount: number;
  onMemoCount: number;
  salePendingERPCount: number;
  erpAcceptedCount: number;
  requiresReviewCount: number;
  // Operations & Quality KPIs:
  activeRequestsCount: number;
  avgTurnaroundMinutes: number;
  overdueCabinsCount: number;
  custodyCoveragePercent: number;
  duplicateActiveCustodyCount: number;
  erpSyncReliabilityPercent: number;
  closingReconciliationPercent: number;
}
