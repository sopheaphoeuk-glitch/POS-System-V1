
import React, { useRef } from 'react';
import { BusinessInfo } from '../types';
import { Building2, MapPin, Phone, Mail, Upload, Image as ImageIcon, CheckCircle2, DollarSign, LayoutList } from 'lucide-react';

interface SettingsProps {
  businessInfo: BusinessInfo;
  onUpdate: (info: BusinessInfo) => void;
}

const Settings: React.FC<SettingsProps> = ({ businessInfo, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...businessInfo, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onUpdate({ ...businessInfo, [name]: value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">ការកំណត់ប្រព័ន្ធ</h2>
        <p className="text-slate-500">គ្រប់គ្រងព័ត៌មានអាជីវកម្ម និងរូបសញ្ញាក្រុមហ៊ុន (Logo)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          {/* Logo Upload Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">រូបសញ្ញាក្រុមហ៊ុន</h3>
            <div className="relative group mx-auto w-40 h-40">
              <div className="w-full h-full rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400">
                {businessInfo.logo ? (
                  <img src={businessInfo.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-slate-300" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-3 -right-3 p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLogoUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase">ទំហំដែលណែនាំ: 512x512px (PNG/JPG)</p>
          </div>

          {/* Currency Settings Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" /> ការកំណត់រូបិយប័ណ្ណ
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">និមិត្តសញ្ញា (Symbol)</label>
                <input 
                  type="text" 
                  name="currencySymbol"
                  value={businessInfo.currencySymbol}
                  onChange={handleChange}
                  placeholder="ឧ. $, ៛, KHR"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-black transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">ទីតាំង (Position)</label>
                <select 
                  name="currencyPosition"
                  value={businessInfo.currencyPosition}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all"
                >
                  <option value="prefix">ខាងមុខ (Prefix)</option>
                  <option value="suffix">ខាងក្រោយ (Suffix)</option>
                </select>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">គំរូ (Example):</p>
                <p className="text-lg font-black text-blue-600">
                  {businessInfo.currencyPosition === 'prefix' ? `${businessInfo.currencySymbol}1,250.00` : `1,250.00 ${businessInfo.currencySymbol}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 uppercase tracking-widest">
            <Building2 className="w-4 h-4 text-blue-600" /> ព័ត៌មានអាជីវកម្ម
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">ឈ្មោះអាជីវកម្ម / ហាង</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  name="name"
                  value={businessInfo.name}
                  onChange={handleChange}
                  placeholder="ឧ. រតនា ផលិតសំបកដប និង ប្លាស្ទិក"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">អាសយដ្ឋាន</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                <textarea 
                  name="address"
                  value={businessInfo.address}
                  onChange={handleChange}
                  placeholder="ឧ. ភូមិ ស្នួលខ្ពស់ ឃុំ តាំងយ៉ាប ស្រុក ព្រៃកប្បាស តាកែវ"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold h-24 resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">លេខទូរស័ព្ទ</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="phone"
                    value={businessInfo.phone}
                    onChange={handleChange}
                    placeholder="ឧ. 085 809 054"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">អ៊ីមែល</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    name="email"
                    value={businessInfo.email}
                    onChange={handleChange}
                    placeholder="ឧ. ratana.bottle@gmail.com"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
