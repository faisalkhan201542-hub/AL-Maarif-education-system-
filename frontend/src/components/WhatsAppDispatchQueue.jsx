import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { buildWhatsappLink } from "../utils/whatsapp.js";

/**
 * WhatsAppDispatchQueue
 * 
 * Takes an array of objects: { name, phone, message, ...meta }
 * Displays a modal where the user can click "Send to [Name]" sequentially (Manual Mode)
 * OR if the Automated Bot is connected, allows "Send All Automatically".
 */
const WhatsAppDispatchQueue = ({ open, onClose, items, title = "WhatsApp Dispatch Queue" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [botStatus, setBotStatus] = useState("DISCONNECTED");
  const [isAutoSending, setIsAutoSending] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setSentCount(0);
      setFailedCount(0);
      checkBotStatus();
    }
  }, [open, items]);

  const checkBotStatus = async () => {
    try {
      const { data } = await api.get('/api/whatsapp/status');
      setBotStatus(data.status);
    } catch (err) {
      setBotStatus("DISCONNECTED");
    }
  };

  if (!open) return null;

  // --- MANUAL MODE ---
  const handleManualSend = () => {
    const current = items[currentIndex];
    const link = buildWhatsappLink(current.phone, current.message);
    
    if (link) {
      window.open(link, "_blank");
      setSentCount(prev => prev + 1);
    } else {
      setFailedCount(prev => prev + 1);
    }

    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(items.length); // Completed
    }
  };

  const handleSkip = () => {
    setFailedCount(prev => prev + 1);
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(items.length);
    }
  };

  // --- AUTOMATED MODE ---
  const handleAutoSendAll = async () => {
    setIsAutoSending(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < items.length; i++) {
      setCurrentIndex(i); // Update UI to show progress
      const current = items[i];
      if (!current.phone) {
        failCount++;
        continue;
      }
      try {
        await api.post('/api/whatsapp/send', { phone: current.phone, message: current.message });
        successCount++;
        setSentCount(successCount);
      } catch (err) {
        failCount++;
        setFailedCount(failCount);
      }
      // Small delay to prevent rate-limiting/spam flags
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setCurrentIndex(items.length); // Completed
    setIsAutoSending(false);
    toast.success("Automated dispatch completed!");
  };

  const isFinished = currentIndex >= items.length;
  const currentItem = isFinished ? null : items[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        <div className="bg-brand-500 p-4 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-brand-100 text-sm">{items.length} total messages to send</p>
          </div>
          <button onClick={!isAutoSending ? onClose : undefined} className="text-white hover:text-brand-200 disabled:opacity-50" disabled={isAutoSending}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6">
          {!isFinished ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Sending {currentIndex + 1} of {items.length}
                </span>
                <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {sentCount} Sent
                </span>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Recipient: {currentItem.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Phone: {currentItem.phone || "No phone number"}</p>
                <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {currentItem.message}
                </div>
              </div>

              {botStatus === 'CONNECTED' ? (
                <div className="flex flex-col gap-3">
                  <div className="bg-green-50 dark:bg-green-500/10 p-3 rounded text-sm text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 mb-2">
                    ✅ Automated Bot is connected! You can send all messages in the background.
                  </div>
                  <button
                    onClick={handleAutoSendAll}
                    disabled={isAutoSending}
                    className="px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors font-medium flex justify-center items-center gap-2 disabled:opacity-50 w-full"
                  >
                    {isAutoSending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending Automatically...
                      </>
                    ) : (
                      "Send All Automatically"
                    )}
                  </button>
                  <button
                    onClick={handleManualSend}
                    disabled={!currentItem.phone || isAutoSending}
                    className="text-slate-500 text-sm hover:underline"
                  >
                    Send manually instead (One-by-One)
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium flex-1"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleManualSend}
                    disabled={!currentItem.phone}
                    className="px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg transition-colors font-medium flex-[2] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    {currentItem.phone ? "Send & Next" : "No Phone"}
                  </button>
                </div>
              )}
              {botStatus !== 'CONNECTED' && (
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
                  Automated Bot is not connected. You are in manual mode.<br/>
                  Clicking "Send & Next" will open WhatsApp Web.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Queue Completed!</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Successfully processed {items.length} messages.<br/>
                ({sentCount} sent, {failedCount} skipped/failed).
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors font-medium"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppDispatchQueue;
