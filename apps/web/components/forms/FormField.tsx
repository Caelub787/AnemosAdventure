import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, id, ...props }: FormFieldProps) {
  const fieldId = id ?? props.name;
  const errorId = `${fieldId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-slate-200">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus-visible:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/50"
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
