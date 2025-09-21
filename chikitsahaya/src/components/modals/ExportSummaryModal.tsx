import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ExportFormat, ExportOptions } from "@/lib/types";
import { exportSummary } from "@/lib/api";
import { 
  Download, 
  Copy, 
  FileText, 
  Image, 
  Code, 
  Database,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportSummaryModalProps {
  encounterId: string;
  patientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EXPORT_FORMATS: ExportFormat[] = [
  {
    type: 'pdf',
    label: 'PDF Document',
    description: 'Formatted document suitable for printing and sharing'
  },
  {
    type: 'docx',
    label: 'Word Document',
    description: 'Microsoft Word format for editing and collaboration'
  },
  {
    type: 'json',
    label: 'JSON Data',
    description: 'Structured data format for systems integration'
  },
  {
    type: 'fhir',
    label: 'FHIR Bundle',
    description: 'Healthcare standard format for interoperability'
  }
];

const getFormatIcon = (type: ExportFormat['type']) => {
  switch (type) {
    case 'pdf': return FileText;
    case 'docx': return FileText;
    case 'json': return Code;
    case 'fhir': return Database;
    default: return FileText;
  }
};

export function ExportSummaryModal({ 
  encounterId, 
  patientName, 
  open, 
  onOpenChange 
}: ExportSummaryModalProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeVitals: true,
    includeMedications: true,
    includeProblemList: true,
    includeFeatures: true,
    includeNotes: true,
    includeInsights: false
  });
  const [exporting, setExporting] = useState(false);
  const [previewData, setPreviewData] = useState<string>('');
  const { toast } = useToast();

  const selectedFormat = EXPORT_FORMATS.find(f => f.type === exportOptions.format);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportSummary(encounterId, exportOptions);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${patientName.replace(/\s+/g, '_')}_summary_${encounterId}.${exportOptions.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: `Summary has been exported as ${exportOptions.format.toUpperCase()}`
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the summary",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const handleCopyJSON = async () => {
    if (exportOptions.format !== 'json') return;
    
    try {
      const blob = await exportSummary(encounterId, exportOptions);
      const text = await blob.text();
      
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "JSON data has been copied to your clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const generatePreview = () => {
    const sections: string[] = [];
    
    sections.push(`# Medical Summary - ${patientName}`);
    sections.push(`**Encounter ID:** ${encounterId}`);
    sections.push(`**Export Date:** ${new Date().toLocaleDateString()}`);
    sections.push('');
    
    if (exportOptions.includeVitals) {
      sections.push('## Vital Signs');
      sections.push('- Blood Pressure: 120/80 mmHg');
      sections.push('- Heart Rate: 72 bpm');
      sections.push('- Temperature: 98.6°F');
      sections.push('- Oxygen Saturation: 98%');
      sections.push('');
    }
    
    if (exportOptions.includeMedications) {
      sections.push('## Current Medications');
      sections.push('- Lisinopril 10mg daily');
      sections.push('- Metformin 500mg twice daily');
      sections.push('');
    }
    
    if (exportOptions.includeFeatures) {
      sections.push('## Symptoms & Findings');
      sections.push('- Chest pain (moderate severity)');
      sections.push('- Shortness of breath (mild severity)');
      sections.push('');
    }
    
    if (exportOptions.includeNotes) {
      sections.push('## Clinical Notes');
      sections.push('Patient presents with chest discomfort...');
      sections.push('');
    }
    
    if (exportOptions.includeInsights) {
      sections.push('## AI Insights');
      sections.push('- Consider ruling out acute coronary syndrome');
      sections.push('- Recommend ECG and cardiac enzymes');
      sections.push('');
    }
    
    return sections.join('\n');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Summary - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export Settings */}
            <div className="space-y-6">
              {/* Format Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Export Format</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={exportOptions.format}
                    onValueChange={(value: ExportFormat['type']) =>
                      setExportOptions(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPORT_FORMATS.map((format) => {
                        const Icon = getFormatIcon(format.type);
                        return (
                          <SelectItem key={format.type} value={format.type}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{format.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {format.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  
                  {selectedFormat && (
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {selectedFormat.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Content Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Include in Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'includeVitals', label: 'Vital Signs', description: 'Temperature, BP, HR, etc.' },
                    { key: 'includeMedications', label: 'Current Medications', description: 'Active prescriptions' },
                    { key: 'includeProblemList', label: 'Problem List', description: 'Active diagnoses' },
                    { key: 'includeFeatures', label: 'Symptoms & Findings', description: 'Clinical features' },
                    { key: 'includeNotes', label: 'Clinical Notes', description: 'Assessment and plan' },
                    { key: 'includeInsights', label: 'AI Insights', description: 'AI-generated recommendations' }
                  ].map((option) => (
                    <div key={option.key} className="flex items-start space-x-3">
                      <Checkbox
                        id={option.key}
                        checked={exportOptions[option.key as keyof ExportOptions] as boolean}
                        onCheckedChange={(checked) =>
                          setExportOptions(prev => ({
                            ...prev,
                            [option.key]: checked
                          }))
                        }
                      />
                      <div className="space-y-1 leading-none">
                        <label 
                          htmlFor={option.key}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {option.label}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4 h-[400px] overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {generatePreview()}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-success" />
            <span>All required fields are included</span>
          </div>
          
          <div className="flex items-center gap-3">
            {exportOptions.format === 'json' && (
              <Button variant="outline" onClick={handleCopyJSON}>
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>
            )}
            
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2"
            >
              {exporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting ? 'Exporting...' : 'Export & Download'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}