import type { FormFieldBlock } from '@payloadcms/plugin-form-builder/types'
import type { FieldRow } from './types'

/**
 * Groups form fields into rows based on their width property.
 * Fields are placed in rows where the total width does not exceed 100%.
 *
 * @param fields - Array of form field blocks to group
 * @returns Array of field rows
 */
export function groupFieldsIntoRows(fields: FormFieldBlock[]): FieldRow[] {
  const rows: FieldRow[] = []
  let currentRow: FormFieldBlock[] = []
  let currentRowWidth = 0

  for (const field of fields) {
    const fieldWidth = getFieldWidth(field)

    // If adding this field would exceed 100%, start a new row
    if (currentRowWidth + fieldWidth > 100) {
      rows.push([...currentRow])
      currentRow = [field]
      currentRowWidth = fieldWidth
    } else {
      // Add to current row
      currentRow.push(field)
      currentRowWidth += fieldWidth
    }
  }

  // Add the last row if it has any fields
  if (currentRow.length > 0) {
    rows.push(currentRow)
  }

  return rows
}

/**
 * Extracts and normalizes the width value from a field.
 *
 * @param field - Form field block
 * @returns Numeric width value (defaults to 100 if not specified)
 */
export function getFieldWidth(field: FormFieldBlock): number {
  if (!('width' in field) || !field.width) {
    return 100
  }
  return Number(field.width)
}

/**
 * Determines if a field should span the full width of its container.
 * Fields are considered full width if they have no width, width of 100, or width > 50.
 *
 * @param field - Form field block
 * @returns True if field should be full width
 */
export function isFieldFullWidth(field: FormFieldBlock): boolean {
  const width = getFieldWidth(field)
  return width === 100 || width > 50
}

/**
 * Transforms form data object into submission format.
 *
 * @param data - Form data from react-hook-form
 * @returns Array of field/value pairs for API submission
 */
export function transformFormDataForSubmission(data: Record<string, unknown>) {
  return Object.entries(data).map(([name, value]) => ({
    field: name,
    value,
  }))
}

/**
 * Generates a stable key for a field within a row.
 * Uses field name if available, falls back to index-based key.
 *
 * @param field - Form field block
 * @param rowIndex - Index of the row
 * @param fieldIndex - Index of the field within the row
 * @returns Stable key string
 */
export function generateFieldKey(
  field: FormFieldBlock,
  rowIndex: number,
  fieldIndex: number,
): string {
  // Use field name for stable key if available
  if ('name' in field && field.name) {
    return `field-${field.name}`
  }
  // Fallback to index-based key
  return `field-${rowIndex}-${fieldIndex}`
}

/**
 * Generates a stable key for a row.
 *
 * @param row - Array of fields in the row
 * @param rowIndex - Index of the row
 * @returns Stable key string
 */
export function generateRowKey(row: FormFieldBlock[], rowIndex: number): string {
  // Try to create a stable key from field names
  const fieldNames = row
    .map((field) => ('name' in field && field.name ? field.name : ''))
    .filter(Boolean)
    .join('-')

  if (fieldNames) {
    return `row-${fieldNames}`
  }

  // Fallback to index-based key
  return `row-${rowIndex}`
}
