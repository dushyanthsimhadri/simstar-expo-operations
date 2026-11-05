import React from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Smartphone,
  Navigation,
  RotateCcw,
  PackageCheck,
  Eye,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const RunnerConsoleView: React.FC = () => {
  const {
    stones,
    requests,
    users,
    currentUser,
    runnerAcceptPickup,
    runnerDeliverToCabin,
    runnerCollectReturn,
    openStoneDetail,
  } = useOperations();

  const runnerUser = currentUser.role === 'RUNNER' ? currentUser : users.find((u) => u.id === 'usr_runner_arjun') || users[8];

  // Pickups ready at safe gate
  const readyPickups = requests.filter(
    (r) => (r.assignedRunnerId === runnerUser.id || !r.assignedRunnerId) && r.status === 'Dispatched'
  );

  // Active deliveries en route to cabin (pickup accepted)
  const activeDeliveries = requests.filter(
    (r) => (r.assignedRunnerId === runnerUser.id || !r.assignedRunnerId) && (r.status === 'PickupAccepted' || r.status === 'Delivered')
  );

  // Active returns needing collection or in transit
  const returnStones = stones.filter(
    (s) => s.physicalStatus === 'Return Requested' || (s.physicalStatus === 'Return Transit' && s.activeCustodianId === runnerUser.id)
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Mobile-styled Header */}
      <div className="bg-navy-950 text-white rounded-2xl p-5 shadow-xl border border-navy-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">Runner Courier Console</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Online · Secure Handheld
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Operating as: <strong className="text-white">{runnerUser.name}</strong> ({runnerUser.title})
              </p>
            </div>
          </div>
          <span className="font-mono text-xs text-slate-400">Hall 2 Transit Floor</span>
        </div>
      </div>

      {/* Custody Rule Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start space-x-2.5">
        <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong>Mandatory Custody Rule:</strong> Physical custody only shifts when you click <em>Accept Pickup</em> at the Safe Room. When collecting a return from a cabin, the stone remains in <strong>Return Transit</strong> until the Stock Controller laser-scans the cassette into the vault.
        </p>
      </div>

      {/* Section 1: Ready for Safe Room Pickup (P0 Explicit Custody Transition) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <PackageCheck className="w-4 h-4 text-brand-600" />
            <span className="font-bold text-slate-900 uppercase tracking-wider">
              1. Awaiting Pickup at Safe Room ({readyPickups.length})
            </span>
          </div>
          <span className="text-slate-500 font-medium">Safe Gate Intake</span>
        </div>

        <div className="divide-y divide-slate-100 p-2">
          {readyPickups.length === 0 ? (
            <div className="p-5 text-center text-xs text-slate-500">
              No new dispatches waiting for pickup at the safe gate.
            </div>
          ) : (
            readyPickups.map((req) => {
              const stone = stones.find((s) => s.id === req.stoneId);

              return (
                <div key={req.id} className="p-4 rounded-xl bg-brand-50/40 border border-brand-200 mb-2 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openStoneDetail(req.stoneId)}
                          className="font-mono font-bold text-brand-700 hover:underline text-base"
                        >
                          {req.stoneId}
                        </button>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                          {req.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5">
                        Destination: <strong className="text-slate-900">{req.cabinId}</strong> · Staged by Stockroom
                      </p>
                      {stone && (
                        <p className="text-[11px] text-slate-600">
                          {stone.carat}ct {stone.shape} ({stone.colour}/{stone.clarity})
                        </p>
                      )}
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Staged at Safe Gate
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 font-mono font-medium">
                      Staged: {formatDateTime(req.updatedAt).split(',')[1]}
                    </span>

                    <button
                      onClick={() => runnerAcceptPickup(req.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center space-x-1.5 shadow-md shadow-brand-600/30 active:scale-95 transition"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Accept Physical Pickup & Take Custody</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Section 2: Active Deliveries in Transit to Cabin */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-brand-600" />
            <span className="font-bold text-slate-900 uppercase tracking-wider">
              2. Deliveries En Route to Cabins ({activeDeliveries.length})
            </span>
          </div>
          <span className="text-slate-500 font-medium">Floor Transit</span>
        </div>

        <div className="divide-y divide-slate-100 p-2">
          {activeDeliveries.length === 0 ? (
            <div className="p-5 text-center text-xs text-slate-500">
              No active delivery courier tasks in transit.
            </div>
          ) : (
            activeDeliveries.map((del) => {
              const stone = stones.find((s) => s.id === del.stoneId);
              const isDelivered = del.status === 'Delivered';

              return (
                <div key={del.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 mb-2 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openStoneDetail(del.stoneId)}
                          className="font-mono font-bold text-slate-900 hover:underline text-base"
                        >
                          {del.stoneId}
                        </button>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {del.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5">
                        {stone ? `${stone.carat}ct ${stone.shape} (${stone.colour}/${stone.clarity})` : 'Diamond Cassette'}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      isDelivered
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-brand-100 text-brand-800 border border-brand-200'
                    }`}>
                      {isDelivered ? 'Awaiting Sales Receipt' : 'In Courier Transit'}
                    </span>
                  </div>

                  {/* Route Visualizer */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between text-slate-700">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-medium text-slate-800">Stockroom Safe</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <div className="flex items-center space-x-1.5 font-bold text-brand-700">
                      <Navigation className="w-3.5 h-3.5 text-brand-600" />
                      <span>{del.cabinId}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 font-mono font-medium">
                      Assigned: {formatDateTime(del.updatedAt).split(',')[1]}
                    </span>

                    {!isDelivered ? (
                      <button
                        onClick={() => runnerDeliverToCabin(del.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center space-x-1.5 shadow-md shadow-brand-600/30 active:scale-95 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Delivery Handover at {del.cabinId}</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Handover awaiting salesperson confirmation</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Section 3: Cabin Returns (Cabin -> Stockroom Safe) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4 text-orange-600" />
            <span className="font-bold text-slate-900 uppercase tracking-wider">
              3. Cabin Return Collections ({returnStones.length})
            </span>
          </div>
          <span className="text-slate-500 font-medium">Return to Vault</span>
        </div>

        <div className="divide-y divide-slate-100 p-2">
          {returnStones.length === 0 ? (
            <div className="p-5 text-center text-xs text-slate-500">
              No pending returns requested from sales cabins.
            </div>
          ) : (
            returnStones.map((st) => {
              const inTransit = st.physicalStatus === 'Return Transit';

              return (
                <div key={st.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 mb-2 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <button
                        onClick={() => openStoneDetail(st.id)}
                        className="font-mono font-bold text-slate-900 hover:underline text-base"
                      >
                        {st.id}
                      </button>
                      <p className="text-xs text-slate-700">
                        {st.carat}ct {st.shape} · Current Location: <strong className="text-slate-900">{st.currentLocationId}</strong>
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      inTransit ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {st.physicalStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-600 font-medium">
                      {inTransit ? 'In your transit custody' : 'Pickup requested by salesperson'}
                    </span>

                    {!inTransit ? (
                      <button
                        onClick={() => runnerCollectReturn(st.id, runnerUser.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white flex items-center space-x-1.5 shadow-md shadow-orange-600/30 active:scale-95 transition"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Collect Cassette from Cabin</span>
                      </button>
                    ) : (
                      <div className="text-xs text-slate-600 italic">
                        Take to Stockroom Safe Gate for laser intake scan
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
