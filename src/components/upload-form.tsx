"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { UploadResult } from "@/types";

export default function CSVUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progressValue, setProgressValue] = useState(0);

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (
      selectedFile &&
      (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv"))
    ) {
      setFile(selectedFile);
      setResult(null);
    } else {
      setResult({
        success: false,
        error: "Please select a valid CSV file",
      });
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      setResult({
        success: false,
        error: "Please select a CSV file",
      });
      return;
    }

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("csvFile", file);
    

    try {
      const response = await fetch("/api/file_upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          totalRows: data.totalRows,
          insertedRows: data.insertedRows,
          batches: data.batches,
        });
        setProgressValue((data.insertedRows/data.totalRows) * 100);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setResult({
          success: false,
          error: data.error,
          details: data.details,
          missingHeaders: data.missingHeaders,
          extraHeaders: data.extraHeaders,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: "Network error occurred while uploading",
        details: error instanceof Error ? [error.message] : ["Unknown error"],
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CSV Invoice Upload
          </CardTitle>
          <CardDescription>
            Upload a CSV file containing invoice data. Required columns:
            InvoiceNo, StockCode, Description, Quantity, InvoiceDate, UnitPrice,
            CustomerID, Country
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mx-auto"
                >
                  Browse Files
                </Button>
              </div>
            </div>

            {file && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={!file || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {uploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing CSV file...</span>
              </div>
              <Progress value={progressValue} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Alert
          className={
            result.success
              ? "border-green-200 bg-green-50"
              : "border-destructive"
          }
        >
          <div className="flex">
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <div className="ml-3 flex-1 w-full">
              <AlertDescription className="w-full min-w-xl">
                {result.success ? (
                  <div className="space-y-2">
                    <p className="font-medium text-green-800">
                      {result.message}
                    </p>
                    <div className="text-sm text-green-700">
                      <p>Total rows processed: {result.totalRows}</p>
                      <p>Rows inserted: {result.insertedRows}</p>
                      <p>Processed in {result.batches} batches</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 border rounded-md bg-red-50">
                    <p className="font-medium text-red-700">{result.error}</p>

                    {result.missingHeaders &&
                      result.missingHeaders?.length > 0 && (
                        <div className="text-sm">
                          <p className="font-semibold text-red-600 mb-1">
                            Missing required columns:
                          </p>
                          <ul className="list-disc list-outside ml-6">
                            {result.missingHeaders.map((header, index) => (
                              <li key={index}>{header}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {result.extraHeaders && result.extraHeaders?.length > 0 && (
                      <div className="text-sm">
                        <p className="font-semibold text-red-600 mb-1">
                          Unexpected columns found:
                        </p>
                        <ul className="list-disc list-outside ml-6">
                          {result.extraHeaders.map((header, index) => (
                            <li key={index}>{header}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.details && (
                      <div className="text-sm">
                        <p className="font-semibold mb-1">Details:</p>
                        <ul className="list-disc list-outside ml-6 max-h-40 overflow-y-auto border-t pt-2">
                          {result.details?.map((detail, index) => (
                            <li key={index}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
}
