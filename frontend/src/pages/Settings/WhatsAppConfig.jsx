import { useState, useEffect } from 'react';
import { QrCode, PowerOff, Smartphone, Loader as LoaderIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';

export default function WhatsAppConfig() {
  const [status, setStatus] = useState('LOADING'); // LOADING, DISCONNECTED, AWAITING_QR, CONNECTED
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/api/whatsapp/status');
      setStatus(res.data.status);
      setQrCode(res.data.qrCode);
    } catch (error) {
      console.error(error);
      setStatus('ERROR');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 3 seconds if awaiting QR or disconnected
    const interval = setInterval(() => {
      if (status !== 'CONNECTED') {
        fetchStatus();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [status]);

  const startService = async () => {
    setLoading(true);
    try {
      await api.post('/api/whatsapp/start');
      toast.success("Starting WhatsApp service...");
      fetchStatus();
    } catch (err) {
      toast.error("Failed to start WhatsApp service");
      setLoading(false);
    }
  };

  const logoutService = async () => {
    setLoading(true);
    try {
      await api.post('/api/whatsapp/logout');
      toast.success("Logged out successfully");
      setStatus('DISCONNECTED');
      setQrCode(null);
    } catch (err) {
      toast.error("Failed to logout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t pt-4 mt-6">
      <h2 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
        <Smartphone size={18} className="text-green-500" />
        Automated WhatsApp Bot
      </h2>
      
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium">Service Status</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {loading ? "Checking..." : status === 'CONNECTED' ? "Active & Listening" : status === 'AWAITING_QR' ? "Waiting for Scan" : "Disconnected"}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'CONNECTED' ? 'bg-green-400' : status === 'AWAITING_QR' ? 'bg-amber-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'CONNECTED' ? 'bg-green-500' : status === 'AWAITING_QR' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-sm font-medium hidden sm:inline-block">
              {status}
            </span>
          </div>
        </div>

        {status === 'CONNECTED' ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-green-50 dark:bg-green-500/10 p-4 rounded-lg border border-green-100 dark:border-green-500/20">
            <p className="text-sm text-green-700 dark:text-green-400">
              The automated WhatsApp bot is connected! It will silently process background bulk messages and auto-reply to parents texting "FEE [Registration No]".
            </p>
            <button type="button" onClick={logoutService} className="btn-danger whitespace-nowrap text-xs px-3 py-1.5">
              <PowerOff size={14} /> Disconnect
            </button>
          </div>
        ) : status === 'AWAITING_QR' && qrCode ? (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="bg-white p-2 rounded-xl shadow-sm mb-3">
              <img src={qrCode} alt="WhatsApp QR Code" className="w-48 h-48" />
            </div>
            <p className="text-sm text-center text-slate-600 dark:text-slate-400 max-w-xs">
              Open WhatsApp on the school's phone, tap <strong>Linked Devices</strong>, and scan this QR code to activate the bot.
            </p>
            <button type="button" onClick={logoutService} className="mt-4 text-xs text-red-500 hover:underline">
              Cancel & Turn Off
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              The WhatsApp bot is currently turned off. Turn it on to scan a QR code and enable automated messaging.
            </p>
            <button type="button" onClick={startService} disabled={loading} className="btn-primary whitespace-nowrap text-xs px-4 py-2">
              {loading ? <LoaderIcon className="animate-spin" size={14}/> : <QrCode size={14} />} Turn On
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
