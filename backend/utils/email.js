import validator from "validator";

export const normalizeEmail = (value) => typeof value === "string"
  ? value.trim().toLowerCase()
  : "";

export const isValidEmail = (email) => email.length <= 254 && validator.isEmail(email, {
  allow_utf8_local_part: false,
  require_tld: true,
  ignore_max_length: false,
});

export function getValidatedEmail(response, value) {
  const email = normalizeEmail(value);
  if (!email || !isValidEmail(email)) {
    response.status(400).json({
      error: "Enter a valid email address, such as name@example.com.",
    });
    return null;
  }
  return email;
}
