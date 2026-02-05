
import React, { useRef } from 'react';
import { BusinessInfo } from '../types';
import { Building2, MapPin, Phone, Mail, Upload, Image as ImageIcon, CheckCircle2, DollarSign, Download, Database, RotateCcw, AlertTriangle } from 'lucide-react';

interface SettingsProps {
  businessInfo: BusinessInfo;
  onUpdate: (info: BusinessInfo) => void;
  onRestore: (data: any) => void;
  fullData: any;
}

const Settings: React.FC<SettingsProps> = ({ businessInfo, onUpdate, onRestore, fullData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdate({ ...businessInfo, logo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleBackup = () => {
    const dataStr = JSON.stringify(fullData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreClick = () => {
    if (window.confirm('តើអ្នកពិតជាចង់បញ្ចូលទិន្នន័យបម្រុងទុកមែនទេ? ទិន្នន័យបច្ចុប្បន្ននឹងត្រូវជំនួសដោយទិន្នន័យថ្មី!')) {
      restoreInputRef.current?.click();
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          onRestore(json);
        } catch (err) {
          alert('ឯកសារមិនត្រឹមត្រូវ! សូមពិនិត្យមើលឯកសារម្តងទៀត។');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ការកំណត់ប្រព័ន្ធ</h2>
          <p className="text-slate-500">គ្រប់គ្រងព័ត៌មានអាជីវកម្ម និងសុវត្ថិភាពទិន្នន័យ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">រូបសញ្ញាក្រុមហ៊ុន</h3>
            <div className="relative group mx-auto w-40 h-40">
              <div className="w-full h-full rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400">
                {businessInfo.logo ? <img src={businessInfo.logo} alt="Logo" className="w-full h-full object-contain" /> : <ImageIcon className="w-12 h-12 text-slate-300" />}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-3 -right-3 p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"><Upload className="w-4 h-4" /></button>
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Database className="w-4 h-4 text-indigo-600" /> ការគ្រប់គ្រងទិន្នន័យ</h3>
            <button onClick={handleBackup} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-white hover:border-blue-400 transition-all group">
              <div className="text-left">
                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">ទាញយកទិន្នន័យ (Backup)</p>
                <p className="text-[10px] text-slate-400 font-bold">រក្សាទុកទិន្នន័យជា JSON</p>
              </div>
              <Download className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </button>
            <button onClick={handleRestoreClick} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-white hover:border-red-400 transition-all group">
              <div className="text-left">
                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">បញ្ចូលទិន្នន័យ (Restore)</p>
                <p className="text-[10px] text-slate-400 font-bold">ប្រើឯកសារបម្រុងទុក</p>
              </div>
              <RotateCcw className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" />
            </button>
            <input type="file" ref={restoreInputRef} onChange={handleRestoreFile} className="hidden" accept=".json" />
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3">
               <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
               <p className="text-[9px] text-orange-700 font-bold leading-relaxed">សូមទាញយកឯកសារបម្រុងទុកជាប្រចាំ ដើម្បីជៀសវាងការបាត់បង់ទិន្នន័យក្នុង Browser។</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 uppercase tracking-widest"><Building2 className="w-4 h-4 text-blue-600" /> ព័ត៌មានអាជីវកម្ម</h3>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">ឈ្មោះអាជីវកម្ម</label>
              <input type="text" value={businessInfo.name} onChange={(e) => onUpdate({...businessInfo, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">អាសយដ្ឋាន</label>
              <textarea value={businessInfo.address} onChange={(e) => onUpdate({...businessInfo, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold h-24 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <input type="text" placeholder="Phone" value={businessInfo.phone} onChange={(e) => onUpdate({...businessInfo, phone: e.target.value})} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              <input type="email" placeholder="Email" value={businessInfo.email} onChange={(e) => onUpdate({...businessInfo, email: e.target.value})} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
