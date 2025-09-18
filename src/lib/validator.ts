import { ValidationResult } from "@/types";

export const REQUIRED_HEADERS = [
  "InvoiceNo",
  "StockCode",
  "Description",
  "Quantity",
  "InvoiceDate",
  "UnitPrice",
  "CustomerID",
  "Country",
];

export const validateCSVHeaders = (headers: string[]): ValidationResult => {
  const normalizedHeaders = headers.map((h) => h.trim());
  const missingHeaders = REQUIRED_HEADERS.filter(
    (required) => !normalizedHeaders.includes(required)
  );

  const extraHeaders = normalizedHeaders.filter(
    (header) => !REQUIRED_HEADERS.includes(header) && header !== ""
  );

  const errors: string[] = [];

  if (missingHeaders.length > 0) {
    errors.push(`Missing required columns: ${missingHeaders.join(", ")}`);
  }

  if (extraHeaders.length > 0) {
    errors.push(`Unexpected columns found: ${extraHeaders.join(", ")}`);
  }

  return {
    isValid: missingHeaders.length === 0 && extraHeaders.length === 0,
    errors,
    missingHeaders,
    extraHeaders,
  };
};

export const validateCSVRow = (row: any, rowIndex: number): string[] => {
  const errors: string[] = [];

  if (!row.InvoiceNo?.toString().trim()) {
    errors.push(`Row ${rowIndex + 1}: InvoiceNo is required`);
  }

  if (!row.StockCode?.toString().trim()) {
    errors.push(`Row ${rowIndex + 1}: StockCode is required`);
  }

  if (!row.CustomerID?.toString().trim()) {
    errors.push(`Row ${rowIndex + 1}: CustomerID is required`);
  }

  if (!row.Country?.toString().trim()) {
    errors.push(`Row ${rowIndex + 1}: Country is required`);
  }

  const quantity = parseInt(row.Quantity);
  if (isNaN(quantity) || quantity < 0) {
    errors.push(
      `Row ${rowIndex + 1}: Quantity must be a valid positive number`
    );
  }

  const unitPrice = parseFloat(row.UnitPrice);
  if (isNaN(unitPrice) || unitPrice < 0) {
    errors.push(
      `Row ${rowIndex + 1}: UnitPrice must be a valid positive number`
    );
  }

  if (row.InvoiceDate) {
    const date = new Date(row.InvoiceDate);
    if (isNaN(date.getTime())) {
      errors.push(`Row ${rowIndex + 1}: InvoiceDate must be a valid date`);
    }
  } else {
    errors.push(`Row ${rowIndex + 1}: InvoiceDate is required`);
  }

  return errors;
};
