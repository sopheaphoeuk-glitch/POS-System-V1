
import React, { useEffect, useRef } from 'react';
import { Transaction, BusinessInfo, TransactionType, Expense } from '../types';
import { X, Printer, FileText, FileDown, Building, PhoneCall, Mail, Globe } from 'lucide-react';

interface InvoiceProps {
  transactions: (Transaction | Expense) | (Transaction | Expense)[];
  onClose: () => void;
  businessInfo: BusinessInfo;
}

declare const html2pdf: any;

const formatCurrency = (num: number): string => {
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const Invoice: React.FC<InvoiceProps> = ({ transactions, onClose, businessInfo }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const documentList = React.useMemo(() => 
    Array.isArray(transactions) ? transactions : [transactions]
  , [transactions]);
  
  const firstDoc = documentList[0];

  useEffect(() => {
    const originalTitle = document.title;
    const docId = firstDoc?.id || 'DOCUMENT';
    document.title = `${docId}_Official_Invoice`;
    return () => { document.title = originalTitle; };
  }, [firstDoc]);

  /**
   * Robust Browser Print Handler
   */
  const handlePrint = () => {
    window.focus();
    setTimeout(() => {
      window.print();
    }, 500);
  };

  /**
   * PDF Export Handler using html2pdf.
   * Optimized for Noto Sans Khmer font rendering and A4 alignment.
   */
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    
    const originalScrollTop = scrollContainerRef.current?.scrollTop || 0;
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
    }

    const docId = firstDoc?.id || 'INVOICE';
    
    const opt = {
      margin: 0, 
      filename: `${docId}_Official_Invoice.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 4, 
        useCORS: true,
        letterRendering: true, 
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794, 
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true,
        precision: 16
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'], 
        after: '.invoice-card' 
      }
    };

    try {
      const element = printRef.current;
      const originalStyle = element.getAttribute('style') || '';
      
      element.style.width = '210mm';
      element.style.maxWidth = '210mm';
      element.style.margin = '0';
      element.style.padding = '0';
      
      await html2pdf().from(element).set(opt).save();
      
      element.setAttribute('style', originalStyle);
      if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = originalScrollTop;
      }
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('មានបញ្ហាក្នុងការបង្កើត PDF។ សូមព្យាយាមម្តងទៀត។');
    }
  };

  const isTransaction = (doc: any): doc is Transaction => 'type' in doc && 'items' in doc;
  const isExpense = (doc: any): doc is Expense => !('type' in doc) && 'amount' in doc;

  const getDocTitle = (doc: any) => {
    if (isExpense(doc)) return 'បង្កាន់ដៃចំណាយ / EXPENSE'; 
    if (isTransaction(doc)) {
      if (doc.type === TransactionType.SALE) return 'INVOICE'; 
      if (doc.type === TransactionType.PURCHASE) return 'វិក្កយបត្រទិញចូល / PURCHASE'; 
      if (doc.type === TransactionType.PURCHASE_ORDER) return 'ប័ណ្ណកម្ម៉ង់ទិញ / PO'; 
      if (doc.type === TransactionType.OTHER_OUT) return 'ប័ណ្ណកែតម្រូវស្តុក / ADJUSTMENT'; 
    }
    return 'ឯកសារយោង';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-0 overflow-hidden animate-in fade-in duration-500 print-container-active font-content">
      {/* TOOLBAR */}
      <div className="bg-slate-50 w-full h-full lg:h-[98vh] lg:max-w-[1440px] lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/10 no-print">
        
        <div className="px-10 py-5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-10 no-print shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-700 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
              <FileText className="w-7 h-7" />
            </div>
            <div className="font-content">
              <h3 className="font-bold text-slate-800 text-xl leading-tight">មើលមុនពេលបោះពុម្ព (A4)</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Noto Sans Khmer High Definition</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 font-content">
            <button 
              onClick={handleDownloadPDF} 
              className="flex items-center gap-3 px-8 py-3 bg-slate-800 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 shadow-lg group"
            >
              <FileDown className="w-4 h-4 group-hover:-translate-y-1 transition-transform" /> ទាញយកជា PDF
            </button>
            <button 
              onClick={handlePrint} 
              className="flex items-center gap-3 px-10 py-3 bg-blue-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-blue-800 transition-all active:scale-95 shadow-xl shadow-blue-200"
            >
              <Printer className="w-4 h-4" /> បោះពុម្ព
            </button>
            <div className="w-px h-10 bg-slate-200 mx-4"></div>
            <button onClick={onClose} className="p-3 hover:bg-red-50 rounded-2xl text-slate-400 hover:text-red-600 transition-all group">
              <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>

        {/* DOCUMENT VIEWPORT */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-12 bg-slate-200/50 custom-scrollbar flex justify-center invoice-viewport">
           <div ref={printRef} className="print-content-wrapper flex flex-col items-center">
            {documentList.map((doc, docIdx) => {
              const dateObj = new Date(doc.date);
              const titleFull = getDocTitle(doc);
              const parts = titleFull.split(' / ');
              const titleKh = parts[0];
              const titleEn = parts[1] || '';
              
              const total = isTransaction(doc) ? doc.totalAmount : doc.amount;
              const subtotal = isTransaction(doc) ? doc.subTotal : doc.amount;

              return (
                <div 
                  key={doc.id || docIdx} 
                  className="bg-white invoice-card mb-12 last:mb-0 relative shadow-2xl flex flex-col"
                  style={{ 
                    width: '210mm', 
                    minHeight: '297mm',
                    padding: '20mm 20mm', 
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    color: '#1e293b'
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-2 bg-blue-700"></div>

                  {/* HEADER */}
                  <div className="grid grid-cols-2 gap-10 mb-12 mt-4">
                    <div className="flex gap-6 items-start">
                      <div className="w-24 h-24 bg-white border border-slate-100 rounded-3xl flex items-center justify-center p-2 shadow-sm shrink-0 overflow-hidden ring-4 ring-slate-50">
                        {businessInfo.logo ? (
                          <img src={businessInfo.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                        ) : (
                          <Building className="w-12 h-12 text-blue-700 opacity-20" />
                        )}
                      </div>
                      <div className="space-y-3 pt-1">
                        <h1 className="text-xl font-muol text-blue-800 leading-snug tracking-tight">{businessInfo.name}</h1>
                        <div className="space-y-1">
                           <p className="text-[11px] font-medium text-slate-500 font-content leading-relaxed max-w-[300px]">{businessInfo.address}</p>
                           <div className="flex flex-col gap-1 pt-1 font-content">
                              <div className="flex items-center gap-2 text-slate-600">
                                 <PhoneCall className="w-3.5 h-3.5 text-blue-600 opacity-50" />
                                 <span className="text-[11px] font-mono font-bold tracking-tight">{businessInfo.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                 <Mail className="w-3.5 h-3.5 text-blue-600 opacity-50" />
                                 <span className="text-[11px] font-mono font-bold tracking-tight">{businessInfo.email}</span>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end pt-1">
                      <h2 className="text-3xl font-muol text-slate-900 mb-1 tracking-tight uppercase leading-none">{titleKh}</h2>
                      {titleEn && (
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 leading-none font-content">{titleEn}</p>
                      )}
                      
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 min-w-[240px] space-y-3 text-[11px] font-bold shadow-inner font-content">
                        <div className="flex justify-between items-center gap-8 border-b border-slate-200/50 pb-2">
                           <span className="text-slate-400 uppercase tracking-widest text-[9px]">Invoice Number:</span>
                           <span className="text-blue-700 font-bold font-mono tracking-tighter">#{doc.id}</span>
                        </div>
                        <div className="flex justify-between items-center gap-8 border-b border-slate-200/50 pb-2">
                           <span className="text-slate-400 uppercase tracking-widest text-[9px]">DATE:</span>
                           <span className="text-slate-800">{dateObj.toLocaleDateString('km-KH')}</span>
                        </div>
                        <div className="flex justify-between items-center gap-8">
                           <span className="text-slate-400 uppercase tracking-widest text-[9px]">TIME:</span>
                           <span className="text-slate-800">{dateObj.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* INFO SECTION */}
                  <div className="grid grid-cols-2 gap-8 mb-8 font-content">
                    <div className="relative p-8 bg-slate-50 border border-slate-100 rounded-[1.5rem] shadow-sm flex flex-col justify-center min-h-[90px]">
                      <span className="absolute -top-3 left-8 bg-blue-700 text-white text-[8px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.3em] shadow-lg shadow-blue-100">អតិថិជន / BILL TO</span>
                      <h3 className="text-lg font-bold text-slate-800 leading-tight">
                        {isTransaction(doc) ? (doc.customerOrSupplierName || 'អតិថិជនទូទៅ') : 'អតិថិជន'}
                      </h3>
                    </div>
                    <div className="relative p-8 bg-slate-50 border border-slate-100 rounded-[1.5rem] shadow-sm flex flex-col justify-center min-h-[90px]">
                      <span className="absolute -top-3 left-8 bg-slate-800 text-white text-[8px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.3em] shadow-lg shadow-slate-100">ចំណាំ / REMARKS</span>
                      <p className="text-[11px] text-slate-500 leading-relaxed italic line-clamp-2">
                        {isTransaction(doc) ? (doc.note || '---') : doc.description}
                      </p>
                    </div>
                  </div>

                  {/* TABLE */}
                  <div className="flex-1 font-content mt-4">
                    <table className="w-full border-separate border-spacing-0 rounded-[1.25rem] overflow-hidden border border-slate-200 table-fixed">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="py-4 px-3 text-center w-[50px] text-[9px] font-bold uppercase tracking-widest border-r border-slate-800">No</th>
                          <th className="py-4 px-6 text-left text-[9px] font-bold uppercase tracking-widest border-r border-slate-800">Description</th>
                          <th className="py-4 px-3 text-center w-[80px] text-[9px] font-bold uppercase tracking-widest border-r border-slate-800">Qty</th>
                          <th className="py-4 px-5 text-right w-[120px] text-[9px] font-bold uppercase tracking-widest border-r border-slate-800">Unit Price</th>
                          <th className="py-4 px-10 text-right w-[160px] text-[9px] font-bold uppercase tracking-widest">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="text-[12px] font-medium text-slate-700">
                        {isTransaction(doc) ? (
                          doc.items.map((item, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} style={{ pageBreakInside: 'avoid' }}>
                              <td className="py-4 px-3 text-center text-slate-400 font-mono border-r border-slate-100 border-b border-slate-100">
                                {(idx + 1).toString().padStart(2, '0')}
                              </td>
                              <td className="py-4 px-6 text-slate-800 border-r border-slate-100 border-b border-slate-100 truncate leading-relaxed">
                                {item.productName}
                              </td>
                              <td className="py-4 px-3 text-center font-mono border-r border-slate-100 border-b border-slate-100 text-slate-600">
                                {item.quantity.toLocaleString()}
                              </td>
                              <td className="py-4 px-5 text-right font-mono border-r border-slate-100 border-b border-slate-100 tracking-tighter text-slate-600">
                                ${formatCurrency(item.price)}
                              </td>
                              <td className="py-4 px-10 text-right text-slate-900 font-bold font-mono tracking-tighter border-b border-slate-100">
                                ${formatCurrency(item.price * item.quantity)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr style={{ pageBreakInside: 'avoid' }}>
                            <td className="py-24 px-12 text-center text-slate-400 italic text-[14px] leading-relaxed" colSpan={5}>
                              {doc.description}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* SUMMARY SECTION */}
                  <div className="mt-12 flex justify-end items-end relative font-content" style={{ pageBreakInside: 'avoid' }}>
                    <div className="w-[420px] space-y-3">
                      <div className="flex justify-between items-center px-10">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subtotal:</span>
                        <span className="text-lg font-bold text-slate-800 font-mono tracking-tighter">${formatCurrency(subtotal)}</span>
                      </div>
                      
                      {isTransaction(doc) && (doc.discountAmount ?? 0) > 0 && (
                        <div className="flex justify-between items-center px-10">
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Discount:</span>
                          <span className="text-lg font-bold text-red-600 font-mono tracking-tighter">-${formatCurrency(doc.discountAmount)}</span>
                        </div>
                      )}

                      <div className="bg-blue-800 text-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-100 flex justify-between items-center w-full border border-white/10 relative overflow-hidden mt-6 ring-8 ring-blue-50">
                        <div className="flex flex-col relative z-10 justify-center">
                          <span className="text-[11px] font-bold text-blue-100 uppercase tracking-[0.3em] leading-none">TOTAL DUE</span>
                        </div>
                        <div className="flex items-baseline gap-2 relative z-10">
                           <span className="text-2xl font-bold opacity-30">$</span>
                           <span className="text-5xl font-bold font-mono tracking-tighter leading-none">{formatCurrency(total)}</span>
                        </div>
                        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                      </div>
                    </div>
                  </div>

                  {/* SIGNATURES */}
                  <div className="mt-16 grid grid-cols-2 gap-12 text-center pt-16 font-content" style={{ pageBreakInside: 'avoid' }}>
                    <div className="flex flex-col justify-end">
                      <div className="border-t border-slate-200 pt-6 px-4">
                        <p className="text-[16px] font-muol text-slate-900 mb-1 leading-none">អ្នកលក់</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none font-content">Authorized Signature</p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="border-t border-slate-200 pt-6 px-4">
                        <p className="text-[16px] font-muol text-slate-900 mb-1 leading-none">អ្នកទិញ</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none font-content">Receiver Signature</p>
                      </div>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="mt-auto border-t border-slate-50 pt-10 text-center pb-2 font-content" style={{ pageBreakInside: 'avoid' }}>
                    <div className="inline-flex items-center gap-3 bg-slate-50 px-8 py-2.5 rounded-full border border-slate-100 mb-6 shadow-sm">
                       <span className="w-4 h-4 bg-blue-700 text-white flex items-center justify-center rounded-full text-[7px] font-bold font-mono">!</span>
                       <p className="text-[11px] font-bold text-slate-500 italic">
                         ទំនិញដែលបានទិញហើយមិនអាចប្តូរវិញបានទេ។ សូមអរគុណ!
                       </p>
                    </div>
                    <div className="flex items-center justify-center gap-10 text-[8px] font-bold uppercase tracking-[0.8em] text-slate-300 opacity-80 font-mono">
                      <div className="flex items-center justify-center gap-2 font-mono"><Globe className="w-3 h-3" /> RATANA-BOTTLE.COM</div>
                      <span>•</span>
                      <span>Print: {new Date().toLocaleDateString('km-KH')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        /* --- PROFESSIONAL A4 PDF & PRINT ENGINE --- */
        .invoice-card {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 auto !important;
            background-color: white !important;
            position: relative !important;
            display: flex !important;
            flex-direction: column !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            box-shadow: none !important;
            font-family: 'Noto Sans Khmer', sans-serif !important;
            font-size: 14px;
        }

        .font-muol {
            font-family: 'Noto Sans Khmer', sans-serif !important;
            font-weight: 700 !important;
            line-height: 1.4 !important;
        }
        
        .font-content {
            font-family: 'Noto Sans Khmer', sans-serif !important;
            font-weight: 400 !important;
            line-height: 1.6 !important;
        }

        .print-content-wrapper {
            width: 210mm !important; 
            margin-left: auto;
            margin-right: auto;
            background-color: transparent;
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow: visible !important;
        }

        @media print {
            @page {
              size: A4;
              margin: 0mm;
            }
            body {
              background: white !important;
              overflow: visible !important;
              height: auto !important;
            }
            .no-print {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
            }
            .invoice-card {
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
                width: 210mm !important; 
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-after: always !important;
                overflow: visible !important;
            }
            .print-container-active {
                position: relative !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                background: white !important;
                display: block !important;
                z-index: auto !important;
                overflow: visible !important;
            }
            .print-content-wrapper {
                width: 100% !important;
                overflow: visible !important;
            }
            .invoice-viewport {
                overflow: visible !important;
                padding: 0 !important;
            }
            
            table, tr, td, th {
                page-break-inside: avoid !important;
            }
        }

        .custom-scrollbar::-webkit-scrollbar {
            width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(29, 78, 216, 0.1);
            border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default Invoice;
