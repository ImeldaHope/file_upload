import { Pool } from "pg";
import { InvoiceRecord } from "@/types";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_no VARCHAR(50) NOT NULL,
        stock_code VARCHAR(50) NOT NULL,
        description TEXT,
        quantity INTEGER NOT NULL,
        invoice_date TIMESTAMP NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        customer_id VARCHAR(50) NOT NULL,
        country VARCHAR(100) NOT NULL
      );
    `);
  } finally {
    client.release();
  }
};

export const insertInvoicesBatch = async (records: InvoiceRecord[]) => {
  if (records.length === 0) return 0;

  const client = await pool.connect();
  try {
    const values: any[] = [];
    const placeholders: string[] = [];

    records.forEach((record, index) => {
      const baseIndex = index * 8;
      placeholders.push(
        `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${
          baseIndex + 4
        }, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${
          baseIndex + 8
        })`
      );
      values.push(
        record.invoice_no,
        record.stock_code,
        record.description,
        record.quantity,
        new Date(record.invoice_date),
        record.unit_price,
        record.customer_id,
        record.country
      );
    });

    const query = `
      INSERT INTO invoices (invoice_no, stock_code, description, quantity, invoice_date, unit_price, customer_id, country)
      VALUES ${placeholders.join(", ")}
    `;

    await client.query(query, values);
    return records.length;
  } finally {
    client.release();
  }
};

export default pool;
