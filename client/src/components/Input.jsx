function Input({ id, label, type = "text", value, onChange, placeholder = "", error = "", helpText = "", required = false, autoComplete, name }) {
  const errorId = error ? `${id}-error` : undefined;
  const helpId = helpText ? `${id}-help` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="field-group">
      <label className="field-label" htmlFor={id}>
        {label}{required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        className={`field-input ${error ? "field-input-error" : ""}`.trim()}
        id={id}
        name={name || id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      />
      {helpText ? <p className="field-help" id={helpId}>{helpText}</p> : null}
      {error ? <p className="field-error" id={errorId} role="alert">{error}</p> : null}
    </div>
  );
}

export default Input;
