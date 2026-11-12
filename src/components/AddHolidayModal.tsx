import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Holiday, HolidayCategory } from '../types';
import { CATEGORIES, MONTHS } from '../data/categories';
import { triggerHaptic } from '../utils/calendarUtils';

interface AddHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHoliday: (holiday: Holiday) => void;
}

export const AddHolidayModal: React.FC<AddHolidayModalProps> = ({
  isOpen,
  onClose,
  onAddHoliday,
}) => {
  const [name, setName] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());
  const [category, setCategory] = useState<HolidayCategory>('Zabawa & Moda');
  const [icon, setIcon] = useState('🎉');
  const [description, setDescription] = useState('');
  const [schoolIdea, setSchoolIdea] = useState('');
  const [dressCode, setDressCode] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isPublicHoliday, setIsPublicHoliday] = useState(false);

  if (!isOpen) return null;

  const popularEmojis = ['🎉', '🍕', '🎓', '❤️', '🔥', '🍰', '🐶', '🎵', '🚀', '📚', '🏆', '👗'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      alert('Wpisz nazwę i opis święta!');
      return;
    }

    triggerHaptic();
    const newHoliday: Holiday = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      month: Number(month),
      day: Number(day),
      category,
      icon,
      description: description.trim(),
      schoolIdea: schoolIdea.trim() || undefined,
      dressCode: dressCode.trim() || undefined,
      hashtags: hashtags.trim() || `#${name.replace(/\s+/g, '')} #Festivo`,
      isPublicHoliday,
      isCustom: true,
    };

    onAddHoliday(newHoliday);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        data-selectable="true"
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-[#243235] border border-[#334346] rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 text-[#F8FAFC] flex flex-col space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#334346]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D97652] text-white flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Dodaj własne święto</h2>
              <p className="text-[11px] text-[#BCC3C9]">Zapisze się lokalnie w aplikacji</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#182022] hover:bg-[#2C3B3E] text-[#BCC3C9] hover:text-white border border-[#334346] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Nazwa */}
          <div>
            <label className="block text-[#BCC3C9] font-bold mb-1">
              Nazwa święta <span className="text-[#F2AB91]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Dzień Pizzy w Klasie 3B"
              className="w-full px-3 py-2 rounded-xl bg-[#182022] border border-[#334346] text-[#F8FAFC] placeholder-[#BCC3C9]/50 focus:outline-none focus:border-[#D97652] text-xs"
              required
            />
          </div>

          {/* Data: Miesiąc & Dzień */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[#BCC3C9] font-bold mb-1">Miesiąc</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#182022] border border-[#334346] text-[#F8FAFC] focus:outline-none focus:border-[#D97652] text-xs"
              >
                {MONTHS.map((m) => (
                  <option key={m.number} value={m.number}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#BCC3C9] font-bold mb-1">Dzień (1-31)</label>
              <input
                type="number"
                min={1}
                max={31}
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#182022] border border-[#334346] text-[#F8FAFC] focus:outline-none focus:border-[#D97652] text-xs"
                required
              />
            </div>
          </div>

          {/* Emoji & Kategoria */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[#BCC3C9] font-bold mb-1">Ikona</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={4}
                className="w-full px-3 py-2 text-center text-lg rounded-xl bg-[#182022] border border-[#334346] text-[#F8FAFC] focus:outline-none focus:border-[#D97652]"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[#BCC3C9] font-bold mb-1">Kategoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HolidayCategory)}
                className="w-full px-3 py-2 rounded-xl bg-[#182022] border border-[#334346] text-[#F8FAFC] focus:outline-none focus:border-[#D97652] text-xs"
              >
                {CATEGORIES.filter((c) => c.id !== 'Wszystkie').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Szybki wybór Emoji */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {popularEmojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setIcon(e)}
                className="p-1.5 text-base rounded-xl bg-[#182022] hover:bg-[#2C3B3E] active:scale-95 border border-[#334346]"
              >
                {e}
              </button>
            ))}
          </div>

          {/* Opis */}
          <div>
            <label className="block text-[#BCC3C9] font-bold mb-1">
              Opis i cel święta <span className="text-[#F2AB91]">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="O co chodzi w tym święcie?"
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[#182022] border border-[#334346] text-[#F8FAFC] placeholder-[#BCC3C9]/50 focus:outline-none focus:border-[#D97652] text-xs"
              required
            />
          </div>

          {/* Pomysł do szkoły & Dress code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[#BCC3C9] font-bold mb-1">
                Pomysł na akcję
              </label>
              <input
                type="text"
                value={schoolIdea}
                onChange={(e) => setSchoolIdea(e.target.value)}
                placeholder="np. Wspólne jedzenie gofrów"
                className="w-full px-3 py-2 rounded-xl bg-[#182022] border border-[#334346] text-[#F8FAFC] placeholder-[#BCC3C9]/50 focus:outline-none focus:border-[#D97652] text-xs"
              />
            </div>

            <div>
              <label className="block text-[#BCC3C9] font-bold mb-1">Dress Code (strój)</label>
              <input
                type="text"
                value={dressCode}
                onChange={(e) => setDressCode(e.target.value)}
                placeholder="np. Akcenty w kolorze pomarańczowym"
                className="w-full px-3 py-2 rounded-xl bg-[#182022] border border-[#334346] text-[#F8FAFC] placeholder-[#BCC3C9]/50 focus:outline-none focus:border-[#D97652] text-xs"
              />
            </div>
          </div>

          {/* Hashtagi */}
          <div>
            <label className="block text-[#BCC3C9] font-bold mb-1">Hashtagi</label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#Festivo #Swieto #Szkola"
              className="w-full px-3 py-2 rounded-xl bg-[#182022] border border-[#334346] text-[#F8FAFC] placeholder-[#BCC3C9]/50 focus:outline-none focus:border-[#D97652] text-xs font-mono"
            />
          </div>

          {/* Czy wolne */}
          <label className="flex items-center space-x-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isPublicHoliday}
              onChange={(e) => setIsPublicHoliday(e.target.checked)}
              className="rounded bg-[#182022] border-[#334346] text-[#D97652] focus:ring-0"
            />
            <span className="text-[#BCC3C9] text-xs">Dzień wolny od pracy/szkoły</span>
          </label>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#D97652] hover:bg-[#C26340] text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              Zapisz święto w kalendarzu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
