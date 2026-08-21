import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Plus, X } from 'lucide-react';
import { clsx } from 'clsx';

export interface SelectOption {
  label: string;
  value: string;
  subtitle?: string;
  badge?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  allowCustom?: boolean;
  onAddNew?: (customLabel: string) => void;
  addNewButtonLabel?: string;
  onOpenAddNewModal?: () => void;
  modalTriggerLabel?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  allowCustom = false,
  onAddNew,
  addNewButtonLabel,
  onOpenAddNewModal,
  modalTriggerLabel,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const hasExactMatch = options.some(
    (opt) => opt.label.toLowerCase().trim() === searchTerm.toLowerCase().trim()
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateCustom = () => {
    if (!searchTerm.trim()) return;
    if (onAddNew) {
      onAddNew(searchTerm.trim());
    } else {
      onChange(searchTerm.trim());
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={clsx('relative w-full', className)} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-left text-sm transition-all focus:outline-none focus:border-indigo-500',
          isOpen ? 'border-indigo-500 ring-1 ring-indigo-500/30' : 'hover:border-slate-700',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className={clsx('truncate', !selectedOption ? 'text-slate-500' : 'text-white font-medium')}>
          {selectedOption ? selectedOption.label : (value || placeholder)}
        </span>
        <div className="flex items-center gap-1.5 ml-2 text-slate-400">
          {value && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 hover:text-white rounded hover:bg-slate-800"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={clsx('w-4 h-4 transition-transform', isOpen && 'rotate-180 text-indigo-400')} />
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Bar */}
          <div className="p-2 border-b border-slate-800 bg-slate-950/40">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Optional Direct Modal Trigger (e.g. "+ Add New Company") */}
          {onOpenAddNewModal && (
            <div className="p-1.5 border-b border-slate-800/80 bg-indigo-950/20">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenAddNewModal();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/60 border border-indigo-800/40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{modalTriggerLabel || 'Add New Item'}</span>
              </button>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={clsx(
                      'w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors',
                      isSelected
                        ? 'bg-indigo-950/80 text-indigo-300 font-semibold'
                        : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                    )}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate">{opt.label}</div>
                      {opt.subtitle && (
                        <div className="text-[11px] text-slate-400 truncate">{opt.subtitle}</div>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-400">
                No matching options found.
              </div>
            )}

            {/* Custom Create Option if search term doesn't match exactly and allowCustom is true */}
            {allowCustom && searchTerm.trim().length > 0 && !hasExactMatch && (
              <div className="p-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCreateCustom}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-emerald-400 hover:bg-emerald-950/40 rounded-lg transition-colors font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {addNewButtonLabel
                      ? `${addNewButtonLabel} "${searchTerm.trim()}"`
                      : `Add "${searchTerm.trim()}"`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
