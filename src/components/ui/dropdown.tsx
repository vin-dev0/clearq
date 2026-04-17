"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

export function Dropdown({ trigger, children, align = "left", className }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[200px] rounded-lg border border-zinc-700 bg-zinc-900 p-1.5 shadow-xl shadow-black/30",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            {
              "left-0": align === "left",
              "right-0": align === "right",
              "left-1/2 -translate-x-1/2": align === "center",
            },
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
}

export function DropdownItem({
  icon,
  children,
  destructive,
  disabled,
  className,
  ...props
}: DropdownItemProps) {
  return (
    <div
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
        destructive
          ? "text-rose-400 hover:bg-rose-500/10"
          : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      {icon && <span className="text-zinc-500">{icon}</span>}
      {children}
    </div>
  );
}

export function DropdownDivider() {
  return <div className="my-1.5 h-px bg-zinc-800" />;
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
      {children}
    </div>
  );
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; icon?: React.ReactNode }>;
  placeholder?: string;
  className?: string;
}

export function Select({ value, onChange, options, placeholder = "Select...", className }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm",
          "transition-all duration-200 hover:border-zinc-600",
          isOpen && "border-teal-500 ring-2 ring-teal-500/20"
        )}
      >
        <span className={selectedOption ? "text-zinc-100" : "text-zinc-500"}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon}
              {selectedOption.label}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-zinc-500 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl shadow-black/30">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                option.value === value
                  ? "bg-teal-500/10 text-teal-400"
                  : "text-zinc-300 hover:bg-zinc-800"
              )}
            >
              {option.icon}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



