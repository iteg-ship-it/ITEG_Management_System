/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { useField, ErrorMessage } from "formik";

const CustomDropdown = ({ name, label, options, className = "", disabled = false }) => {
  const [field, , helpers] = useField(name);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);

  const hasValue = field.value !== "";
  const selectedOption = options.find(opt => opt.value === field.value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    helpers.setValue(value);
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          peer h-12 w-full border border-gray-300 rounded-md
          px-3 py-2 leading-tight bg-white text-left
          focus:outline-none focus:border-black 
          focus:ring-0 appearance-none flex items-center justify-between
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"}
          ${isOpen ? "border-black" : ""}
          transition-all duration-200
        `}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : 'Select'}
        </span>
        <span className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      <label
        className={`
          absolute left-3 bg-white px-1 transition-all duration-200
          pointer-events-none
          ${isFocused || hasValue || isOpen
            ? "text-xs -top-2 text-black"
            : "text-gray-500 top-3"}
        `}
      >
        {label}
      </label>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-full rounded-xl shadow-lg z-50 overflow-hidden border"
          style={{
            background: `
              linear-gradient(to bottom left, rgba(173, 216, 230, 0.4) 0%, transparent 20%),
              linear-gradient(to top right, rgba(255, 182, 193, 0.4) 0%, transparent 20%),
              white
            `
          }}
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left transition-colors duration-150"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      <ErrorMessage
        name={name}
        component="p"
        className="text-red-500 text-sm font-semibold mt-1"
      />
    </div>
  );
};

export default CustomDropdown;