import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, 
  X, 
  Plus, 
  Minus,
  ShieldAlert
} from 'lucide-react';
import { prayerStore } from '../lib/prayerStore';
import { PrayerIcon } from './PrayerIcon';

interface SubmitPrayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPrayerTypeId?: string;
  onSuccess?: () => void;
}

export const SubmitPrayerModal: React.FC<SubmitPrayerModalProps> = ({
  isOpen,
  onClose,
  preselectedPrayerTypeId,
  onSuccess,
}) => {
  // Allowed 6 prayer types strictly as requested
  const allowedPrayerSlugs = useMemo(() => new Set(['holy-mass', 'eucharistic-visits', 'creed', 'memorare', 'our-father', 'decades']), []);
  
  const prayerTypes = useMemo(() => {
    return prayerStore
      .getPrayerTypes()
      .filter(t => t.is_active && allowedPrayerSlugs.has(t.slug));
  }, [allowedPrayerSlugs]);

  const [prayerTypeId, setPrayerTypeId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | string>(5);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Initialize selected prayer type and quantity only when modal opens or preselection changes
  useEffect(() => {
    if (isOpen) {
      if (preselectedPrayerTypeId) {
        const valid = prayerTypes.find(p => p.id === preselectedPrayerTypeId);
        if (valid) {
          setPrayerTypeId(valid.id);
          setQuantity(valid.default_step || 5);
          return;
        }
      }
      
      if (prayerTypes.length > 0) {
        setPrayerTypeId(prayerTypes[0].id);
        setQuantity(prayerTypes[0].default_step || 5);
      }
    }
  }, [isOpen, preselectedPrayerTypeId, prayerTypes]);

  if (!isOpen) return null;

  const currentPrayer = prayerTypes.find(p => p.id === prayerTypeId) || prayerTypes[0];

  const handleStepChange = (amount: number) => {
    const currentVal = typeof quantity === 'number' ? quantity : (parseInt(quantity, 10) || 1);
    const nextVal = Math.max(1, Math.min(100000, currentVal + amount));
    setQuantity(nextVal);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setQuantity('');
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setQuantity(Math.max(1, Math.min(100000, num)));
    }
  };

  const handleInputBlur = () => {
    if (quantity === '' || typeof quantity === 'string' && isNaN(parseInt(quantity, 10))) {
      setQuantity(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!prayerTypeId) {
      setErrorMessage('Please select a prayer offering.');
      return;
    }

    const numericQty = typeof quantity === 'number' ? quantity : parseInt(quantity, 10);

    if (isNaN(numericQty) || numericQty < 1) {
      setErrorMessage('Please enter a valid quantity of at least 1.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Date is automatically recorded and no user info is collected
      await prayerStore.submitPrayer({
        prayer_type_id: prayerTypeId,
        quantity: numericQty,
      });

      setIsSubmitting(false);
      setIsSuccess(true);

      if (onSuccess) onSuccess();

      // Automatically close after a moment of contemplative confirmation
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('An error occurred while offering your prayer. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in" id="submit-prayer-modal-backdrop">
      <div 
        className="relative bg-[#FFFDF9] rounded-3xl border-2 border-[#9A3412]/30 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        id="submit-prayer-modal-card"
      >
        {/* Modal Top Decorative Border */}
        <div className="h-2 bg-gradient-to-r from-[#9A3412] via-[#EA7A1E] to-[#FBE288]" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#9A3412]/15 flex items-start justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white p-1 border border-[#EA7A1E]/30 flex items-center justify-center shadow-xs">
              <img
                src="/Offer_Prayer_Logo.png"
                alt="Offer Prayer"
                className="w-full h-full object-contain select-none"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#9A3412] font-heading leading-tight">
                Offer Your Prayer
              </h3>
              <p className="text-xs text-[#6B4E41] font-prayer italic">
                Campus Meet '26
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            id="close-prayer-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Spiritual Animation View */}
        {isSuccess ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95">
            {/* Candle glow & expanding halo */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-radial from-[#FDE895] via-[#EA7A1E]/30 to-transparent animate-ping opacity-75" />
              <div className="w-20 h-20 rounded-full bg-[#9A3412] flex items-center justify-center text-white shadow-xl mx-auto ring-4 ring-[#FBE288]">
                <Flame className="w-10 h-10 text-[#FBE288] animate-candle" />
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-black text-[#9A3412] font-heading">
                Your prayer has been offered.
              </h4>
              <p className="text-sm text-[#EA7A1E] font-extrabold uppercase tracking-wider">
                {quantity} × {currentPrayer?.name} Consecrated
              </p>
              <p className="text-xs text-[#6B4E41] font-prayer italic max-w-sm mx-auto pt-2">
                "One more prayer has joined the Campus Meet '26 spiritual altar."
              </p>
            </div>
          </div>
        ) : (
          /* Main Submission Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5" id="prayer-offering-form">
            
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Prayer Type Selection (Strictly 6 Types) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#9A3412] uppercase tracking-wider">
                  Prayer Offering
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-2 bg-[#FAF7F2] rounded-2xl border border-[#9A3412]/15">
                {prayerTypes.map(pt => {
                  const isSelected = prayerTypeId === pt.id;
                  return (
                    <button
                      type="button"
                      key={pt.id}
                      onClick={() => {
                        setPrayerTypeId(pt.id);
                        setQuantity(pt.default_step || 5);
                      }}
                      className={`p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#9A3412] text-white shadow-sm ring-2 ring-[#EA7A1E]'
                          : 'bg-white text-[#44261B] hover:bg-[#FAF7F2] border border-gray-100 hover:border-[#9A3412]/30'
                      }`}
                    >
                      <PrayerIcon slug={pt.slug} className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#FBE288]' : 'text-[#EA7A1E]'}`} />
                      <span className="truncate">{pt.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Counter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#9A3412] uppercase tracking-wider">
                  COUNT
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStepChange(-(currentPrayer?.default_step || 1))}
                  className="w-12 h-12 rounded-2xl bg-white border border-[#9A3412]/20 hover:bg-[#FAF7F2] text-[#9A3412] font-black flex items-center justify-center text-lg shadow-xs cursor-pointer transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="relative flex-1">
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={quantity}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className="w-full h-12 text-center text-xl font-black text-[#9A3412] bg-white border-2 border-[#9A3412]/30 rounded-2xl focus:border-[#EA7A1E] focus:ring-2 focus:ring-[#EA7A1E]/20 outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleStepChange(currentPrayer?.default_step || 1)}
                  className="w-12 h-12 rounded-2xl bg-white border border-[#9A3412]/20 hover:bg-[#FAF7F2] text-[#9A3412] font-black flex items-center justify-center text-lg shadow-xs cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Increment Shortcuts */}
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 5, 10, 25, 50, 100].map(amt => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setQuantity(amt)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center ${
                      quantity === amt
                        ? 'bg-[#EA7A1E] text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-[#6B4E41] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                id="submit-prayer-offering-btn"
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#EA7A1E] to-[#9A3412] hover:from-[#F29543] hover:to-[#B8431B] text-white text-sm font-black uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Flame className="w-4 h-4 text-[#FBE288] animate-candle" />
                <span>{isSubmitting ? 'Consecrating Offering...' : 'Offer Prayer'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

