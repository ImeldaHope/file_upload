interface UploadResult {
  success: boolean;
  message?: string;
  totalRows?: number;
  insertedRows?: number;
  batches?: number;
  error?: string;
  details?: string[];
  missingHeaders?: string[];
  extraHeaders?: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  missingHeaders?: string[];
  extraHeaders?: string[];
}

interface InvoiceRecord {
  invoice_no: string;
  stock_code: string;
  description: string;
  quantity: number;
  invoice_date: string;
  unit_price: number;
  customer_id: string;
  country: string;
}

export type { UploadResult, ValidationResult, InvoiceRecord };