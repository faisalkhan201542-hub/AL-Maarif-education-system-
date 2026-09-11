import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { useSettings } from "../../context/SettingsContext.jsx";
import PageHeader from "../../components/PageHeader.jsx";
export default function SchoolLocation() {
  const { settings } = useSettings();
  const hasMapLink = !!settings?.googleMapsLink;
  const query = encodeURIComponent(`${settings?.schoolName}, ${settings?.address}`);
  const searchLink = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const directionsLink = hasMapLink ? settings.googleMapsLink : `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  const embedSrc = `https://www.google.com/maps?q=${query}&output=embed`;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <PageHeader 
        title="School Location"
        subtitle={settings?.schoolName}
        className="from-blue-600 via-indigo-600 to-purple-600"
      />

      <div className="card">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0"><MapPin size={20}/></div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{settings?.schoolName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">{settings?.address}</p>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border h-72 mb-4">
          <iframe
            title="School Location"
            src={hasMapLink ? undefined : embedSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
          />
        </div>
        {!hasMapLink && (
          <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-4">
            The map above is estimated from the school address. For an exact pin, the Principal can set a precise Google Maps link in School Settings.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <a href={searchLink} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            <ExternalLink size={16}/> View on Map
          </a>
          <a href={directionsLink} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <Navigation size={16}/> Get Directions
          </a>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Contact</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Principal: {settings?.principalName}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">WhatsApp: {settings?.principalWhatsapp}</p>
      </div>
    </div>
  );
}
