function Button({ children, variant = "primary", onClick, type = "button", disabled = false, className = "" }) {
  const variantClass = {
    primary: "button-primary",
    secondary: "button-secondary",
    danger: "button-danger",
    ghost: "button-ghost"
  }[variant] || "button-primary";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button ${variantClass} ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export default Button;
