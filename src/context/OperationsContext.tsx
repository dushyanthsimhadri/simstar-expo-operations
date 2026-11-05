import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Stone,
  User,
  Cabin,
  StoneRequest,
  MovementEvent,
  CommercialTransaction,
  ERPEvent,
  Notification,
  ReconciliationItem,
  ExceptionRecord,
  OperationalMetrics,
} from '../types';
import {
  SEED_USERS,
  SEED_CABINS,
  generateSeedStones,
  SEED_REQUESTS,
  SEED_COMMERCIAL_TRANSACTIONS,
  SEED_ERP_EVENTS,
  SEED_MOVEMENT_EVENTS,
  SEED_NOTIFICATIONS,
  SEED_RECONCILIATION_ITEMS,
  SEED_EXCEPTIONS,
} from '../data/seedData';
import {
  calculateOperationalMetrics,
  validateStoneForRequest,
  getNextEventId,
  getNextNotificationId,
  getNextERPEventId,
  getNextExceptionId,
} from '../domain/businessRules';

const STORAGE_KEY = 'simstar_expo_operations_v3';

interface OperationsContextType {
  // State
  stones: Stone[];
  users: User[];
  cabins: Cabin[];
  currentUser: User;
  requests: StoneRequest[];
  movementEvents: MovementEvent[];
  commercialTransactions: CommercialTransaction[];
  erpEvents: ERPEvent[];
  notifications: Notification[];
  reconciliationItems: ReconciliationItem[];
  exceptions: ExceptionRecord[];
  selectedStoneId: string | null;
  isDetailDrawerOpen: boolean;
  isNotificationDrawerOpen: boolean;
  metrics: OperationalMetrics;

  // Walkthrough state
  isWalkthroughActive: boolean;
  walkthroughStep: number;
  walkthroughAutoPlaying: boolean;

  // Presentation Mode state
  presentationModeActive: boolean;
  presentationSlide: number;

  // Role & User
  setCurrentUser: (user: User) => void;
  switchRole: (role: User['role']) => void;

  // Drawer / UI
  activeView: string;
  setActiveView: (view: string) => void;
  openStoneDetail: (stoneId: string) => void;
  closeStoneDetail: () => void;
  toggleNotificationDrawer: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  resetDemoData: () => void;

  // Domain Actions
  submitStoneRequest: (stoneId: string, cabinId: string, priority?: StoneRequest['priority'], notes?: string) => { success: boolean; error?: string };
  simulateBarcodeScan: (requestId: string, scanType: 'CORRECT' | 'MISMATCH') => { success: boolean; error?: string };
  dispatchRunner: (requestId: string, runnerId: string) => { success: boolean; error?: string };
  runnerAcceptPickup: (requestId: string) => { success: boolean; error?: string };
  runnerDeliverToCabin: (requestId: string) => { success: boolean; error?: string };
  salespersonConfirmReceipt: (requestId: string) => { success: boolean; error?: string };
  createHold: (stoneId: string, buyerRef: string, buyerName: string, minutes: number) => { success: boolean; error?: string };
  releaseHold: (stoneId: string) => { success: boolean; error?: string };
  createMemo: (stoneId: string, buyerRef: string, buyerName: string, returnDueDate: string) => { success: boolean; error?: string };
  initiateSale: (stoneId: string, buyerRef: string, buyerName: string, agreedPriceUSD: number) => { success: boolean; error?: string };
  requestReturn: (stoneId: string, reason?: string) => { success: boolean; error?: string };
  runnerCollectReturn: (stoneId: string, runnerId: string) => { success: boolean; error?: string };
  stockroomConfirmSafeReceipt: (stoneId: string, compartmentId?: string) => { success: boolean; error?: string };
  simulateERPResponse: (eventId: string, outcome: 'ACCEPTED' | 'FAILED') => void;
  retryERPSync: (eventId: string) => void;
  resolveReconciliationItem: (stoneId: string, notes: string) => void;

  // Exception Governance Lifecycle
  assignException: (id: string, ownerId: string) => void;
  startExceptionInvestigation: (id: string, notes: string) => void;
  resolveException: (id: string, notes: string, evidence: string) => void;
  verifyException: (id: string, verifierId: string) => void;

  // Walkthrough actions
  startWalkthrough: () => void;
  nextWalkthroughStep: () => void;
  prevWalkthroughStep: () => void;
  jumpToWalkthroughStep: (step: number) => void;
  toggleWalkthroughAutoPlay: () => void;
  stopWalkthrough: () => void;

