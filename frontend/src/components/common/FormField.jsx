import React from 'react';

export default function FormField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  required = false,
  placeholder = '',
  rows = 4,
  options = [],
  children,
  ...props
}) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          <span>
            {label}
            {required && <span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span>}
          </span>
        </label>
      )}

      {children ? (
        children
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className="form-textarea"
          required={required}
          {...props}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          className="form-select"
          required={required}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="form-input"
          required={required}
          {...props}
        />
      )}

      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

