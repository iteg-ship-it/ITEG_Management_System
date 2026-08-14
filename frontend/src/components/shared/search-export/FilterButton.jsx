/* eslint-disable react/prop-types */
import { useState, useRef, useEffect, useMemo } from "react";
import { SlidersHorizontal, ChevronDown, Check, RotateCcw } from "lucide-react";

/**
 * FilterButton — single vertical dropdown menu
 *
 * Props:
 *  data              : row objects array
 *  filterableColumns : [{ label: "Course", key: "course" }, ...]
 *  onFilteredData    : (filteredRows) => void
 */
const FilterButton = ({ data = [], filterableColumns = [], onFilteredData }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState({});
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Dynamic unique options per column
  const optionsMap = useMemo(() => {
    const map = {};
    filterableColumns.forEach(({ key }) => {
      map[key] = [
        ...new Set(
          data
            .map((row) => row[key])
            .filter((v) => v !== undefined && v !== null && v !== "")
        ),
      ].sort((a, b) => String(a).localeCompare(String(b)));
    });
    return map;
  }, [data, filterableColumns]);

  // Emit filtered data whenever selection changes
  useEffect(() => {
    const filtered = data.filter((row) =>
      filterableColumns.every(({ key }) => {
        const sel = selected[key];
        return !sel || sel.size === 0 || sel.has(row[key]);
      })
    );
    onFilteredData?.(filtered);
  }, [selected, data]);

  const toggle = (key, value) => {
    setSelected((prev) => {
      const current = new Set(prev[key] || []);
      current.has(value) ? current.delete(value) : current.add(value);
      return { ...prev, [key]: current };
    });
  };

  const clearAll = () => setSelected({});

  const totalSelected = Object.values(selected).reduce(
    (acc, s) => acc + (s?.size || 0),
    0
  );

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3.5 h-10 text-sm font-medium border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-700 shadow-xs hover:border-[var(--primary,#FDA92D)] transition-all focus:outline-none cursor-pointer"
      >
        <SlidersHorizontal size={15} className="text-gray-600" />
        <span>Filter</span>
        {totalSelected > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--primary,#FDA92D)] text-white text-[11px] font-bold shadow-xs">
            {totalSelected}
          </span>
        )}
        <ChevronDown
          size={16}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-[var(--primary,#FDA92D)]" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu (Single Vertical List format like ExportDropdown) */}
      {open && (
        <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-50 animate-fadeIn max-h-80 overflow-y-auto custom-scrollbar space-y-1">
          {filterableColumns.length === 0 ? (
            <p className="text-xs text-gray-400 px-3 py-3 text-center">No filters available</p>
          ) : (
            filterableColumns.map(({ label, key }, colIdx) => {
              const opts = optionsMap[key] || [];
              const categorySelected = selected[key] || new Set();

              return (
                <div key={key} className={colIdx > 0 ? "pt-2 border-t border-gray-100" : ""}>
                  {/* Category Header */}
                  <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>{label}</span>
                    {categorySelected.size > 0 && (
                      <span className="text-[10px] font-semibold text-[var(--primary-dark,#F97316)] bg-[var(--primary-100,#FFEDD5)] px-1.5 py-0.5 rounded-full">
                        {categorySelected.size}
                      </span>
                    )}
                  </div>

                  {/* Options List */}
                  {opts.length === 0 ? (
                    <p className="text-xs text-gray-400 px-3 py-1.5 italic">No options</p>
                  ) : (
                    <div className="space-y-0.5 mt-0.5">
                      {opts.map((opt) => {
                        const isChecked = categorySelected.has(opt);
                        return (
                          <label
                            key={opt}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 cursor-pointer group select-none ${
                              isChecked
                                ? "bg-[var(--primary-50,#FFF7ED)] text-[var(--primary-darker,#EA580C)] font-semibold"
                                : "text-gray-700 hover:bg-[var(--primary,#FDA92D)] hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggle(key, opt)}
                                className="accent-[var(--primary,#FDA92D)] w-4 h-4 rounded cursor-pointer shrink-0"
                              />
                              <span className="truncate">{String(opt)}</span>
                            </div>
                            {isChecked && (
                              <Check size={15} className="shrink-0 ml-2 text-[var(--primary-dark,#F97316)] group-hover:text-white" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Clear All Footer Button */}
          {totalSelected > 0 && (
            <div className="pt-1.5 mt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={clearAll}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Clear all filters ({totalSelected})</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterButton;


