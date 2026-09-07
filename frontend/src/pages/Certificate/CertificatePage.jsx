import { Printer } from "lucide-react";
import Logo from "../../components/Logo.jsx";

export default function CertificatePage() {
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center no-print bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">School Leaving Certificate</h1>
          <p className="text-sm text-gray-500">Fill the form and print the official certificate.</p>
        </div>
        <button onClick={() => window.print()} className="btn btn-primary">
          <Printer size={18} /> Print / Save PDF
        </button>
      </div>

      <div className="print-area bg-[#fbfbf8] w-full max-w-[800px] mx-auto min-h-[1050px] shadow-2xl relative overflow-hidden" style={{ padding: "24px" }}>
        {/* Borders */}
        <div className="absolute inset-0 border-[16px] border-[#0a2351] m-0" />
        <div className="absolute inset-0 border-[2px] border-[#c99837] m-[20px]" />
        
        {/* Decorative Corner Ornaments (optional approximation) */}
        <div className="absolute top-[20px] left-[20px] w-8 h-8 border-t-[4px] border-l-[4px] border-[#0a2351]" />
        <div className="absolute top-[20px] right-[20px] w-8 h-8 border-t-[4px] border-r-[4px] border-[#0a2351]" />
        <div className="absolute bottom-[20px] left-[20px] w-8 h-8 border-b-[4px] border-l-[4px] border-[#0a2351]" />
        <div className="absolute bottom-[20px] right-[20px] w-8 h-8 border-b-[4px] border-r-[4px] border-[#0a2351]" />

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Logo size={450} />
        </div>

        {/* Content Container */}
        <div className="relative z-10 px-10 py-12 flex flex-col h-full">
          
          {/* Header */}
          <div className="text-center space-y-4 mb-6">
            <h1 className="text-[2.6rem] font-serif font-bold text-[#0a2351] tracking-wide uppercase mt-4" style={{ fontFamily: "Times New Roman, serif", textShadow: "1px 1px 0px rgba(0,0,0,0.1)" }}>
              Al Maarif Education System
            </h1>
            <div className="flex justify-center my-4">
              <Logo size={120} dark={false} />
            </div>
          </div>

          {/* Address Ribbon */}
          <div className="relative bg-[#0a2351] text-white text-center py-2.5 border-y-[3px] border-[#c99837] uppercase font-bold text-xs tracking-widest shadow-md">
            Khwar Ghara, Nasir Abad (512), Near Palosi Ring Road Peshawar<br/>
            Contact Number : 0313/9163732
            <div className="absolute -left-[16px] top-0 bottom-0 w-4 bg-[#c99837] rotate-[-45deg] origin-right transform -translate-x-full scale-0" /> {/* Just placeholder for ribbon edges if wanted */}
          </div>

          {/* Certificate Title */}
          <div className="flex justify-center my-8">
            <h2 className="bg-[#0a2351] text-white border-[4px] border-[#c99837] rounded-full px-12 py-2 text-[1.75rem] font-serif font-bold uppercase shadow-lg tracking-wider relative">
              School Leaving Certificate
              <span className="absolute top-1/2 -left-6 w-4 h-4 bg-[#c99837] rotate-45 transform -translate-y-1/2"></span>
              <span className="absolute top-1/2 -right-6 w-4 h-4 bg-[#c99837] rotate-45 transform -translate-y-1/2"></span>
            </h2>
          </div>

          {/* Form Details */}
          <div className="space-y-5 text-[#0a2351] font-bold text-lg px-2 flex-1" style={{ fontFamily: "Times New Roman, serif" }}>
            <div className="flex items-end gap-2">
              <span className="whitespace-nowrap">Serial No.:</span>
              <input type="text" className="flex-1 bg-transparent border-b border-[#0a2351] outline-none text-center font-bold pb-0.5" />
            </div>
            
            <div className="flex items-end gap-2">
              <span className="whitespace-nowrap">Name:</span>
              <input type="text" className="flex-1 bg-transparent border-b border-[#0a2351] outline-none text-center font-bold pb-0.5" />
            </div>

            <div className="flex items-end gap-2">
              <span className="whitespace-nowrap">Father's Name:</span>
              <input type="text" className="flex-1 bg-transparent border-b border-[#0a2351] outline-none text-center font-bold pb-0.5" />
            </div>

            <div className="grid grid-cols-[1fr_1.2fr] gap-6">
              <div className="flex items-end gap-2">
                <span className="whitespace-nowrap">Date of Birth:</span>
                <input type="text" className="flex-1 bg-transparent border-b border-[#0a2351] outline-none text-center font-bold pb-0.5" />
              </div>
              <div className="flex items-end gap-2">
                <span className="whitespace-nowrap">In words:</span>
                <input type="text" className="flex-1 bg-transparent border-b border-[#0a2351] outline-none text-center font-bold pb-0.5" />
              </div>
            </div>

            <div className="grid grid-cols-[1.5fr_1fr] gap-6">
              <div className="flex items-end gap-2">
                <span className="whitespace-nowrap">Date of Leaving:</span>
                <input type="text" className="flex-1 bg-transparent border-b border-[#0a2351] outline-none text-center font-bold pb-0.5" />
              </div>
              <div className="flex items-end gap-2">
                <span className="whitespace-nowrap">Class:</span>
                <input type="text" className="flex-1 bg-transparent border-b border-[#0a2351] outline-none text-center font-bold pb-0.5" />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <span className="whitespace-nowrap">Dues Paid up to:</span>
              <input type="text" className="flex-1 bg-transparent border-b border-[#0a2351] outline-none text-center font-bold pb-0.5" />
            </div>

            <div className="flex items-end gap-2">
              <span className="whitespace-nowrap">Conduct:</span>
              <input type="text" className="flex-1 bg-transparent border-b border-[#0a2351] outline-none text-center font-bold pb-0.5" />
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <span>Orphan :</span>
                <input type="text" placeholder="Yes / No" className="w-24 bg-transparent outline-none text-center font-bold placeholder:text-[#0a2351]/40" />
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>Afghan Citizen :</span>
                <input type="text" placeholder="Yes / No" className="w-24 bg-transparent outline-none text-center font-bold placeholder:text-[#0a2351]/40" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-8 px-2" style={{ fontFamily: "Times New Roman, serif" }}>
            <table className="w-full border-collapse border-[3px] border-[#0a2351] text-center rounded-lg table-fixed">
              <thead>
                <tr className="border-b-[3px] border-[#0a2351]">
                  <th className="border-r-[3px] border-[#0a2351] py-3 text-[#0a2351] font-bold">Admission<br/>Number</th>
                  <th className="border-r-[3px] border-[#0a2351] py-3 text-[#0a2351] font-bold">Date of<br/>Admission</th>
                  <th className="border-r-[3px] border-[#0a2351] py-3 text-[#0a2351] font-bold uppercase">REASON OF<br/>LEAVING</th>
                  <th className="border-r-[3px] border-[#0a2351] py-3 text-[#0a2351] font-bold uppercase">PASS/FAILED</th>
                  <th className="py-3 text-[#0a2351] font-bold uppercase">REMARKS</th>
                </tr>
              </thead>
              <tbody>
                <tr className="h-28 align-top">
                  <td className="border-r-[3px] border-[#0a2351] p-2"><textarea className="w-full h-full bg-transparent outline-none resize-none text-center font-bold" /></td>
                  <td className="border-r-[3px] border-[#0a2351] p-2"><textarea className="w-full h-full bg-transparent outline-none resize-none text-center font-bold" /></td>
                  <td className="border-r-[3px] border-[#0a2351] p-2"><textarea className="w-full h-full bg-transparent outline-none resize-none text-center font-bold" /></td>
                  <td className="border-r-[3px] border-[#0a2351] p-2"><textarea className="w-full h-full bg-transparent outline-none resize-none text-center font-bold" /></td>
                  <td className="p-2"><textarea className="w-full h-full bg-transparent outline-none resize-none text-center font-bold" /></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Signatures */}
          <div className="mt-auto pt-16 pb-4 px-2 flex justify-between items-end text-[#0a2351] font-bold text-lg" style={{ fontFamily: "Times New Roman, serif" }}>
            <div className="space-y-8">
              <div className="flex items-end gap-2 w-72">
                <span>Date of Issue:</span>
                <input type="text" className="flex-1 bg-transparent border-b border-[#0a2351] outline-none text-center font-bold pb-0.5" />
              </div>
              <div className="flex items-end gap-2 w-72">
                <span>Prepared By:</span>
                <input type="text" className="flex-1 bg-transparent border-b border-[#0a2351] outline-none text-center font-bold pb-0.5" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-64 border-b-2 border-[#0a2351] mb-2" />
              <span className="text-2xl uppercase tracking-widest font-serif font-bold text-[#0a2351]">DIRECTOR</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
