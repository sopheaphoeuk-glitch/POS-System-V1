
import React from 'react';
import { Transaction, BusinessInfo, TransactionType } from '../types';
import { X, Printer, FileText, Copy, Check } from 'lucide-react';

interface InvoiceProps {
  transactions: Transaction | Transaction[];
  onClose: () => void;
  businessInfo: BusinessInfo;
}

const Invoice: React.FC<InvoiceProps> = ({ transactions, onClose, businessInfo }) => {
  const [copied, setCopied] = React.useState(false);
  
  const handlePrint = () => {
    window.print();
  };

  const transactionList = Array.isArray(transactions) ? transactions : [transactions];
  const activeTx = transactionList[0];

  const copyToClipboard = (transaction: Transaction) => {
    const itemsText = transaction.items.map(item => 
      `${item.productName}: ${item.quantity} x $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`
    ).join('\n');

    const fullText = `
📄 ${businessInfo.name} - INVOICE #${transaction.id}
----------------------------------
📅 Date: ${new Date(transaction.date).toLocaleDateString('km-KH')}
👤 Customer: ${transaction.customerOrSupplierName}
----------------------------------
${itemsText}
----------------------------------
💰 TOTAL: $${transaction.totalAmount.toFixed(2)}
🙏 Thank you for your business!
    `.trim();

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-0 no-print overflow-hidden animate-in fade-in duration-500">
      <div className="bg-slate-100 w-full h-full lg:h-[98vh] lg:max-w-[1400px] lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modern Control Bar - Hidden during print via 'no-print' */}
        <div className="px-8 py-5 bg-white border-b border-slate-200 flex items-center justify-between z-30 shrink-0 no-print">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Preview Invoice</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Management System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
              onClick={() => copyToClipboard(activeTx)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all hover:bg-slate-200"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>
             {/* The requested Blue 'Print Invoice' button at the top right */}
             <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95"
            >
              <Printer className="w-4 h-4" /> 
              Print Invoice
            </button>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all border border-slate-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-12 bg-slate-200/50 custom-scrollbar printable-content">
          {transactionList.map((transaction) => {
            const dateObj = new Date(transaction.date);
            return (
              <div 
                key={transaction.id} 
                className="bg-white mx-auto printable-page shadow-2xl mb-12 last:mb-0 p-12 flex flex-col print:shadow-none print:p-10"
                style={{ width: '210mm', minHeight: '297mm', position: 'relative' }}
              >
                {/* Header Section */}
                <div className="flex justify-between items-start mb-12">
                  <div className="flex-1 flex items-start gap-6">
                    {/* Added Logo Box */}
                    {businessInfo.logo && (
                      <div className="w-28 h-28 shrink-0 bg-white border border-slate-100 rounded-3xl p-2 flex items-center justify-center shadow-sm print:border-none">
                        <img src={businessInfo.logo} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-black text-blue-600 mb-2 leading-tight">
                        {businessInfo.name}
                      </h1>
                      <div className="space-y-1 text-slate-600 text-[11px] font-bold">
                        <p className="flex items-start gap-2">
                          <span className="text-slate-900">អាសយដ្ឋាន:</span> {businessInfo.address}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-slate-900">ទូរស័ព្ទ:</span> {businessInfo.phone}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-slate-900">អ៊ីមែល:</span> {businessInfo.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <div className="bg-blue-600 text-white px-8 py-2.5 rounded-2xl font-black text-xl mb-4 tracking-widest min-w-[160px] text-center">
                      វិក្កយបត្រ
                    </div>
                    <div className="space-y-1 text-[12px]">
                      <p className="font-bold flex justify-end gap-2">
                        <span className="text-slate-900">លេខវិក្កយបត្រ:</span> 
                        <span className="text-blue-600 font-black">{transaction.id}</span>
                      </p>
                      <p className="font-bold flex justify-end gap-2">
                        <span className="text-slate-900">កាលបរិច្ឆេទ:</span> 
                        <span className="text-slate-800">{dateObj.toLocaleDateString('km-KH')}</span>
                      </p>
                      <p className="font-bold flex justify-end gap-2">
                        <span className="text-slate-900">ម៉ោងចេញ:</span> 
                        <span className="text-slate-800">
                          {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100 mb-10"></div>

                {/* Vendor / Purchaser Section */}
                <div className="grid grid-cols-2 gap-8 mb-12">
                  <div className="p-6 bg-slate-50/30 border border-slate-100 rounded-3xl h-36 flex flex-col">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-200/50">
                      អ្នកផ្គត់ផ្គង់ / VENDOR
                    </h4>
                    <p className="text-lg font-black text-slate-800">
                      {transaction.type === TransactionType.SALE ? businessInfo.name : transaction.customerOrSupplierName}
                    </p>
                  </div>
                  <div className="p-6 bg-slate-50/30 border border-slate-100 rounded-3xl h-36 flex flex-col text-right">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-200/50">
                      អ្នកទិញ / PURCHASER
                    </h4>
                    <p className="text-lg font-black text-slate-800 uppercase">
                      {transaction.type === TransactionType.SALE ? transaction.customerOrSupplierName : businessInfo.name}
                    </p>
                  </div>
                </div>

                {/* Main Items Table */}
                <div className="flex-1">
                  <table className="w-full border-separate border-spacing-0 rounded-2xl overflow-hidden border border-slate-200">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="py-4 px-4 text-[11px] font-black uppercase text-center w-12">ល.រ</th>
                        <th className="py-4 px-4 text-[11px] font-black uppercase text-left">ឈ្មោះទំនិញ</th>
                        <th className="py-4 px-4 text-[11px] font-black uppercase text-center w-24">ចំនួន</th>
                        <th className="py-4 px-4 text-[11px] font-black uppercase text-center w-32">តម្លៃរាយ</th>
                        <th className="py-4 px-4 text-[11px] font-black uppercase text-right w-36">សរុប</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transaction.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-5 px-4 text-center text-xs font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-5 px-4">
                            <p className="text-[14px] font-black text-slate-900 uppercase">{item.productName}</p>
                          </td>
                          <td className="py-5 px-4 text-center text-[14px] font-black text-slate-800">{item.quantity}</td>
                          <td className="py-5 px-4 text-center text-[14px] font-bold text-slate-600 font-mono">${item.price.toFixed(2)}</td>
                          <td className="py-5 px-4 text-right text-[14px] font-black text-blue-600 font-mono">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                      {/* Empty rows to maintain layout height if needed */}
                      {Array.from({ length: Math.max(0, 8 - transaction.items.length) }).map((_, i) => (
                        <tr key={`empty-${i}`} className="h-14">
                          <td colSpan={5}></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Totals Section */}
                <div className="mt-12 flex flex-col items-end space-y-3">
                  <div className="flex justify-between w-64 px-4">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">សរុបទឹកប្រាក់ (SUBTOTAL):</span>
                    <span className="text-[14px] font-black text-slate-900 font-mono">${(transaction.subTotal || transaction.totalAmount).toFixed(2)}</span>
                  </div>
                  
                  {transaction.discountAmount > 0 && (
                    <div className="flex justify-between w-64 px-4 text-red-500">
                      <span className="text-[11px] font-black uppercase tracking-tighter">បញ្ចុះតម្លៃ (DISCOUNT):</span>
                      <span className="text-[14px] font-black font-mono">-${transaction.discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="bg-blue-600 text-white rounded-2xl p-5 flex items-center justify-between w-full max-w-[400px] shadow-xl shadow-blue-500/20">
                    <span className="text-sm font-black uppercase tracking-widest">សរុបចុងក្រោយ (TOTAL):</span>
                    <span className="text-3xl font-black font-mono">${transaction.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="mt-24 grid grid-cols-2 gap-24">
                  <div className="text-center">
                    <div className="w-full border-t border-slate-300 mb-3 mx-auto max-w-[200px]"></div>
                    <p className="text-[11px] font-black text-slate-900 uppercase">ហត្ថលេខាអ្នកលក់</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">(Seller Signature)</p>
                  </div>
                  <div className="text-center">
                    <div className="w-full border-t border-slate-300 mb-3 mx-auto max-w-[200px]"></div>
                    <p className="text-[11px] font-black text-slate-900 uppercase">ហត្ថលេខាអ្នកទិញ</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">(Buyer Signature)</p>
                  </div>
                </div>

                {/* Bottom Info Strip */}
                <div className="mt-auto pt-10 text-center">
                   <p className="text-[10px] text-slate-400 font-bold italic">
                     សូមពិនិត្យទំនិញអោយបានត្រឹមត្រូវមុនពេលចាកចេញ។ ទំនិញដែលទិញហើយមិនអាចប្តូរវិញបានទេ។
                   </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .printable-content, .printable-content * {
            visibility: visible !important;
          }
          .printable-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .printable-page {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            page-break-after: always !important;
            background: white !important;
            display: flex !important;
            box-shadow: none !important;
            border: none !important;
            padding: 10mm !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
          .no-print {
            display: none !important;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default Invoice;