  // Presentation actions
  startPresentation: () => void;
  exitPresentation: () => void;
  nextPresentationSlide: () => void;
  prevPresentationSlide: () => void;
  jumpToPresentationSlide: (slide: number) => void;
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

export const OperationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with localStorage or seed data
  const [stones, setStones] = useState<Stone[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_stones');
      return saved ? JSON.parse(saved) : generateSeedStones();
    } catch {
      return generateSeedStones();
    }
  });

  const [users] = useState<User[]>(SEED_USERS);
  const [cabins] = useState<Cabin[]>(SEED_CABINS);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY + '_current_user_id');
      const found = SEED_USERS.find((u) => u.id === savedId);
      return found || SEED_USERS[0]; // default: Ananya Rao (Inventory Controller)
    } catch {
      return SEED_USERS[0];
    }
  });

  const [requests, setRequests] = useState<StoneRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_requests');
      return saved ? JSON.parse(saved) : SEED_REQUESTS;
    } catch {
      return SEED_REQUESTS;
    }
  });

  const [movementEvents, setMovementEvents] = useState<MovementEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_movements');
      return saved ? JSON.parse(saved) : SEED_MOVEMENT_EVENTS;
    } catch {
      return SEED_MOVEMENT_EVENTS;
    }
  });

  const [commercialTransactions, setCommercialTransactions] = useState<CommercialTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_commercial');
      return saved ? JSON.parse(saved) : SEED_COMMERCIAL_TRANSACTIONS;
    } catch {
      return SEED_COMMERCIAL_TRANSACTIONS;
    }
  });

  const [erpEvents, setErpEvents] = useState<ERPEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_erp');
      return saved ? JSON.parse(saved) : SEED_ERP_EVENTS;
    } catch {
      return SEED_ERP_EVENTS;
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_notifs');
      return saved ? JSON.parse(saved) : SEED_NOTIFICATIONS;
    } catch {
      return SEED_NOTIFICATIONS;
    }
  });

  const [reconciliationItems, setReconciliationItems] = useState<ReconciliationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_recon');
      return saved ? JSON.parse(saved) : SEED_RECONCILIATION_ITEMS;
    } catch {
      return SEED_RECONCILIATION_ITEMS;
    }
  });

  const [exceptions, setExceptions] = useState<ExceptionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_exceptions');
      return saved ? JSON.parse(saved) : SEED_EXCEPTIONS;
    } catch {
      return SEED_EXCEPTIONS;
    }
  });

  // UI States
  const [activeView, setActiveView] = useState<string>('overview');
  const [selectedStoneId, setSelectedStoneId] = useState<string | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Walkthrough State (Steps 1 to 9, represented 0 to 8)
  const [isWalkthroughActive, setIsWalkthroughActive] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [walkthroughAutoPlaying, setWalkthroughAutoPlaying] = useState(false);

  // Presentation Mode State (Slides 1 to 10, represented 0 to 9)
  const [presentationModeActive, setPresentationModeActive] = useState(false);
  const [presentationSlide, setPresentationSlide] = useState(0);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_stones', JSON.stringify(stones));
      localStorage.setItem(STORAGE_KEY + '_requests', JSON.stringify(requests));
      localStorage.setItem(STORAGE_KEY + '_movements', JSON.stringify(movementEvents));
      localStorage.setItem(STORAGE_KEY + '_commercial', JSON.stringify(commercialTransactions));
      localStorage.setItem(STORAGE_KEY + '_erp', JSON.stringify(erpEvents));
      localStorage.setItem(STORAGE_KEY + '_notifs', JSON.stringify(notifications));
      localStorage.setItem(STORAGE_KEY + '_recon', JSON.stringify(reconciliationItems));
      localStorage.setItem(STORAGE_KEY + '_exceptions', JSON.stringify(exceptions));
      localStorage.setItem(STORAGE_KEY + '_current_user_id', currentUser.id);
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [stones, requests, movementEvents, commercialTransactions, erpEvents, notifications, reconciliationItems, exceptions, currentUser]);

  // Derived metrics (strictly mutually exclusive physical inventory reconciliation)
  const metrics = useMemo(() => {
    return calculateOperationalMetrics(stones, requests, erpEvents, reconciliationItems);
  }, [stones, requests, erpEvents, reconciliationItems]);

  const switchRole = useCallback((role: User['role']) => {
    const userForRole = users.find((u) => u.role === role) || users[0];
    setCurrentUser(userForRole);
  }, [users]);

  const openStoneDetail = useCallback((stoneId: string) => {
    setSelectedStoneId(stoneId);
    setIsDetailDrawerOpen(true);
  }, []);

  const closeStoneDetail = useCallback(() => {
    setIsDetailDrawerOpen(false);
  }, []);

  const toggleNotificationDrawer = useCallback(() => {
    setIsNotificationDrawerOpen((prev) => !prev);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const resetDemoData = useCallback(() => {
    setStones(generateSeedStones());
    setRequests(SEED_REQUESTS);
    setMovementEvents(SEED_MOVEMENT_EVENTS);
    setCommercialTransactions(SEED_COMMERCIAL_TRANSACTIONS);
    setErpEvents(SEED_ERP_EVENTS);
    setNotifications(SEED_NOTIFICATIONS);
    setReconciliationItems(SEED_RECONCILIATION_ITEMS);
    setExceptions(SEED_EXCEPTIONS);
    setCurrentUser(SEED_USERS[0]);
    setWalkthroughStep(0);
    setIsWalkthroughActive(false);
    setWalkthroughAutoPlaying(false);
    setPresentationModeActive(false);
    setPresentationSlide(0);
    setSelectedStoneId(null);
    setIsDetailDrawerOpen(false);
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
  }, []);

  // 1. Submit Stone Request (Salesperson)
  const submitStoneRequest = useCallback(
    (stoneId: string, cabinId: string, priority: StoneRequest['priority'] = 'Normal', notes?: string) => {
      const stone = stones.find((s) => s.id === stoneId);
      if (!stone) return { success: false, error: `Stone ${stoneId} not found.` };

      const validation = validateStoneForRequest(stone);
      if (!validation.valid) {
        return { success: false, error: validation.reason };
      }

      // Check if duplicate active request exists
      const existingReq = requests.find(
        (r) => r.stoneId === stoneId && r.status !== 'Cancelled' && r.status !== 'Received'
      );
      if (existingReq) {
        return { success: false, error: `An active request (${existingReq.id}) already exists for ${stoneId}.` };
      }

      const cabin = cabins.find((c) => c.id === cabinId) || cabins[3]; // default Cabin 04
      const newRequestId = `REQ-${Date.now().toString().slice(-4)}`;
      const timestamp = new Date().toISOString();

      const newRequest: StoneRequest = {
        id: newRequestId,
        stoneId,
        requestedBy: currentUser.id,
        cabinId,
        status: 'Requested',
        priority,
        createdAt: timestamp,
        updatedAt: timestamp,
        notes: notes || `Request submitted for ${cabin.name} viewing`,
      };

      const eventId = getNextEventId();
      const movementEvent: MovementEvent = {
        id: eventId,
        stoneId,
        eventType: 'STONE_REQUESTED',
        fromLocation: stone.currentLocationId,
        toLocation: cabin.name,
        previousCustodianId: stone.activeCustodianId,
        newCustodianId: stone.activeCustodianId, // still in safe
        actorId: currentUser.id,
        timestamp,
        result: 'SUCCESS',
        sequenceNumber: stone.version + 1,
        deviceChannel: 'WEB_DESKTOP',
        reason: `Salesperson requested stone for ${cabin.name}`,
      };

      const notifId = getNextNotificationId();
      const notification: Notification = {
        id: notifId,
        type: 'STONE_REQUESTED',
        message: `Stone ${stoneId} requested for ${cabin.name} by ${currentUser.name}. In dispatch queue.`,
        relatedStoneId: stoneId,
        relatedRequestId: newRequestId,
        actorId: currentUser.id,
        timestamp,
        severity: 'info',
        recipient: 'INVENTORY_CONTROLLER',
        relevantAction: 'Verify Barcode & Dispatch',
        actionTargetView: 'role-console',
        read: false,
      };

      setStones((prev) =>
        prev.map((s) =>
          s.id === stoneId
            ? {
                ...s,
                physicalStatus: 'Requested',
                lastEventId: eventId,
                version: s.version + 1,
                updatedAt: timestamp,
              }
            : s
        )
      );

      setRequests((prev) => [newRequest, ...prev]);
      setMovementEvents((prev) => [movementEvent, ...prev]);
      setNotifications((prev) => [notification, ...prev]);

      return { success: true };
    },
    [stones, requests, cabins, currentUser]
  );

  // 2. Barcode Verification (Inventory Controller)
  const simulateBarcodeScan = useCallback(
    (requestId: string, scanType: 'CORRECT' | 'MISMATCH') => {
      const request = requests.find((r) => r.id === requestId);
      if (!request) return { success: false, error: 'Request not found.' };

      const timestamp = new Date().toISOString();

      if (scanType === 'MISMATCH') {
        const eventId = getNextEventId();
        const excId = getNextExceptionId();

        const mismatchEvent: MovementEvent = {
          id: eventId,
          stoneId: request.stoneId,
          eventType: 'BARCODE_VERIFIED_MISMATCH',
          fromLocation: 'Stockroom Safe',
          toLocation: 'Stockroom Safe',
          previousCustodianId: 'SYSTEM_VAULT',
          newCustodianId: 'SYSTEM_VAULT',
          actorId: currentUser.id,
          timestamp,
          result: 'BLOCKED',
          reason: `SECURITY ALERT: Scanned barcode [TAG-MISMATCH-9988] does not match requested stone [${request.stoneId}]. Dispatch blocked.`,
          sequenceNumber: 99,
          deviceChannel: 'HANDHELD_SCANNER',
        };

        const notification: Notification = {
          id: getNextNotificationId(),
          type: 'BARCODE_VERIFIED_MISMATCH',
          message: `BARCODE MISMATCH: Laser check failed for ${request.stoneId}. Physical dispatch strictly blocked. Exception #${excId} logged.`,
          relatedStoneId: request.stoneId,
          relatedRequestId: requestId,
          actorId: currentUser.id,
          timestamp,
          severity: 'error',
          recipient: 'INVENTORY_CONTROLLER',
          relevantAction: 'Open Exception Center',
          actionTargetView: 'exceptions',
          read: false,
        };

        const newException: ExceptionRecord = {
          id: excId,
          category: 'BARCODE_MISMATCH',
          title: `Laser Scan Mismatch at Dispatch Gate (${request.stoneId})`,
          severity: 'CRITICAL',
          stoneId: request.stoneId,
          actorId: currentUser.id,
          timestamp,
          status: 'OPEN',
          ruleViolated: 'Rule 1: Physical dispatch strictly prohibited if barcode mismatches requested stone ID.',
          systemAction: 'Dispatch gate locked; security event logged in immutable ledger; request preserved.',
          suggestedRemedy: 'Inspect cassette tag under 10x magnification, verify GIA serial number, and rescan.',
        };

        setMovementEvents((prev) => [mismatchEvent, ...prev]);
        setNotifications((prev) => [notification, ...prev]);
        setExceptions((prev) => [newException, ...prev]);

        return {
          success: false,
          error: `Barcode verification failed! Scanned cassette barcode does not match diamond identity ${request.stoneId}. Dispatch is blocked by security protocol.`,
        };
      }

      // Correct scan
      const eventId = getNextEventId();
      const verifiedEvent: MovementEvent = {
        id: eventId,
        stoneId: request.stoneId,
        eventType: 'BARCODE_VERIFIED_SUCCESS',
        fromLocation: 'Stockroom Safe',
        toLocation: 'Stockroom Verification Gate',
        previousCustodianId: 'SYSTEM_VAULT',
        newCustodianId: currentUser.id,
        actorId: currentUser.id,
        timestamp,
        result: 'SUCCESS',
        reason: `Barcode verified for ${request.stoneId}. Optical check and certificate match confirmed.`,
        sequenceNumber: 2,
        deviceChannel: 'HANDHELD_SCANNER',
      };

      const notification: Notification = {
        id: getNextNotificationId(),
        type: 'BARCODE_VERIFIED_SUCCESS',
        message: `Inventory Controller ${currentUser.name} verified barcode for ${request.stoneId}. Ready for runner dispatch.`,
        relatedStoneId: request.stoneId,
        relatedRequestId: requestId,
        actorId: currentUser.id,
        timestamp,
        severity: 'success',
        recipient: 'INVENTORY_CONTROLLER',
        relevantAction: 'Assign Runner',
        actionTargetView: 'role-console',
        read: false,
      };

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: 'Verified', assignedControllerId: currentUser.id, updatedAt: timestamp }
            : r
        )
      );

      setMovementEvents((prev) => [verifiedEvent, ...prev]);
      setNotifications((prev) => [notification, ...prev]);

      return { success: true };
    },
    [requests, currentUser]
  );

  // 3. Dispatch Runner (Inventory Controller assigns runner and releases from safe room)
  const dispatchRunner = useCallback(
    (requestId: string, runnerId: string) => {
      const request = requests.find((r) => r.id === requestId);
      if (!request) return { success: false, error: 'Request not found.' };

      const runner = users.find((u) => u.id === runnerId);
      if (!runner) return { success: false, error: 'Selected runner not found.' };

      const cabin = cabins.find((c) => c.id === request.cabinId) || cabins[3];
      const timestamp = new Date().toISOString();
      const eventId = getNextEventId();

      const dispatchEvent: MovementEvent = {
        id: eventId,
        stoneId: request.stoneId,
        eventType: 'DISPATCH_CONFIRMED',
        fromLocation: 'Stockroom Safe Room Gate',
        toLocation: `Safe Gate Pickup Tray (Assigned to ${runner.name})`,
        previousCustodianId: currentUser.id,
        newCustodianId: currentUser.id, // Custody transfers when runner physically accepts pickup!
        actorId: currentUser.id,
        timestamp,
        result: 'SUCCESS',
        reason: `Stone staged at safe dispatch gate for courier ${runner.name} to ${cabin.name}. Pickup acceptance required.`,
        sequenceNumber: 3,
        deviceChannel: 'HANDHELD_SCANNER',
      };

      const notification: Notification = {
        id: getNextNotificationId(),
        type: 'DISPATCH_CONFIRMED',
        message: `Stockroom staged ${request.stoneId} for runner ${runner.name}. Pickup acceptance required at safe room gate.`,
        relatedStoneId: request.stoneId,
        relatedRequestId: requestId,
        actorId: currentUser.id,
        timestamp,
        severity: 'info',
        recipient: 'RUNNER',
        relevantAction: 'Accept Physical Pickup',
        actionTargetView: 'role-console',
        read: false,
      };

      setStones((prev) =>
        prev.map((s) =>
          s.id === request.stoneId
            ? {
                ...s,
                physicalStatus: 'Dispatched',
                currentLocationId: `Safe Dispatch Gate (Courier: ${runner.name})`,
                lastEventId: eventId,
                version: s.version + 1,
                updatedAt: timestamp,
              }
            : s
        )
      );

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'Dispatched',
                assignedRunnerId: runner.id,
                updatedAt: timestamp,
              }
            : r
        )
      );

      setMovementEvents((prev) => [dispatchEvent, ...prev]);
      setNotifications((prev) => [notification, ...prev]);

      return { success: true };
    },
    [requests, users, cabins, currentUser]
  );

  // 3B. Runner Accepts Physical Pickup (P0 Explicit Custody Transition)
  const runnerAcceptPickup = useCallback(
    (requestId: string) => {
      const request = requests.find((r) => r.id === requestId);
      if (!request) return { success: false, error: 'Request not found.' };

      // Guard: Block duplicate pickup or pickup when stone is not staged
      if (request.status !== 'Dispatched') {
        return {
          success: false,
          error: `Duplicate pickup blocked: Request status is '${request.status}'. Stone is not staged for pickup or pickup has already been accepted.`,
        };
      }

      const runner = users.find((u) => u.id === request.assignedRunnerId) || currentUser;
      const cabin = cabins.find((c) => c.id === request.cabinId) || cabins[3];
      const timestamp = new Date().toISOString();
      const eventId = getNextEventId();

      const pickupEvent: MovementEvent = {
        id: eventId,
        stoneId: request.stoneId,
        eventType: 'RUNNER_PICKUP_ACCEPTED',
        fromLocation: 'Stockroom Safe Room Gate',
        toLocation: `Floor Transit with ${runner.name} (En route to ${cabin.name})`,
        previousCustodianId: 'usr_ctrl_ananya',
        newCustodianId: runner.id,
        actorId: runner.id,
        timestamp,
        result: 'SUCCESS',
        reason: `Runner ${runner.name} physically signed and accepted custody cassette at safe gate. En route to ${cabin.name}.`,
        sequenceNumber: 4,
        deviceChannel: 'RUNNER_MOBILE',
      };

      const notification: Notification = {
        id: getNextNotificationId(),
        type: 'RUNNER_PICKUP_ACCEPTED',
        message: `Runner ${runner.name} accepted custody of ${request.stoneId}. En route to ${cabin.name}.`,
        relatedStoneId: request.stoneId,
        relatedRequestId: requestId,
        actorId: runner.id,
        timestamp,
        severity: 'info',
        recipient: 'SALESPERSON',
        relevantAction: 'Awaiting Delivery Arrival',
        actionTargetView: 'role-console',
        read: false,
      };

      setStones((prev) =>
        prev.map((s) =>
          s.id === request.stoneId
            ? {
                ...s,
                physicalStatus: 'Dispatched',
                activeCustodianId: runner.id,
                currentLocationId: `Transit with ${runner.name}`,
                lastEventId: eventId,
                version: s.version + 1,
                updatedAt: timestamp,
              }
            : s
        )
      );

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'PickupAccepted',
                updatedAt: timestamp,
              }
            : r
        )
      );

      setMovementEvents((prev) => [pickupEvent, ...prev]);
      setNotifications((prev) => [notification, ...prev]);

      return { success: true };
    },
    [requests, users, cabins, currentUser]
  );

  // 4. Runner Delivers Stone at Cabin (Runner)
  const runnerDeliverToCabin = useCallback(
    (requestId: string) => {
      const request = requests.find((r) => r.id === requestId);
      if (!request) return { success: false, error: 'Request not found.' };

      const cabin = cabins.find((c) => c.id === request.cabinId) || cabins[3];
      const timestamp = new Date().toISOString();
      const eventId = getNextEventId();

      // Handover awaiting salesperson confirmation. PHYSICAL CUSTODY DOES NOT CHANGE YET!
      const event: MovementEvent = {
        id: eventId,
        stoneId: request.stoneId,
        eventType: 'RUNNER_ARRIVED_AT_CABIN',
        fromLocation: 'Runner Transit',
        toLocation: `${cabin.name} (Delivery Handover Gate)`,
        previousCustodianId: request.assignedRunnerId || currentUser.id,
        newCustodianId: request.assignedRunnerId || currentUser.id, // Custody remains with Runner until confirmed
        actorId: currentUser.id,
        timestamp,
        result: 'PENDING_CONFIRMATION',
        reason: `Runner arrived at ${cabin.name}. Awaiting salesperson physical receipt confirmation.`,
        sequenceNumber: 5,
        deviceChannel: 'RUNNER_MOBILE',
      };

      const notification: Notification = {
        id: getNextNotificationId(),
        type: 'RUNNER_ARRIVED_AT_CABIN',
        message: `Runner arrived at ${cabin.name} with ${request.stoneId}. Salesperson physical confirmation required to complete custody transfer.`,
        relatedStoneId: request.stoneId,
        relatedRequestId: requestId,
        actorId: currentUser.id,
        timestamp,
        severity: 'warning',
        recipient: 'SALESPERSON',
        relevantAction: 'Confirm Physical Receipt',
        actionTargetView: 'role-console',
        read: false,
      };

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'Delivered',
                handoverAwaitingSalesperson: true,
                updatedAt: timestamp,
              }
            : r
        )
      );

      setMovementEvents((prev) => [event, ...prev]);
      setNotifications((prev) => [notification, ...prev]);

      return { success: true };
    },
    [requests, cabins, currentUser]
  );

  // 5. Salesperson Confirms Receipt (Salesperson)
  const salespersonConfirmReceipt = useCallback(
    (requestId: string) => {
      const request = requests.find((r) => r.id === requestId);
      if (!request) return { success: false, error: 'Request not found.' };

      const stone = stones.find((s) => s.id === request.stoneId);
      if (!stone) return { success: false, error: 'Stone not found.' };

      const cabin = cabins.find((c) => c.id === request.cabinId) || cabins[3];
      const timestamp = new Date().toISOString();
      const eventId = getNextEventId();

      const event: MovementEvent = {
        id: eventId,
        stoneId: request.stoneId,
        eventType: 'SALESPERSON_RECEIPT_CONFIRMED',
        fromLocation: `${cabin.name} (Delivery Handover)`,
        toLocation: cabin.name,
        previousCustodianId: stone.activeCustodianId,
        newCustodianId: currentUser.id,
        actorId: currentUser.id,
        timestamp,
        result: 'SUCCESS',
        reason: `Salesperson ${currentUser.name} confirmed physical receipt. Active custody transferred to salesperson.`,
        sequenceNumber: 6,
        deviceChannel: 'WEB_DESKTOP',
      };

      const notification: Notification = {
        id: getNextNotificationId(),
        type: 'SALESPERSON_RECEIPT_CONFIRMED',
        message: `Salesperson ${currentUser.name} accepted physical custody of ${request.stoneId} in ${cabin.name}. Possession timer active.`,
        relatedStoneId: request.stoneId,
        relatedRequestId: requestId,
        actorId: currentUser.id,
        timestamp,
        severity: 'success',
        recipient: 'INVENTORY_CONTROLLER',
        relevantAction: 'Monitor Cabin Possession',
        actionTargetView: 'overview',
        read: false,
      };

      setStones((prev) =>
        prev.map((s) =>
          s.id === request.stoneId
            ? {
                ...s,
                physicalStatus: 'In Cabin',
                activeCustodianId: currentUser.id,
                activeCabinId: request.cabinId,
                currentLocationId: cabin.name,
                cabinPossessionStartedAt: timestamp,
                lastEventId: eventId,
                version: s.version + 1,
                updatedAt: timestamp,
              }
            : s
        )
      );

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'Received',
                handoverAwaitingSalesperson: false,
                updatedAt: timestamp,
              }
            : r
        )
      );

      setMovementEvents((prev) => [event, ...prev]);
      setNotifications((prev) => [notification, ...prev]);

      return { success: true };
    },
    [requests, stones, cabins, currentUser]
  );

  // 6A. Commercial Action: Create Hold
  const createHold = useCallback(
    (stoneId: string, buyerRef: string, buyerName: string, minutes: number) => {
      const stone = stones.find((s) => s.id === stoneId);
      if (!stone) return { success: false, error: 'Stone not found.' };

      if (stone.commercialStatus !== 'Available') {
        return { success: false, error: `Cannot place Hold: stone is currently '${stone.commercialStatus}'.` };
      }

      const timestamp = new Date().toISOString();
      const expiry = new Date(Date.now() + minutes * 60000).toISOString();
      const txId = `COM-${Date.now().toString().slice(-4)}`;
      const erpEventId = getNextERPEventId();

      const newTx: CommercialTransaction = {
        id: txId,
        stoneId,
        type: 'HOLD',
        buyerReference: buyerRef,
        buyerName,
        authorisedBy: currentUser.id,
        startTimestamp: timestamp,
        expiryOrDueDate: expiry,
        status: 'ACTIVE',
        agreedPriceUSD: stone.estimatedValueUSD,
        erpEventId,
        notes: `Exclusive ${minutes}-minute showroom hold placed by ${currentUser.name}.`,
      };

      const erpEvent: ERPEvent = {
        id: erpEventId,
        stoneId,
        eventType: 'HOLD_RECORD',
        sequenceNumber: 1,
        syncStatus: 'Pending',
        retryCount: 0,
        lastAttemptAt: timestamp,
        createdAt: timestamp,
        assignedOwner: currentUser.name,
        payloadSummary: `POST /v2/holds · ${stoneId} · Buyer: ${buyerRef} (${minutes}m)`,
        idempotencyKey: `IDEMP-${stoneId}-HOLD-${Date.now()}`,
        simulatedBridge: 'Simulated SAP S/4HANA Enterprise Bridge',
      };

      const eventId = getNextEventId();
      const movEvent: MovementEvent = {
        id: eventId,
        stoneId,
        eventType: 'HOLD_PLACED',
        fromLocation: stone.currentLocationId,
        toLocation: stone.currentLocationId,
        previousCustodianId: stone.activeCustodianId,
        newCustodianId: stone.activeCustodianId,
        actorId: currentUser.id,
        timestamp,
        result: 'SUCCESS',
        reason: `Commercial Hold placed for ${buyerName} (${buyerRef}) until ${new Date(expiry).toLocaleTimeString()}`,
        sequenceNumber: stone.version + 1,
        deviceChannel: 'WEB_DESKTOP',
      };

      const notification: Notification = {
        id: getNextNotificationId(),
        type: 'HOLD_PLACED',
        message: `Hold placed on ${stoneId} for buyer ${buyerName}. Expiry in ${minutes} minutes. Competing offers locked out.`,
        relatedStoneId: stoneId,
        actorId: currentUser.id,
        timestamp,
        severity: 'info',
        recipient: 'ALL',
        relevantAction: 'View Hold Reservation',
        actionTargetView: 'commercial',
        read: false,
      };

      setStones((prev) =>
        prev.map((s) =>
          s.id === stoneId
            ? { ...s, commercialStatus: 'Hold', lastEventId: eventId, version: s.version + 1, updatedAt: timestamp }
            : s
        )
      );

      setCommercialTransactions((prev) => [newTx, ...prev]);
      setErpEvents((prev) => [erpEvent, ...prev]);
      setMovementEvents((prev) => [movEvent, ...prev]);
      setNotifications((prev) => [notification, ...prev]);

      return { success: true };
    },
    [stones, currentUser]
  );

  // 6A. Release Hold
  const releaseHold = useCallback(
    (stoneId: string) => {
      const stone = stones.find((s) => s.id === stoneId);
      if (!stone) return { success: false, error: 'Stone not found.' };

      const timestamp = new Date().toISOString();
      const eventId = getNextEventId();

      const movEvent: MovementEvent = {
        id: eventId,
        stoneId,
        eventType: 'HOLD_RELEASED',
        fromLocation: stone.currentLocationId,
        toLocation: stone.currentLocationId,
        previousCustodianId: stone.activeCustodianId,
        newCustodianId: stone.activeCustodianId,
        actorId: currentUser.id,
        timestamp,
        result: 'SUCCESS',
        reason: `Hold released by ${currentUser.name}. Commercial state reverted to Available.`,
        sequenceNumber: stone.version + 1,
        deviceChannel: 'WEB_DESKTOP',
      };

      setStones((prev) =>
        prev.map((s) =>
          s.id === stoneId
            ? { ...s, commercialStatus: 'Available', lastEventId: eventId, version: s.version + 1, updatedAt: timestamp }
            : s
        )
      );

      setCommercialTransactions((prev) =>
        prev.map((t) =>
          t.stoneId === stoneId && t.type === 'HOLD' && t.status === 'ACTIVE'
            ? { ...t, status: 'RELEASED' }
            : t
        )
      );

      setMovementEvents((prev) => [movEvent, ...prev]);
      setNotifications((prev) => [
        {
          id: getNextNotificationId(),
          type: 'HOLD_RELEASED',
          message: `Hold released on ${stoneId}. Stone is now commercially Available.`,
          relatedStoneId: stoneId,
          actorId: currentUser.id,
          timestamp,
          severity: 'info',
          recipient: 'ALL',
          relevantAction: 'View Available Inventory',
          actionTargetView: 'inventory',
          read: false,
        },
        ...prev,
      ]);

      return { success: true };
    },
    [stones, currentUser]
  );

  // 6B. Commercial Action: Create Memo
  const createMemo = useCallback(
    (stoneId: string, buyerRef: string, buyerName: string, returnDueDate: string) => {
      const stone = stones.find((s) => s.id === stoneId);
      if (!stone) return { success: false, error: 'Stone not found.' };

      if (stone.commercialStatus !== 'Available' && stone.commercialStatus !== 'Hold') {
        return { success: false, error: `Cannot issue Memo: stone is '${stone.commercialStatus}'.` };
      }

      const timestamp = new Date().toISOString();
      const txId = `COM-${Date.now().toString().slice(-4)}`;
      const erpEventId = getNextERPEventId();

      const newTx: CommercialTransaction = {
        id: txId,
        stoneId,
        type: 'MEMO',
        buyerReference: buyerRef,
        buyerName,
        authorisedBy: currentUser.id,
        startTimestamp: timestamp,
        expiryOrDueDate: returnDueDate,
        status: 'ACTIVE',
        agreedPriceUSD: stone.estimatedValueUSD,
        erpEventId,
        notes: `Consignment Memorandum issued to ${buyerName}. Expected return: ${new Date(returnDueDate).toLocaleDateString()}. SimStar retains ownership.`,
      };

      const erpEvent: ERPEvent = {
        id: erpEventId,
        stoneId,
        eventType: 'MEMO_RECORD',
        sequenceNumber: 1,
        syncStatus: 'Pending',
        retryCount: 0,
        lastAttemptAt: timestamp,
        createdAt: timestamp,
        assignedOwner: currentUser.name,
        payloadSummary: `POST /v2/memos · ${stoneId} · Consignee: ${buyerRef} · Due: ${returnDueDate.slice(0, 10)}`,
        idempotencyKey: `IDEMP-${stoneId}-MEMO-${Date.now()}`,
        simulatedBridge: 'Simulated SAP S/4HANA Enterprise Bridge',
      };

      const eventId = getNextEventId();
      const movEvent: MovementEvent = {
        id: eventId,
        stoneId,
        eventType: 'MEMO_ISSUED',
        fromLocation: stone.currentLocationId,
        toLocation: stone.currentLocationId,
        previousCustodianId: stone.activeCustodianId,
        newCustodianId: stone.activeCustodianId,
        actorId: currentUser.id,
        timestamp,
        result: 'SUCCESS',
        reason: `Memorandum evaluation agreement issued to ${buyerName}. Ownership retained by SimStar.`,
        sequenceNumber: stone.version + 1,
        deviceChannel: 'WEB_DESKTOP',
      };

      const notification: Notification = {
        id: getNextNotificationId(),
        type: 'MEMO_ISSUED',
        message: `Memo issued for ${stoneId} to ${buyerName} (Due: ${returnDueDate.slice(0, 10)}). Ownership retained.`,
        relatedStoneId: stoneId,
        actorId: currentUser.id,
        timestamp,
        severity: 'info',
        recipient: 'ALL',
        relevantAction: 'Track Memo Return Date',
        actionTargetView: 'commercial',
        read: false,
      };

      setStones((prev) =>
        prev.map((s) =>
          s.id === stoneId
            ? { ...s, commercialStatus: 'Memo', lastEventId: eventId, version: s.version + 1, updatedAt: timestamp }
            : s
        )
      );

      setCommercialTransactions((prev) => [newTx, ...prev]);
      setErpEvents((prev) => [erpEvent, ...prev]);
      setMovementEvents((prev) => [movEvent, ...prev]);
      setNotifications((prev) => [notification, ...prev]);

      return { success: true };
    },
    [stones, currentUser]
  );

  // 6C. Commercial Action: Initiate Sale
  const initiateSale = useCallback(
    (stoneId: string, buyerRef: string, buyerName: string, agreedPriceUSD: number) => {
      const stone = stones.find((s) => s.id === stoneId);
      if (!stone) return { success: false, error: 'Stone not found.' };

      const timestamp = new Date().toISOString();
      const txId = `COM-${Date.now().toString().slice(-4)}`;
      const erpEventId = getNextERPEventId();

      const newTx: CommercialTransaction = {
        id: txId,
        stoneId,
        type: 'SALE',
        buyerReference: buyerRef,
        buyerName,
        authorisedBy: currentUser.id,
        startTimestamp: timestamp,
        expiryOrDueDate: timestamp,
        status: 'PENDING_ERP',
        agreedPriceUSD,
        erpEventId,
        notes: `Firm purchase commitment by ${buyerName} at $${agreedPriceUSD.toLocaleString()}. Outbox message queued for ERP sync.`,
      };

      const erpEvent: ERPEvent = {
        id: erpEventId,
        stoneId,
        eventType: 'SALE_POST',
        sequenceNumber: 1,
        syncStatus: 'Pending',
        retryCount: 0,
        lastAttemptAt: timestamp,
        createdAt: timestamp,
        assignedOwner: currentUser.name,
        payloadSummary: `POST /v2/sales-orders · ${stoneId} · $${agreedPriceUSD.toLocaleString()} · Buyer: ${buyerRef}`,
        idempotencyKey: `IDEMP-${stoneId}-SALE-${Date.now()}`,
        simulatedBridge: 'Simulated SAP S/4HANA Enterprise Bridge',
      };

      const eventId = getNextEventId();
      const movEvent: MovementEvent = {
        id: eventId,
        stoneId,
        eventType: 'SALE_INITIATED',
        fromLocation: stone.currentLocationId,
        toLocation: stone.currentLocationId,
        previousCustodianId: stone.activeCustodianId,
        newCustodianId: stone.activeCustodianId,
        actorId: currentUser.id,
        timestamp,
        result: 'PENDING_CONFIRMATION',
        reason: `Floor sale initiated for ${buyerName} ($${agreedPriceUSD.toLocaleString()}). Awaiting ERP acceptance before official posting.`,
        sequenceNumber: stone.version + 1,
        deviceChannel: 'WEB_DESKTOP',
      };

      const notification: Notification = {
        id: getNextNotificationId(),
        type: 'SALE_INITIATED',
        message: `Sale initiated for ${stoneId} ($${agreedPriceUSD.toLocaleString()}) by ${currentUser.name}. Status: Sale Pending ERP.`,
        relatedStoneId: stoneId,
        actorId: currentUser.id,
        timestamp,
        severity: 'info',
        recipient: 'ADMIN_SUPERVISOR',
        relevantAction: 'Monitor ERP Outbox Bridge',
        actionTargetView: 'erp',
        read: false,
      };

      // CORE RULE: "A floor transaction is not officially posted until ERP confirms acceptance."
      // Commercial status becomes "Sale Pending ERP"
      setStones((prev) =>
        prev.map((s) =>
          s.id === stoneId
            ? { ...s, commercialStatus: 'Sale Pending ERP', lastEventId: eventId, version: s.version + 1, updatedAt: timestamp }
            : s
        )
      );

      setCommercialTransactions((prev) => [newTx, ...prev]);
      setErpEvents((prev) => [erpEvent, ...prev]);
      setMovementEvents((prev) => [movEvent, ...prev]);
      setNotifications((prev) => [notification, ...prev]);

      return { success: true };
    },
    [stones, currentUser]
  );

  // 7. Request Return (Salesperson)
  const requestReturn = useCallback(
    (stoneId: string, reason?: string) => {
      const stone = stones.find((s) => s.id === stoneId);
      if (!stone) return { success: false, error: 'Stone not found.' };

      if (stone.physicalStatus !== 'In Cabin') {
        return { success: false, error: `Cannot return stone: current physical status is '${stone.physicalStatus}'.` };
      }

      const timestamp = new Date().toISOString();
      const eventId = getNextEventId();

      const movEvent: MovementEvent = {
        id: eventId,
        stoneId,
        eventType: 'MEMO_RETURN_REQUESTED',
        fromLocation: stone.currentLocationId,
        toLocation: 'Stockroom Safe (Requested)',
        previousCustodianId: stone.activeCustodianId,
        newCustodianId: stone.activeCustodianId,
        actorId: currentUser.id,
        timestamp,
        result: 'SUCCESS',
        reason: reason || 'Viewing completed; salesperson requested return to safe',
        sequenceNumber: stone.version + 1,
        deviceChannel: 'WEB_DESKTOP',
      };

      const notification: Notification = {
        id: getNextNotificationId(),
        type: 'RETURN_REQUESTED',
        message: `Return requested for ${stoneId} from ${stone.currentLocationId}. Runner required for cabin pickup.`,
        relatedStoneId: stoneId,
        actorId: currentUser.id,
        timestamp,
        severity: 'warning',
        recipient: 'RUNNER',
        relevantAction: 'Collect Cassette from Cabin',
        actionTargetView: 'role-console',
        read: false,
      };

      setStones((prev) =>
        prev.map((s) =>
          s.id === stoneId
            ? { ...s, physicalStatus: 'Return Requested', lastEventId: eventId, version: s.version + 1, updatedAt: timestamp }
            : s
        )
      );

      setMovementEvents((prev) => [movEvent, ...prev]);
      setNotifications((prev) => [notification, ...prev]);

      return { success: true };
    },
    [stones, currentUser]
  );

  // 7B. Runner Collects Return (Runner)
  const runnerCollectReturn = useCallback(
    (stoneId: string, runnerId: string) => {
      const stone = stones.find((s) => s.id === stoneId);
      if (!stone) return { success: false, error: 'Stone not found.' };

      const runner = users.find((u) => u.id === runnerId) || currentUser;
      const timestamp = new Date().toISOString();
      const eventId = getNextEventId();

      // CORE RULE: A runner collecting a return does NOT mean the stone is back in the safe.
      // The stone remains in Return Transit until the inventory controller scans and confirms safe receipt.
      const movEvent: MovementEvent = {
        id: eventId,
        stoneId,
        eventType: 'RUNNER_PICKUP_RETURN',
        fromLocation: stone.currentLocationId,
        toLocation: `Return Transit with runner ${runner.name}`,
        previousCustodianId: stone.activeCustodianId,
        newCustodianId: runner.id,
        actorId: runner.id,
        timestamp,
        result: 'SUCCESS',
        reason: `Runner ${runner.name} collected return from cabin. Physical status: Return Transit. Safe receipt required to close custody.`,
        sequenceNumber: stone.version + 1,
        deviceChannel: 'RUNNER_MOBILE',
      };

      const notification: Notification = {
        id: getNextNotificationId(),
        type: 'RETURN_COLLECTED',
        message: `Runner ${runner.name} collected return ${stoneId}. Stone is in Return Transit. Safe custody remains pending stockroom scan.`,
        relatedStoneId: stoneId,
        actorId: runner.id,
        timestamp,
        severity: 'info',
        recipient: 'INVENTORY_CONTROLLER',
        relevantAction: 'Scan In Safe Room Intake',
        actionTargetView: 'role-console',
        read: false,
      };

      setStones((prev) =>
        prev.map((s) =>
          s.id === stoneId
            ? {
                ...s,
                physicalStatus: 'Return Transit',
                activeCustodianId: runner.id,
                currentLocationId: `Return Transit (${runner.name})`,
                lastEventId: eventId,
                version: s.version + 1,
                updatedAt: timestamp,
              }
            : s
        )
      );

      setMovementEvents((prev) => [movEvent, ...prev]);
      setNotifications((prev) => [notification, ...prev]);

      return { success: true };
    },
    [stones, users, currentUser]
  );

  // 7C. Stockroom Confirms Safe Receipt (Inventory Controller)
  const stockroomConfirmSafeReceipt = useCallback(
    (stoneId: string, compartmentId: string = 'Safe Compartment A-04') => {
      const stone = stones.find((s) => s.id === stoneId);
      if (!stone) return { success: false, error: 'Stone not found.' };

      const timestamp = new Date().toISOString();
      const eventId = getNextEventId();

      // CORE RULE: Custody only closes when inventory controller scans and confirms safe receipt.
      const movEvent: MovementEvent = {
        id: eventId,
        stoneId,
        eventType: 'SAFE_RECEIPT_CONFIRMED',
        fromLocation: stone.currentLocationId,
        toLocation: compartmentId,
        previousCustodianId: stone.activeCustodianId,
        newCustodianId: 'SYSTEM_VAULT',
        actorId: currentUser.id,
        timestamp,
        result: 'SUCCESS',
        reason: `Controller ${currentUser.name} scanned diamond cassette into ${compartmentId}. Return custody closed.`,
        sequenceNumber: stone.version + 1,
        deviceChannel: 'HANDHELD_SCANNER',
      };

      const notification: Notification = {
        id: getNextNotificationId(),
        type: 'SAFE_RECEIPT_CONFIRMED',
        message: `Return verified for ${stoneId}. Diamond secured in ${compartmentId}. Custody returned to Stockroom Safe.`,
        relatedStoneId: stoneId,
        actorId: currentUser.id,
        timestamp,
        severity: 'success',
        recipient: 'ALL',
        relevantAction: 'View Safe Inventory',
        actionTargetView: 'inventory',
        read: false,
      };

      setStones((prev) =>
        prev.map((s) =>
          s.id === stoneId
            ? {
                ...s,
                physicalStatus: 'In Safe after return',
                activeCustodianId: 'SYSTEM_VAULT',
                activeCabinId: undefined,
                currentLocationId: compartmentId,
                cabinPossessionStartedAt: undefined,
                lastEventId: eventId,
                version: s.version + 1,
                updatedAt: timestamp,
              }
            : s
        )
      );

      setMovementEvents((prev) => [movEvent, ...prev]);
      setNotifications((prev) => [notification, ...prev]);

      return { success: true };
    },
    [stones, currentUser]
  );

  // 8. ERP Synchronisation: Simulate Accepted / Failed / Retry
  const simulateERPResponse = useCallback(
    (eventId: string, outcome: 'ACCEPTED' | 'FAILED') => {
      const erpEvt = erpEvents.find((e) => e.id === eventId);
      if (!erpEvt) return;

      const timestamp = new Date().toISOString();

      if (outcome === 'ACCEPTED') {
        setErpEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  syncStatus: 'Accepted',
                  lastAttemptAt: timestamp,
                  errorMessage: undefined,
                }
              : e
          )
        );

        // Update corresponding stone commercial state if pending
        setStones((prev) =>
          prev.map((s) => {
            if (s.id === erpEvt.stoneId && s.commercialStatus === 'Sale Pending ERP') {
              return {
                ...s,
                commercialStatus: 'ERP Accepted',
                updatedAt: timestamp,
              };
            }
            return s;
          })
        );

        setCommercialTransactions((prev) =>
          prev.map((tx) =>
            tx.erpEventId === eventId || tx.stoneId === erpEvt.stoneId
              ? { ...tx, status: 'ERP_CONFIRMED' }
              : tx
          )
        );

        setNotifications((prev) => [
          {
            id: getNextNotificationId(),
            type: 'ERP_SYNC_POSTED',
            message: `ERP CONFIRMATION: Central SAP diamond ledger accepted event ${eventId} for stone ${erpEvt.stoneId}. Posted to official books.`,
            relatedStoneId: erpEvt.stoneId,
            actorId: 'ERP_SYSTEM',
            timestamp,
            severity: 'success',
            recipient: 'ALL',
            relevantAction: 'Inspect Settled Transaction',
            actionTargetView: 'commercial',
            read: false,
          },
          ...prev,
        ]);
      } else {
        // FAILED
        const excId = getNextExceptionId();

        setErpEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  syncStatus: 'Failed',
                  retryCount: e.retryCount + 1,
                  lastAttemptAt: timestamp,
                  errorMessage: 'HTTP 502 Bad Gateway: Central ERP enterprise service bus unreachable. Transaction retained in outbox.',
                }
              : e
          )
        );

        setStones((prev) =>
          prev.map((s) => {
            if (s.id === erpEvt.stoneId) {
              return {
                ...s,
                commercialStatus: 'Requires Review',
                updatedAt: timestamp,
              };
            }
            return s;
          })
        );

        const newException: ExceptionRecord = {
          id: excId,
          category: 'ERP_GATEWAY_TIMEOUT',
          title: `ERP Outbox Sync Failure for ${erpEvt.stoneId} (Event #${eventId})`,
          severity: 'HIGH',
          stoneId: erpEvt.stoneId,
          actorId: 'ERP_SYSTEM',
          timestamp,
          status: 'OPEN',
          ruleViolated: 'Rule 6: A floor transaction is not officially complete until ERP confirms acceptance.',
          systemAction: 'Transaction preserved in Outbox with sequence lock; retry available with idempotency key.',
          suggestedRemedy: 'Inspect ESB gateway connectivity and trigger idempotent sync retry.',
        };

        setExceptions((prev) => [newException, ...prev]);

        setNotifications((prev) => [
          {
            id: getNextNotificationId(),
            type: 'ERP_SYNC_FAILED',
            message: `ERP REJECTION/TIMEOUT: Event ${eventId} for stone ${erpEvt.stoneId} failed. Status: Requires Review. Manual retry available.`,
            relatedStoneId: erpEvt.stoneId,
            actorId: 'ERP_SYSTEM',
            timestamp,
            severity: 'error',
            recipient: 'ADMIN_SUPERVISOR',
            relevantAction: 'Open Outbox Queue & Retry',
            actionTargetView: 'erp',
            read: false,
          },
          ...prev,
        ]);
      }
    },
    [erpEvents]
  );

  // 8B. Retry ERP Sync (Idempotent)
  const retryERPSync = useCallback(
    (eventId: string) => {
      const erpEvt = erpEvents.find((e) => e.id === eventId);
      if (!erpEvt) return;

      const timestamp = new Date().toISOString();

      // Set to Pending first, increment retryCount
      setErpEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                syncStatus: 'Pending',
                retryCount: e.retryCount + 1,
                lastAttemptAt: timestamp,
                errorMessage: undefined,
              }
            : e
        )
      );

      // Simulate network roundtrip and resolve to Accepted
      setTimeout(() => {
        simulateERPResponse(eventId, 'ACCEPTED');
      }, 1200);
    },
    [erpEvents, simulateERPResponse]
  );

  // 9. Reconciliation Resolve
  const resolveReconciliationItem = useCallback((stoneId: string, notes: string) => {
    const timestamp = new Date().toISOString();
    setReconciliationItems((prev) =>
      prev.map((r) =>
        r.stoneId === stoneId
          ? {
              ...r,
              status: 'Resolved',
              notes: `${r.notes || ''} [RESOLVED: ${notes}]`,
              resolvedAt: timestamp,
            }
          : r
      )
    );

    setNotifications((prev) => [
      {
        id: getNextNotificationId(),
        type: 'RECONCILIATION_RESOLVED',
        message: `Closing reconciliation discrepancy resolved for ${stoneId}. Notes: ${notes}`,
        relatedStoneId: stoneId,
        actorId: currentUser.id,
        timestamp,
        severity: 'success',
        recipient: 'INVENTORY_CONTROLLER',
        relevantAction: 'View Reconciliation Audit',
        actionTargetView: 'reconciliation',
        read: false,
      },
      ...prev,
    ]);
  }, [currentUser]);

  // Exception Governance Lifecycle Handlers: Open -> Assigned -> Investigating -> Resolved -> Verified
  const assignException = useCallback(
    (id: string, ownerId: string) => {
      const owner = users.find((u) => u.id === ownerId);
      const timestamp = new Date().toISOString();
      const eventId = getNextEventId();

      setExceptions((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                status: 'ASSIGNED',
                assignedOwnerId: ownerId,
                assignedOwnerName: owner?.name || ownerId,
              }
            : e
        )
      );

      setMovementEvents((prev) => [
        {
          id: eventId,
          stoneId: prev.find((e) => e.id === id)?.stoneId || 'SYSTEM_EXCEPTION',
          eventType: 'EXCEPTION_ASSIGNED',
          fromLocation: 'Exception Center',
          toLocation: 'Investigation Desk',
          previousCustodianId: currentUser.id,
          newCustodianId: ownerId,
          actorId: currentUser.id,
          timestamp,
          result: 'SUCCESS',
          reason: `Exception ${id} formally assigned to ${owner?.name || ownerId} for resolution investigation.`,
          sequenceNumber: 101,
          deviceChannel: 'WEB_DESKTOP',
        },
        ...prev,
      ]);
    },
    [users, currentUser]
  );

  const startExceptionInvestigation = useCallback(
    (id: string, notes: string) => {
      const timestamp = new Date().toISOString();
      const eventId = getNextEventId();

      setExceptions((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                status: 'INVESTIGATING',
                investigationNotes: notes,
              }
            : e
        )
      );

      setMovementEvents((prev) => [
        {
          id: eventId,
          stoneId: prev.find((e) => e.id === id)?.stoneId || 'SYSTEM_EXCEPTION',
          eventType: 'EXCEPTION_INVESTIGATING',
          fromLocation: 'Investigation Desk',
          toLocation: 'Active Audit In-Progress',
          previousCustodianId: currentUser.id,
          newCustodianId: currentUser.id,
          actorId: currentUser.id,
          timestamp,
          result: 'SUCCESS',
          reason: `Investigation opened for Exception ${id}. Audit notes recorded.`,
          sequenceNumber: 102,
          deviceChannel: 'WEB_DESKTOP',
        },
        ...prev,
      ]);
    },
    [currentUser]
  );

  const resolveException = useCallback(
    (id: string, notes: string, evidence: string) => {
      const timestamp = new Date().toISOString();
      const eventId = getNextEventId();

      setExceptions((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                status: 'RESOLVED',
                investigationNotes: `${e.investigationNotes ? e.investigationNotes + ' | ' : ''}${notes}`,
                resolutionEvidence: evidence,
                resolvedAt: timestamp,
              }
            : e
        )
      );

      setMovementEvents((prev) => [
        {
          id: eventId,
          stoneId: prev.find((e) => e.id === id)?.stoneId || 'SYSTEM_EXCEPTION',
          eventType: 'EXCEPTION_RESOLVED',
          fromLocation: 'Active Audit In-Progress',
          toLocation: 'Resolved Tray (Pending Supervisor Verification)',
          previousCustodianId: currentUser.id,
          newCustodianId: currentUser.id,
          actorId: currentUser.id,
          timestamp,
          result: 'SUCCESS',
          reason: `Exception ${id} resolved with documented evidence: ${evidence}. Awaiting final verification.`,
          sequenceNumber: 103,
          deviceChannel: 'WEB_DESKTOP',
        },
        ...prev,
      ]);

      setNotifications((prev) => [
        {
          id: getNextNotificationId(),
          type: 'EXCEPTION_RESOLVED',
          message: `Exception ${id} resolved by ${currentUser.name}. Documented evidence submitted. Supervisor verification required.`,
          actorId: currentUser.id,
          timestamp,
          severity: 'info',
          recipient: 'ADMIN_SUPERVISOR',
          relevantAction: 'Verify Resolution',
          actionTargetView: 'exceptions',
          read: false,
        },
        ...prev,
      ]);
    },
    [currentUser]
  );

  const verifyException = useCallback(
    (id: string, verifierId: string) => {
      const verifier = users.find((u) => u.id === verifierId);
      const timestamp = new Date().toISOString();
      const eventId = getNextEventId();

      setExceptions((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                status: 'VERIFIED',
                verifiedBy: verifier?.name || verifierId,
                verifiedAt: timestamp,
              }
            : e
        )
      );

      setMovementEvents((prev) => [
        {
          id: eventId,
          stoneId: prev.find((e) => e.id === id)?.stoneId || 'SYSTEM_EXCEPTION',
          eventType: 'EXCEPTION_VERIFIED',
          fromLocation: 'Resolved Tray',
          toLocation: 'Audit Archive',
          previousCustodianId: verifierId,
          newCustodianId: verifierId,
          actorId: verifierId,
          timestamp,
          result: 'SUCCESS',
          reason: `Exception ${id} verified and closed by supervisor ${verifier?.name || verifierId}. Full audit compliance confirmed.`,
          sequenceNumber: 104,
          deviceChannel: 'WEB_DESKTOP',
        },
        ...prev,
      ]);
    },
    [users]
  );

  // Walkthrough Controls
  const startWalkthrough = useCallback(() => {
    setIsWalkthroughActive(true);
    setWalkthroughStep(0);
  }, []);

  const nextWalkthroughStep = useCallback(() => {
    setWalkthroughStep((prev) => Math.min(prev + 1, 8));
  }, []);

  const prevWalkthroughStep = useCallback(() => {
    setWalkthroughStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const jumpToWalkthroughStep = useCallback((step: number) => {
    setWalkthroughStep(Math.max(0, Math.min(step, 8)));
  }, []);

  const toggleWalkthroughAutoPlay = useCallback(() => {
    setWalkthroughAutoPlaying((prev) => !prev);
  }, []);

  const stopWalkthrough = useCallback(() => {
    setIsWalkthroughActive(false);
    setWalkthroughAutoPlaying(false);
  }, []);

  // Presentation Mode Controls
  const startPresentation = useCallback(() => {
    setPresentationModeActive(true);
    setPresentationSlide(0);
  }, []);

  const exitPresentation = useCallback(() => {
    setPresentationModeActive(false);
  }, []);

  const nextPresentationSlide = useCallback(() => {
    setPresentationSlide((prev) => Math.min(prev + 1, 9));
  }, []);

  const prevPresentationSlide = useCallback(() => {
    setPresentationSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const jumpToPresentationSlide = useCallback((slide: number) => {
    setPresentationSlide(Math.max(0, Math.min(slide, 9)));
  }, []);

  // Auto-play timer for Walkthrough
  useEffect(() => {
    if (!walkthroughAutoPlaying || !isWalkthroughActive) return;

    const timer = setInterval(() => {
      setWalkthroughStep((prev) => {
        if (prev >= 8) {
          setWalkthroughAutoPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [walkthroughAutoPlaying, isWalkthroughActive]);

  return (
    <OperationsContext.Provider
      value={{
        stones,
        users,
        cabins,
        currentUser,
        requests,
        movementEvents,
        commercialTransactions,
        erpEvents,
        notifications,
        reconciliationItems,
        exceptions,
        selectedStoneId,
        isDetailDrawerOpen,
        isNotificationDrawerOpen,
        metrics,
        isWalkthroughActive,
        walkthroughStep,
        walkthroughAutoPlaying,
        presentationModeActive,
        presentationSlide,
        setCurrentUser,
        switchRole,
        activeView,
        setActiveView,
        openStoneDetail,
        closeStoneDetail,
        toggleNotificationDrawer,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetDemoData,
        submitStoneRequest,
        simulateBarcodeScan,
        dispatchRunner,
        runnerAcceptPickup,
        runnerDeliverToCabin,
        salespersonConfirmReceipt,
        createHold,
        releaseHold,
        createMemo,
        initiateSale,
        requestReturn,
        runnerCollectReturn,
        stockroomConfirmSafeReceipt,
        simulateERPResponse,
        retryERPSync,
        resolveReconciliationItem,
        assignException,
        startExceptionInvestigation,
        resolveException,
        verifyException,
        startWalkthrough,
        nextWalkthroughStep,
        prevWalkthroughStep,
        jumpToWalkthroughStep,
        toggleWalkthroughAutoPlay,
        stopWalkthrough,
        startPresentation,
        exitPresentation,
        nextPresentationSlide,
        prevPresentationSlide,
        jumpToPresentationSlide,
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
};

export function useOperations(): OperationsContextType {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
}
