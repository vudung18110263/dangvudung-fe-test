"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Check, X, AlertCircle } from "lucide-react";

interface EditableCellProps {
  value: string;
  onSave: (value: string) => void;
  fieldType?: "text" | "select" | "email" | "required";
  options?: string[];
  multiline?: boolean;
  placeholder?: string;
  validation?: (value: string) => string | null;
}

export function EditableCell({ value, onSave, fieldType = "text", options = [], multiline = false, placeholder, validation }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    setEditValue(value || "");
    setError(null);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.type !== "select-one") {
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [isEditing]);

  const validateValue = (val: string): string | null => {
    // Custom validation first
    if (validation) {
      const customError = validation(val);
      if (customError) return customError;
    }

    // Built-in validations
    if (fieldType === "required" && !val.trim()) {
      return "This field is required";
    }

    if (fieldType === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      return "Please enter a valid email address";
    }

    if (fieldType === "select" && val && !options.includes(val)) {
      return "Please select a valid option";
    }

    return null;
  };

  const handleSave = (value?: string) => {
    const finalValue = value ?? editValue;

    const validationError = validateValue(finalValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    onSave(finalValue);
    setIsEditing(false);
    setError(null);
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Enter" && multiline && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditValue(e.target.value);

    // if (fieldType === "select") onSave(e.target.value);
    // handleSave();
    onSave(e.target.value)
    if (error) {
      setError(null);
    }
  };

  if (isEditing) {
    return (
      <div className="relative">
        <div className="flex items-center gap-1">
          {fieldType === "select" ? (
            <select
              ref={inputRef as React.RefObject<HTMLSelectElement>}
              value={editValue}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={`max-w-max bg-background border rounded px-2 py-1 text-sm focus:border-none focus:outline-none focus:ring-0 focus:ring-primary ${
                error ? "border-destructive focus:ring-destructive" : "border-ring"
              }`}
            >
              <option value="">Select...</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`flex-1 bg-background border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                error ? "border-destructive focus:ring-destructive" : "border-ring"
              }`}
              rows={2}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={fieldType === "email" ? "email" : "text"}
              value={editValue}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`w-max flex-1 bg-background border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                error ? "border-destructive focus:ring-destructive" : "border-ring"
              }`}
            />
          )}

          {/* Action buttons */}
          {/* <div className="flex items-center gap-1">
            <button onClick={handleBlur} className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors" title="Save (Enter)">
              <Check className="h-3 w-3" />
            </button>
            <button onClick={handleCancel} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors" title="Cancel (Esc)">
              <X className="h-3 w-3" />
            </button>
          </div> */}
        </div>

        {/* Error message */}
        {error && (
          <div className="absolute top-full left-0 mt-1 flex items-center gap-1 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded border border-destructive/20 whitespace-nowrap z-10">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors min-h-[1.5rem] flex items-center group"
      title="Click to edit"
    >
      <span className="line-clamp-2">{value || "Click to edit"}</span>
      <span className="line-clamp-2 ml-auto opacity-0 group-hover:opacity-100 text-xs text-muted-foreground transition-opacity">✏️</span>
    </div>
  );
}
