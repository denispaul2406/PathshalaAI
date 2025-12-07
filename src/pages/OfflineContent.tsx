import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header, BottomNav } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Trash2, 
  FileText, 
  Wifi, 
  WifiOff,
  HardDrive,
  RefreshCw,
  Eye,
  Filter
} from "lucide-react";
import { AISarthi } from "@/components/AISarthi";
import { useOffline } from "@/hooks/useOffline";
import { 
  downloadPDFForOffline, 
  deleteOfflinePDF, 
  getOfflinePDF,
} from "@/services/offline";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { OfflinePDF } from "@/services/offline";
import { availablePDFs, getPDFsByExamType, type PDFMetadata } from "@/services/pdfs";
import { useAuth } from "@/hooks/useAuth";
import { getUserProgress } from "@/services/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OfflineContent() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { online, pdfs, storageUsage, refreshOfflineData, formatBytes } = useOffline();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [examType, setExamType] = useState<"SSC" | "Banking" | "All">("All");
  const [userExamType, setUserExamType] = useState<"SSC" | "Banking" | null>(null);

  // Load user's exam type
  useEffect(() => {
    if (user) {
      loadUserExamType();
    }
  }, [user]);

  const loadUserExamType = async () => {
    if (!user) return;
    try {
      const progress = await getUserProgress(user.uid);
      if (progress?.examType) {
        const type = progress.examType === "SSC" ? "SSC" : "Banking";
        setUserExamType(type);
        setExamType(type);
      }
    } catch (error) {
      console.error("Error loading user exam type:", error);
    }
  };

  // Filter PDFs based on selected exam type
  const filteredPDFs = examType === "All" 
    ? availablePDFs 
    : getPDFsByExamType(examType);

  const handleDownloadPDF = async (pdf: PDFMetadata) => {
    if (!online) {
      toast.error("Please connect to internet to download PDFs");
      return;
    }

    try {
      setDownloading(pdf.id);
      await downloadPDFForOffline(pdf.id, pdf.name, pdf.path);
      toast.success(`${pdf.name} downloaded successfully!`);
      await refreshOfflineData();
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF. Please check if the file exists.");
    } finally {
      setDownloading(null);
    }
  };

  const handleDeletePDF = async (id: string) => {
    try {
      await deleteOfflinePDF(id);
      toast.success("PDF deleted");
      await refreshOfflineData();
    } catch (error) {
      console.error("Error deleting PDF:", error);
      toast.error("Failed to delete PDF");
    }
  };

  const handleViewPDF = async (pdf: OfflinePDF) => {
    try {
      const offlinePdf = await getOfflinePDF(pdf.id);
      if (offlinePdf) {
        const url = URL.createObjectURL(offlinePdf.blob);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error("Error viewing PDF:", error);
      toast.error("Failed to open PDF");
    }
  };

  const isDownloaded = (id: string) => {
    return pdfs.some((pdf) => pdf.id === id);
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-20 md:pb-0">
      <Header />

      <main className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Offline Content 📥
              </h1>
              <p className="text-muted-foreground mt-1">
                Download PDFs from content bank for offline study
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {online ? (
                  <Wifi className="w-5 h-5 text-accent" />
                ) : (
                  <WifiOff className="w-5 h-5 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {online ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Storage Usage */}
        <Card variant="default" className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {formatBytes(storageUsage.total)}
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary">
                  {formatBytes(storageUsage.pdfs)}
                </div>
                <div className="text-xs text-muted-foreground">PDFs</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-accent">
                  {formatBytes(storageUsage.questions)}
                </div>
                <div className="text-xs text-muted-foreground">Questions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available PDFs */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-accent" />
                  Available PDFs ({filteredPDFs.length})
                </CardTitle>
                <Select value={examType} onValueChange={(value: "SSC" | "Banking" | "All") => setExamType(value)}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Exams</SelectItem>
                    <SelectItem value="SSC">SSC</SelectItem>
                    <SelectItem value="Banking">Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredPDFs.length > 0 ? (
                filteredPDFs.map((pdf) => {
                  const downloaded = isDownloaded(pdf.id);
                  return (
                    <div
                      key={pdf.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">{pdf.name}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {pdf.category}
                            </span>
                            {pdf.language !== "English" && (
                              <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                                {pdf.language}
                              </span>
                            )}
                            {downloaded && (
                              <span className="text-accent">✓ Downloaded</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={downloaded ? "outline" : "hero"}
                        size="sm"
                        onClick={() => handleDownloadPDF(pdf)}
                        disabled={downloading === pdf.id || (!online && !downloaded)}
                        className="flex-shrink-0 ml-2"
                      >
                        {downloading === pdf.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : downloaded ? (
                          "Re-download"
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No PDFs available for this exam type
                </div>
              )}
            </CardContent>
          </Card>

          {/* Downloaded PDFs */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-secondary" />
                Downloaded PDFs ({pdfs.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
              {pdfs.length > 0 ? (
                pdfs.map((pdf) => (
                  <div
                    key={pdf.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{pdf.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatBytes(pdf.size)} • {new Date(pdf.downloadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPDF(pdf)}
                        title="Open PDF"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePDF(pdf.id)}
                        title="Delete PDF"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No PDFs downloaded yet</p>
                  <p className="text-xs mt-1">Download PDFs from the left panel to view them offline</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
      <AISarthi />
    </div>
  );
}
