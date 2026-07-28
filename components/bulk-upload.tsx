"use client";

import { useCallback, useRef, useState } from "react";
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Trash2,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type BulkOrderResult,
  type BulkParseError,
  bulkResultsToCsv,
  bulkResultsToXlsxBlob,
  computeBulkResults,
  generateBulkTemplateCsv,
  generateBulkTemplateXlsxBlob,
  parseBulkOrdersCsv,
  parseBulkOrdersXlsx,
  summarizeBulkResults,
} from "@/lib/bulkOrders";
import { COURIER_DOT } from "@/lib/courierCalculators";
import { useLanguage } from "@/lib/language-store";
import { cn, formatBDT } from "@/lib/utils";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadTextFile(filename: string, content: string) {
  downloadBlob(filename, new Blob([content], { type: "text/csv;charset=utf-8;" }));
}

const EXCEL_EXTENSION_RE = /\.xlsx?$/i;

export function BulkUpload() {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [results, setResults] = useState<BulkOrderResult[]>([]);
  const [errors, setErrors] = useState<BulkParseError[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);

    if (EXCEL_EXTENSION_RE.test(file.name)) {
      parseBulkOrdersXlsx(file).then(({ rows, errors: parseErrors }) => {
        setResults(computeBulkResults(rows));
        setErrors(parseErrors);
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const { rows, errors: parseErrors } = parseBulkOrdersCsv(text);
      setResults(computeBulkResults(rows));
      setErrors(parseErrors);
    };
    reader.readAsText(file);
  }, []);

  const summary = summarizeBulkResults(results);

  const reset = () => {
    setFileName(null);
    setResults([]);
    setErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.bulkTitle}</CardTitle>
          <CardDescription>{t.bulkDesc}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            )}
          >
            <Upload className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">{t.dropText}</p>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {t.browseFiles}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            {fileName && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileSpreadsheet className="size-3.5" /> {fileName}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  downloadTextFile(
                    "bulk-orders-template.csv",
                    generateBulkTemplateCsv(),
                  )
                }
              >
                <Download className="size-3.5" /> {t.csvTemplate}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={async () =>
                  downloadBlob(
                    "bulk-orders-template.xlsx",
                    await generateBulkTemplateXlsxBlob(),
                  )
                }
              >
                <Download className="size-3.5" /> {t.excelTemplate}
              </Button>
            </div>
            {(results.length > 0 || errors.length > 0) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={reset}
              >
                <Trash2 className="size-3.5" /> {t.clear}
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {t.columnsPrefix} <code>order_id</code>, <code>location</code> (Inside
            Dhaka / Suburbs / Outside Dhaka), <code>weight_kg</code>,{" "}
            <code>product_price</code>, <code>cod</code> (yes/no).
          </p>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-destructive">
              <AlertTriangle className="size-4" /> {t.rowsSkipped(errors.length)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
              {errors.map((error, index) => (
                <li key={index}>
                  {error.rowNumber > 0 ? t.rowLabel(error.rowNumber) : ""}
                  {error.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>{t.ordersProcessed}</CardDescription>
                <CardTitle className="text-2xl">
                  {summary.totalOrders}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>{t.autoSplitTotal}</CardDescription>
                <CardTitle className="text-2xl">
                  {formatBDT(summary.autoSplitTotal)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-primary/40 bg-primary/8 dark:bg-primary/6">
              <CardHeader>
                <CardDescription>
                  {summary.bestSingleCourier && t.savingsVsAll(summary.bestSingleCourier.courier)}
                </CardDescription>
                <CardTitle className="text-2xl text-primary dark:text-ring">
                  {formatBDT(summary.savings)}
                  {summary.savingsPct > 0 && (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      ({summary.savingsPct.toFixed(0)}%)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t.splitBreakdownTitle}</CardTitle>
              <CardDescription>{t.splitBreakdownDesc}</CardDescription>
              <CardAction>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() =>
                      downloadTextFile(
                        "auto-split-results.csv",
                        bulkResultsToCsv(results),
                      )
                    }
                  >
                    <Download className="size-3.5" /> {t.exportCsv}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={async () =>
                      downloadBlob(
                        "auto-split-results.xlsx",
                        await bulkResultsToXlsxBlob(results),
                      )
                    }
                  >
                    <Download className="size-3.5" /> {t.exportExcel}
                  </Button>
                </div>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {summary.perCourierTotals.map((entry) => (
                <Badge key={entry.courier} variant="outline" className="gap-1.5 py-1">
                  <span
                    className={`size-2 rounded-full ${COURIER_DOT[entry.courier]}`}
                  />
                  {t.courierSplitSummary(entry.courier, entry.orderCount, formatBDT(entry.total))}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.tableOrder}</TableHead>
                    <TableHead>{t.tableZone}</TableHead>
                    <TableHead>{t.tableWeight}</TableHead>
                    <TableHead>{t.tablePrice}</TableHead>
                    <TableHead>{t.tableCod}</TableHead>
                    <TableHead>{t.tableCourier}</TableHead>
                    <TableHead className="text-right">{t.tableCharge}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.rowNumber}>
                      <TableCell className="font-medium">
                        {result.orderId}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {result.best.zoneLabel}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {result.weightKg}kg
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatBDT(result.productPrice)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {result.isCOD ? t.codYes : t.codNo}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={`size-2 rounded-full ${COURIER_DOT[result.best.courier]}`}
                          />
                          {result.best.courier}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatBDT(result.best.totalCharge)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {results.length === 0 && errors.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t.bulkEmptyState}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
