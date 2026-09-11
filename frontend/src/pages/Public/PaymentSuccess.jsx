import { Link } from "react-router-dom";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Thank you! Your fee has been received and automatically verified in the school's system.
        </p>
        <p className="text-sm text-gray-500 mb-6">You can now close this window.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Return to School Home
        </Link>
      </div>
    </div>
  );
}
