function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled = false
}) {
  const styles = {
    primary: "bg-blue-600 text-white",
    danger: "bg-red-600 text-white",
    secondary: "bg-gray-200 text-gray-800"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

export default Button;