import React, { useState, useEffect, useRef } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (option: Option | null) => void;
  className?: string;
  defaultValue?: string;
  value?: string | null;
  isDisabled?: boolean;
  menuAlign?: 'left' | 'right'; // New prop for alignment
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue,
  value,
  isDisabled = false,
  menuAlign = 'left', // Default to left alignment
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(() => {
    if (value !== undefined && value !== null) return value;
    if (defaultValue !== undefined) return defaultValue;
    return "";
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value || "");
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option | null) => {
    if (option) {
      setSelectedValue(option.value);
      onChange(option);
    } else {
      setSelectedValue("");
      onChange(null);
    }
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // Determine positioning classes based on alignment
  const positionClasses = menuAlign === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm text-left shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 overflow-hidden truncate ${
          selectedValue
            ? "text-gray-800 dark:text-white/90"
            : "text-gray-400 dark:text-gray-400"
        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {displayText}
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className={`absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-700 max-h-96 overflow-y-auto ${positionClasses}`}>
          {/* Placeholder option */}
          <div
            onClick={() => handleSelect(null)}
            className="px-4 py-2.5 text-sm text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 first:rounded-t-lg"
          >
            {placeholder}
          </div>
          {/* Regular options */}
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 last:rounded-b-lg ${
                option.value === selectedValue
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white/90 font-medium"
                  : "text-gray-700 dark:text-gray-400"
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
