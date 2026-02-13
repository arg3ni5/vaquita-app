/**
 * Sanitizes an ID string to ensure it's safe and consistent for use in the database
 * @param {string|null|undefined} id - The ID to sanitize
 * @returns {string} - A sanitized ID string (lowercase, alphanumeric with hyphens, max 100 chars)
 */
export const sanitizeId = (id) => {
  return (id ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 100);
};

/**
 * Sanitizes a name string to remove potentially problematic characters
 * @param {string} name - The name to sanitize
 * @returns {string} - A sanitized name string
 */
export const sanitizeName = (name) => {
  return (name ?? "")
    .toString()
    .trim()
    .replace(/[<>'"&]/g, "") // Remove potentially problematic characters
    .slice(0, 100);
};
