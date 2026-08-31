function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = "Email is required.";
  else if (!isValidEmail(email.trim())) errors.email = "Enter a valid email address.";

  if (!password) errors.password = "Password is required.";
  else if (password.length < 8) errors.password = "Password must be at least 8 characters.";
  return errors;
}

export function validateRegistration({ name, email, password }) {
  const errors = validateLogin({ email, password });
  if (!name.trim()) errors.name = "Name is required.";
  else if (name.trim().length < 2) errors.name = "Name must contain at least 2 characters.";
  return errors;
}

export function validateWebsite({ name, url, authorizationConfirmed }) {
  const errors = {};
  if (!name.trim()) errors.name = "Website name is required.";

  if (!url.trim()) errors.url = "Website URL is required.";
  else if (!isHttpUrl(url.trim())) errors.url = "Enter a complete http:// or https:// URL.";

  if (!authorizationConfirmed) {
    errors.authorizationConfirmed = "Confirm that you own this website or have permission to assess it.";
  }
  return errors;
}
