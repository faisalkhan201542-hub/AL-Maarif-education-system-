import { Link, useSearchParams } from "react-router-dom";

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const challanId = searchParams.get("challan_id");

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h2>
        <p className="text-gray-600 mb-6">
          Your payment was not completed. No charges were made.
        </p>
        
        {challanId && (
          <Link 
            to={`/pay/${challanId}`}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-3"
          >
            Try Again
          </Link>
        )}
        
        <Link to="/" className="text-gray-500 hover:underline text-sm">
          Return to School Home
        </Link>
      </div>
    </div>
  );
}
