import Link from "next/link";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">You&apos;re Currently Offline</h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          FIXIA GymOS requires an active network connection to synchronize member records, verify dynamic attendance QR tokens, and process financial ledgers.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
            Check Connection & Retry
          </Link>
        </div>
      </div>
    </div>
  );
}
