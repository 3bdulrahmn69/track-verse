'use client';

import { useState, useRef, useEffect } from 'react';
import { MdCalendarToday, MdArrowBack, MdArrowForward } from 'react-icons/md';

interface DatePickerProps {
  value?: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  label?: string;
  error?: string;
  minDate?: string; // YYYY-MM-DD format
  maxDate?: string; // YYYY-MM-DD format
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  label,
  error,
  minDate,
  maxDate,
  placeholder = 'Select date',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [viewDate, setViewDate] = useState(
    value ? new Date(value) : new Date()
  );
  const [dropdownPosition, setDropdownPosition] = useState<'down' | 'up'>(
    'down'
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calculateDropdownPosition = () => {
    if (!containerRef.current) return 'down';

    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 320; // Approximate height of dropdown

    // Check if there's enough space below
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow >= dropdownHeight) {
      return 'down';
    } else if (spaceAbove >= dropdownHeight) {
      return 'up';
    } else {
      // If neither has enough space, prefer down but adjust if needed
      return spaceBelow > spaceAbove ? 'down' : 'up';
    }
  };

  useEffect(() => {
    if (isOpen) {
      setDropdownPosition(calculateDropdownPosition());
    }
  }, [isOpen]);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return '';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleYearChange = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
  };

  const handleDateSelect = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (!isDateDisabled(date)) {
      setSelectedDate(date);
      onChange(formatDate(date));
      setIsOpen(false);
    }
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Render day names
    const dayNameElements = dayNames.map((name) => (
      <div
        key={name}
        className="text-center text-xs font-medium text-muted-foreground py-2"
      >
        {name}
      </div>
    ));

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Render days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;
      const isDisabled = isDateDisabled(date);
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === month &&
        new Date().getFullYear() === year;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          disabled={isDisabled}
          className={`
            p-2 rounded-lg text-sm transition-all
            ${
              isSelected
                ? 'bg-primary text-primary-foreground font-semibold'
                : isToday
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-muted text-foreground'
            }
            ${
              isDisabled
                ? 'opacity-40 cursor-not-allowed hover:bg-transparent'
                : 'cursor-pointer'
            }
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {dayNameElements}
        {days}
      </div>
    );
  };

  const currentYear = viewDate.getFullYear();
  const minYear = minDate ? new Date(minDate).getFullYear() : 1900;
  const maxYear = maxDate
    ? new Date(maxDate).getFullYear()
    : new Date().getFullYear();

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 rounded-xl
          bg-card
          border-2 transition-all
          ${
            error
              ? 'border-destructive'
              : isOpen
              ? 'border-primary'
              : 'border-border'
          }
          hover:border-primary
          flex items-center justify-between
          text-left text-card-foreground
        `}
      >
        <span className={selectedDate ? '' : 'text-muted-foreground'}>
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </span>
        <MdCalendarToday className="text-xl text-muted-foreground" />
      </button>

      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute z-50 w-full bg-card rounded-xl shadow-lg border border-border p-4
            ${dropdownPosition === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'}
          `}
        >
          {/* Month and Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <MdArrowBack className="text-xl text-muted-foreground" />
            </button>

            <div className="flex items-center gap-2">
              <select
                value={viewDate.getMonth()}
                onChange={(e) =>
                  setViewDate(
                    new Date(currentYear, parseInt(e.target.value), 1)
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium border-none focus:ring-2 focus:ring-primary"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium border-none focus:ring-2 focus:ring-primary"
              >
                {Array.from(
                  { length: maxYear - minYear + 1 },
                  (_, i) => maxYear - i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <MdArrowForward className="text-xl text-muted-foreground" />
            </button>
          </div>

          {/* Calendar Grid */}
          {renderCalendar()}
        </div>
      )}
    </div>
  );
}
