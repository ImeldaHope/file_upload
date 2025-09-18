import { NextResponse } from "next/server";
import Papa from "papaparse";
import { initializeDatabase, insertInvoicesBatch } from "@/lib/postgresdb";
import { InvoiceRecord } from "@/types";
import { validateCSVHeaders, validateCSVRow } from "@/lib/validator";
import { parse } from "date-fns";

const BATCH_SIZE = 100;

export async function POST(req: Request) {
  try {
    await initializeDatabase();

    const formData = await req.formData();
    const file = formData.get("csvFile") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No CSV file uploaded" },
        { status: 400 }
      );
    }

    const csvContent = await file.text();

    const results = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.replace(/\s+/g, ""),
    });

    if (results.errors && results.errors.length > 0) {
      const firstError = results.errors[0];
      return NextResponse.json(
        {
          error: "Failed to parse CSV file",
          details: firstError?.message ?? "Unknown parse error",
          parseErrors: results.errors,
        },
        { status: 400 }
      );
    }

    const headers = results.meta.fields || [];
    const headerValidation = validateCSVHeaders(headers);
    if (!headerValidation.isValid) {
      return NextResponse.json(
        {
          error: "Invalid CSV format",
          details: headerValidation.errors,
          missingHeaders: headerValidation.missingHeaders,
          extraHeaders: headerValidation.extraHeaders,
        },
        { status: 400 }
      );
    }

    const validRows: InvoiceRecord[] = [];
    const validationErrors: string[] = [];

    for (let i = 0; i < results.data.length; i++) {
      const row = results.data[i];
      const rowErrors = validateCSVRow(row, i);

      if (rowErrors.length) {
        validationErrors.push(...rowErrors);
        if (validationErrors.length >= 10) {
          validationErrors.push("...and possibly more errors");
          break;
        }
      } else {
        validRows.push(normalizeRow(row));
      }
    }

    if (validationErrors.length) {
      return NextResponse.json(
        {
          error: "Data validation failed",
          details: validationErrors,
          totalRows: results.data.length,
          validRows: validRows.length,
        },
        { status: 400 }
      );
    }

    let totalInserted = 0;
    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      totalInserted += await insertInvoicesBatch(
        validRows.slice(i, i + BATCH_SIZE)
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "CSV file processed successfully",
        totalRows: results.data.length,
        insertedRows: totalInserted,
        batches: Math.ceil(validRows.length / BATCH_SIZE),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: error?.message ?? "Unknown" },
      { status: 500 }
    );
  }
}

function normalizeRow(row: any): InvoiceRecord {
  const invoiceDate = parse(row.InvoiceDate, "M/d/yyyy HH:mm", new Date());
  return {
    invoice_no: row.invoiceno,
    stock_code: row.stockcode,
    description: row.description,
    quantity: parseInt(row.quantity, 10),
    invoice_date: invoiceDate.toISOString(),
    unit_price: parseFloat(row.unitprice),
    customer_id: row.customerid,
    country: row.country,
  };
}
