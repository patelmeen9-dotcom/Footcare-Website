"use client";

import { useEffect, useState } from "react";
import { Upload, CheckCircle2, AlertCircle, RotateCcw, Download, Loader2 } from "lucide-react";

interface ImportHistory {
  id: string;
  fileName: string;
  date: string;
  status: "SUCCESS" | "FAILED" | "ROLLED_BACK";
  created: number;
  updated: number;
  errors: number;
  canRollback?: boolean;
}

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  interface ImportedProductClient {
    id: string;
    articleNumber: string;
    name: string;
    brand: string;
    category: string;
    showroom: string;
    mrp: number;
    discount: number;
    finalPrice: number;
    images?: { filename: string; url: string; color?: string }[];
    missingImages?: string[];
  }
  interface ImportResult {
    success: boolean;
    importId: string;
    fileName: string;
    products?: ImportedProductClient[];
    summary: {
      created: number;
      updated: number;
      skipped: number;
      errors: number;
    };
    durationMs: number;
    rollbackWindowExpiry: string;
  }
  const [successReport, setSuccessReport] = useState<ImportResult | null>(null);
  const [history, setHistory] = useState<ImportHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [rollingBackId, setRollingBackId] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/import/history");
      const data = await res.json();
      if (res.ok && Array.isArray(data.logs)) {
        setHistory(data.logs);
        setHistoryError("");
      } else {
        setHistoryError(data.error || "Could not load import logs.");
      }
    } catch (err) {
      console.error("Failed to load import logs:", err);
      setHistoryError("Could not load import logs.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const MAX_IMPORT_BYTES = 100 * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setErrorDetails([]);
      setSuccessReport(null);

      if (selected.size > MAX_IMPORT_BYTES) {
        setFile(null);
        setStatusMessage("File is too large. Maximum size is 100MB.");
        e.target.value = "";
        return;
      }

      setFile(selected);
      setStatusMessage("");
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setStatusMessage("Uploading and parsing Excel sheet...");
    setErrorDetails([]);
    setSuccessReport(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessReport(data);
        setStatusMessage("Catalog parsed and updated successfully!");
        setFile(null);
        await loadHistory();
      } else {
        setStatusMessage(data.error || "Header validation failed.");
        if (data.errorDetails) {
          setErrorDetails(data.errorDetails);
        } else if (data.failedArticles?.length) {
          setErrorDetails(
            data.failedArticles.map(
              (item: { articleNumber: string; reason: string }) =>
                `${item.articleNumber}: ${item.reason}`
            )
          );
        }
        await loadHistory();
      }
    } catch (err) {
      console.error("Import error:", err);
      setStatusMessage("An unexpected system connection error occurred.");
    } finally {
      setUploading(false);
    }
  };

  const handleRollback = async (id: string) => {
    if (!confirm("Are you sure you want to rollback this import? This will delete all created products and restore previously updated entries.")) {
      return;
    }

    setRollingBackId(id);
    try {
      const res = await fetch("/api/import/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importId: id }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        await loadHistory();
        alert("Database rolled back successfully!");
      } else {
        alert(data.error || "Rollback operation failed.");
      }
    } catch (err) {
      console.error("Rollback error:", err);
      alert("Rollback operation failed.");
    } finally {
      setRollingBackId(null);
    }
  };

  // Mock template generator
  const downloadTemplate = () => {
    alert("Downloading Inventory_Template.xlsx (articleNumber, name, brand, category, showroom, mrp)");
  };

  return (
    <div className="flex flex-col gap-space-8 w-full max-w-6xl">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-border pb-space-4">
        <div>
          <h1 className="text-page-title font-bold text-primary tracking-tight">Inventory Import Center</h1>
          <p className="text-caption text-foreground/50">
            Upload Excel spreadsheets to perform bulk catalog creations and updates.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 border border-border bg-card font-semibold px-space-6 py-space-3 rounded-button text-caption hover:bg-secondary transition-colors cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Download Template
        </button>
      </div>

      {/* Main Grid: Upload box and History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-8 items-start">
        {/* Left Columns: Upload Zone */}
        <div className="lg:col-span-2 bg-card border border-border p-space-8 rounded-card shadow-soft-sm flex flex-col gap-space-6">
          <div>
            <h2 className="text-body-large font-bold text-foreground">Upload Spreadsheet or ZIP Package</h2>
            <p className="text-caption text-foreground/50 mt-0.5">
              Drag your file here or browse. Accepts .xlsx sheet or .zip packages (containing images/ folder and Inventory.xlsx).
            </p>
          </div>

          <form onSubmit={handleUploadSubmit} className="flex flex-col gap-space-4">
            <div className="border-2 border-dashed border-border hover:border-primary rounded-card p-12 text-center flex flex-col items-center justify-center gap-3 bg-secondary/10 cursor-pointer relative transition-colors">
              <input
                type="file"
                accept=".xlsx, .zip"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={handleFileChange}
              />
              <Upload className="h-10 w-10 text-foreground/30" />
              <div className="text-caption">
                {file ? (
                  <span className="font-bold text-primary">{file.name}</span>
                ) : (
                  <span className="text-foreground/50">Select or drop Inventory.xlsx or package.zip</span>
                )}
              </div>
              <span className="text-[10px] text-foreground/40 font-mono">Max size: 100MB</span>
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-button text-caption hover:bg-accent hover:text-accent-foreground transition-all shadow-soft-sm disabled:opacity-disabled cursor-pointer mt-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Import Package...
                </>
              ) : (
                "Run Import Engine"
              )}
            </button>
          </form>

          {/* Validation Result / Status block */}
          {statusMessage && (
            <div
              className={`p-space-4 rounded-button border text-caption flex flex-col gap-2 ${
                successReport
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {successReport ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                <span>{statusMessage}</span>
              </div>

              {successReport && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-emerald-200/50 text-[11px] font-semibold uppercase">
                  <div>Created: <span className="font-mono text-body font-bold">{successReport.summary.created}</span></div>
                  <div>Updated: <span className="font-mono text-body font-bold">{successReport.summary.updated}</span></div>
                  <div>Errors: <span className="font-mono text-body font-bold">{successReport.summary.errors}</span></div>
                </div>
              )}

              {errorDetails.length > 0 && (
                <ul className="list-disc pl-5 mt-2 text-[11px] flex flex-col gap-1">
                  {errorDetails.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Import Preview Section (PRD Image Mapping Requirements) */}
          {successReport && successReport.products && (
            <div className="border-t border-border pt-space-6 flex flex-col gap-space-4">
              <h3 className="text-body-large font-bold text-foreground">Import Package Verification Report</h3>
              <div className="flex flex-col gap-4">
                {successReport.products.map((prod: ImportedProductClient, idx: number) => (
                  <div key={idx} className="border border-border p-space-4 rounded-card bg-secondary/15 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex gap-space-4">
                      {/* Cover Thumbnail */}
                      <div className="h-16 w-16 bg-slate-100 border border-border rounded-button overflow-hidden flex items-center justify-center text-slate-400 select-none shrink-0">
                        {prod.images && prod.images.length > 0 ? (
                          <img src={prod.images[0].url} alt="Cover" className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-[9px] uppercase font-bold text-center leading-tight">No Cover</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-caption font-bold text-foreground leading-tight">{prod.name}</span>
                        <span className="font-mono text-label-small text-foreground/45">Art: {prod.articleNumber} • {prod.brand}</span>
                        <span className="text-[10px] text-foreground/60">Price: ₹{prod.finalPrice} • Discount: {prod.discount}%</span>
                        
                        {/* Matched thumbnails slider */}
                        {prod.images && prod.images.length > 1 && (
                          <div className="flex gap-1.5 mt-2 overflow-x-auto py-1">
                            {prod.images.map((img: { filename: string; url: string; color?: string }, imgIdx: number) => (
                              <div key={imgIdx} className="relative h-8 w-8 rounded overflow-hidden border border-border shrink-0" title={`Mapped: ${img.color || 'Default'}`}>
                                <img src={img.url} alt="sub" className="object-cover w-full h-full" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {prod.images ? prod.images.length : 0} Mapped
                      </span>
                      {prod.missingImages && prod.missingImages.length > 0 && (
                        <div className="flex flex-col items-end gap-1 mt-1">
                          <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Missing: {prod.missingImages.length}
                          </span>
                          <span className="text-[9px] text-red-600 font-mono leading-none">
                            {prod.missingImages.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: History list */}
        <div className="bg-card border border-border p-space-6 rounded-card shadow-soft-sm flex flex-col gap-space-6">
          <div>
            <h3 className="text-body-large font-bold text-foreground">Import Logs</h3>
            <p className="text-label-small text-foreground/45">Audit log of sheet uploads.</p>
          </div>

          <div className="flex flex-col gap-space-4 overflow-y-auto max-h-[450px]">
            {historyLoading ? (
              <p className="text-caption text-foreground/40">Loading import logs...</p>
            ) : historyError ? (
              <p className="text-caption text-red-600">{historyError}</p>
            ) : history.length === 0 ? (
              <p className="text-caption text-foreground/40">
                No imports yet. Logs will appear here after you run an import.
              </p>
            ) : (
              history.map((log, index) => (
              <div key={log.id ?? `log-${index}`} className="border-b border-border pb-4 last:border-b-0 last:pb-0 flex flex-col gap-2">
                <div className="flex items-center justify-between text-caption">
                  <span className="font-bold text-foreground/80 truncate max-w-[150px]">{log.fileName}</span>
                  <span className="text-[10px] text-foreground/40 font-mono">{log.date}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-[10px] text-foreground/50">
                    <span>C: {log.created}</span>
                    <span>U: {log.updated}</span>
                    {log.errors > 0 && <span className="text-red-600 font-bold">E: {log.errors}</span>}
                  </div>

                  {log.canRollback ? (
                    <button
                      onClick={() => handleRollback(log.id)}
                      disabled={rollingBackId === log.id}
                      className="flex items-center gap-1 text-[10px] text-red-600 font-semibold hover:underline disabled:opacity-50"
                    >
                      {rollingBackId === log.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3 w-3" />
                      )}
                      Undo
                    </button>
                  ) : (
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        log.status === "ROLLED_BACK"
                          ? "text-orange-600"
                          : log.status === "SUCCESS"
                            ? "text-emerald-700"
                            : "text-red-600"
                      }`}
                    >
                      {log.status}
                    </span>
                  )}
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
