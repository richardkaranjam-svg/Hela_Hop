/**
 * Escapes a single CSV cell value per RFC 4180 and formula injection mitigation.
 * - Values starting with =, +, -, @, \t, \r are prepended with an apostrophe (')
 *   to prevent CSV injection / formula execution in spreadsheet software.
 * - Values containing quotes, commas, \r, or \n are wrapped in double quotes,
 *   with internal double quotes escaped as "".
 */
export function escapeCsvCell(
  input: string | number | null | undefined
): string {
  let val = input == null ? "" : String(input);
  if (/^[=+\-@\t\r]/.test(val)) {
    val = `'${val}`;
  }
  if (/[",\r\n]/.test(val)) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
