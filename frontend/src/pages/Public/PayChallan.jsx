import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function PayChallan() {
  const { id } = useParams();
  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const fetchChallan = async () => {
    try {
      // Using direct fetch/axios to the public endpoint
      // Adjust according to how your 'api' instance handles public vs private
      const { data } = await api.get(`/public/fees/${id}`);
      setChallan(data);
    } catch (err) {
      setError("Challan not found or invalid link.");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    try {
      setPaying(true);
      const { data } = await api.post(`/public/fees/${id}/create-checkout-session`);
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      }
    } catch (err) {
      alert("Failed to initiate payment. " + (err.response?.data?.message || err.message));
      setPaying(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Challan Details...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-md w-full">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h2 className="text-2xl font-bold">Al-Maarif Education</h2>
          <p className="text-blue-100 mt-1">Fee Challan Payment</p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Student Name</p>
              <p className="font-semibold text-gray-800">{challan.student?.name} (Class: {challan.student?.class})</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Father Name</p>
              <p className="font-semibold text-gray-800">{challan.student?.fatherName}</p>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Billing Month</p>
                <p className="font-semibold text-gray-800">{challan.billingMonth}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-semibold text-gray-800">{new Date(challan.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="border-t border-b py-4 my-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold">Rs. {challan.totalAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Remaining Amount</span>
                <span className="font-bold text-red-600 text-xl">Rs. {challan.remainingAmount}</span>
              </div>
            </div>

            {challan.remainingAmount <= 0 || challan.paymentStatus === "Paid" ? (
              <div className="bg-green-100 text-green-700 p-4 rounded-lg text-center font-bold">
                This challan has been fully paid. Thank you!
              </div>
            ) : (
              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md flex justify-center items-center"
              >
                {paying ? "Redirecting securely..." : `Pay Rs. ${challan.remainingAmount} via Card`}
              </button>
            )}
            
            <p className="text-xs text-center text-gray-400 mt-4">
              Payments are securely processed by Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
