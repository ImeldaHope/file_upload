import Image from "next/image";
import CSVUploadForm from "@/components/upload-form";

export default function Home() {
  return (
    <div className="font-sans pb-8 bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="w-full min-h-screen  py-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                Invoice Data Processor
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Upload your CSV invoice data and we'll process it efficiently
                with validation, batch processing, and secure storage in
                PostgreSQL.
              </p>
            </div>

            <CSVUploadForm />
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            CSV Format Requirements
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-sm max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-50 p-3 rounded">
                <div className="font-medium text-slate-900">InvoiceNo</div>
                <div className="text-slate-600">Invoice identifier</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="font-medium text-slate-900">StockCode</div>
                <div className="text-slate-600">Product code</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="font-medium text-slate-900">Description</div>
                <div className="text-slate-600">Product description</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="font-medium text-slate-900">Quantity</div>
                <div className="text-slate-600">Number (integer)</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="font-medium text-slate-900">InvoiceDate</div>
                <div className="text-slate-600">Date (YYYY-MM-DD)</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="font-medium text-slate-900">UnitPrice</div>
                <div className="text-slate-600">Price (decimal)</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="font-medium text-slate-900">CustomerID</div>
                <div className="text-slate-600">Customer identifier</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="font-medium text-slate-900">Country</div>
                <div className="text-slate-600">Country name</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
