"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, Download } from "lucide-react";
import { ImportResult } from "@/types/import";
import { validateExcelFile } from "@/lib/import-utils";
import { useToast } from "@/hooks/use-toast";

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ImportModal({ open, onOpenChange, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validationError = validateExcelFile(selectedFile);
    if (validationError) {
      toast({
        variant: "destructive",
        title: "❌ Lỗi file",
        description: validationError,
      });
      return;
    }

    setFile(selectedFile);
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("auth_token");
      const headers: HeadersInit = {};

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/cards/import", {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      setResult(data);

      if (data.success) {
        toast({
          title: "✅ Thành công",
          description: data.message,
          className: "border-green-500 bg-green-50 text-green-900",
        });

        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
            handleClose();
          }, 2000);
        }
      } else {
        toast({
          variant: "destructive",
          title: "⚠️ Có lỗi",
          description: data.message,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "❌ Lỗi",
        description: error.message || "Có lỗi xảy ra khi import",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setImporting(false);
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/template-import-cards.xlsx";
    link.download = "template-import-cards.xlsx";
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Cards từ Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Tải xuống file mẫu Excel để xem định dạng đúng. Ảnh bìa phải là:{" "}
                <strong>DigiLife, VNS, VN Sky, VN Sky VNS</strong>
              </span>
              <Button variant="outline" size="sm" onClick={downloadTemplate} className="ml-2">
                <Download className="h-4 w-4 mr-1" />
                Tải file mẫu Excel
              </Button>
            </AlertDescription>
          </Alert>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="excel-file">Chọn file Excel</Label>
            <div className="flex items-center gap-4">
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
              />
              {file && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileSpreadsheet className="h-3 w-3" />
                  {file.name}
                  <Button variant="ghost" size="sm" className="h-auto p-0 ml-1" onClick={() => setFile(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>

          {/* Import Button */}
          <div className="flex gap-2">
            <Button onClick={handleImport} disabled={!file || importing} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {importing ? "Đang import..." : "Import Cards"}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Đóng
            </Button>
          </div>

          {/* Progress */}
          {importing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Đang xử lý file...</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          )}

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  Kết quả Import
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-blue-600">{result.totalRows}</div>
                    <div className="text-sm text-muted-foreground">Tổng dòng</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-green-600">{result.successRows}</div>
                    <div className="text-sm text-muted-foreground">Thành công</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-red-600">{result.errorRows.length}</div>
                    <div className="text-sm text-muted-foreground">Lỗi</div>
                  </div>
                </div>

                <Alert className={result.success ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>

                {/* Error Details */}
                {result.errorRows.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-red-600">
                      Chi tiết lỗi ({result.errorRows.length} dòng):
                    </Label>
                    <ScrollArea className="h-32 w-full border rounded-md p-3">
                      <div className="space-y-2">
                        {result.errorRows.map((error, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium text-red-600">Dòng {error.row}:</div>
                            <ul className="list-disc list-inside ml-4 text-red-500">
                              {error.errors.map((err, errIndex) => (
                                <li key={errIndex}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
