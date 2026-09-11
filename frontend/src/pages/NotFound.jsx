import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-5xl font-bold text-primary-700 mb-2">404</h1>
      <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-6">Page not found</p>
      <Link to="/" className="btn-primary">Go to Dashboard</Link>
    </div>
  );
}
