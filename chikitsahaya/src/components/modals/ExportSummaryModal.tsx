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
  selectedDisease?: any;
  actionPlan?: any;
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
  onOpenChange,
  selectedDisease,
  actionPlan
}: ExportSummaryModalProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeVitals: true,
    includeMedications: true,
    includeProblemList: true,
    includeFeatures: true,
    includeNotes: true,
    includeInsights: true,
    includeDiagnosis: true,
    includeActionPlan: true
  });
  const [exporting, setExporting] = useState(false);
  const [previewData, setPreviewData] = useState<string>('');
  const { toast } = useToast();

  const selectedFormat = EXPORT_FORMATS.find(f => f.type === exportOptions.format);

  // Check if any content options are selected
  const hasSelectedContent = Object.entries(exportOptions).some(([key, value]) => 
    key.startsWith('include') && value === true
  );

  // Helper functions for generating different format previews
  const generateJSONPreview = (data: any) => {
    const jsonData: any = {
      patient: {
        name: `${data.firstName} ${data.lastName}`,
        medicalRecordNumber: data.medicalRecordNumber
      },
      encounterId,
      exportedAt: new Date().toISOString()
    };
    
    if (exportOptions.includeVitals) {
      jsonData.vitals = data.vitals;
    }
    
    if (exportOptions.includeMedications) {
      jsonData.medications = data.medications;
    }
    
    if (exportOptions.includeFeatures) {
      jsonData.symptoms = data.features;
    }
    
    if (exportOptions.includeNotes) {
      jsonData.clinicalNotes = data.notes;
    }
    
    if (exportOptions.includeInsights) {
      jsonData.aiInsights = [
        'Consider ruling out acute coronary syndrome based on symptoms',
        'Recommend ECG and cardiac enzyme testing',
        'Monitor vital signs closely for changes'
      ];
    }
    
    if (exportOptions.includeDiagnosis && selectedDisease) {
      jsonData.selectedDiagnosis = {
        name: selectedDisease.name,
        confidence: Math.round(selectedDisease.probability * 100),
        description: selectedDisease.description,
        isCustom: selectedDisease.isCustom || false
      };
    }
    
    if (exportOptions.includeActionPlan && actionPlan) {
      jsonData.treatmentPlan = {
        urgency: actionPlan.urgency,
        duration: actionPlan.estimatedDuration,
        followUpRequired: actionPlan.followUpRequired,
        steps: actionPlan.steps
      };
    }
    
    return JSON.stringify(jsonData, null, 2);
  };

  const generateFHIRPreview = (data: any) => {
    const fhirBundle: any = {
      resourceType: 'Bundle',
      id: encounterId,
      type: 'document',
      timestamp: new Date().toISOString(),
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            name: [{ given: [data.firstName], family: data.lastName }],
            identifier: [{ value: data.medicalRecordNumber }]
          }
        }
      ]
    };
    
    if (exportOptions.includeVitals) {
      fhirBundle.entry.push({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          category: [{ coding: [{ code: 'vital-signs' }] }],
          component: [
            { code: { display: 'Systolic BP' }, valueQuantity: { value: data.vitals.bloodPressureSystolic, unit: 'mmHg' } },
            { code: { display: 'Diastolic BP' }, valueQuantity: { value: data.vitals.bloodPressureDiastolic, unit: 'mmHg' } },
            { code: { display: 'Heart Rate' }, valueQuantity: { value: data.vitals.heartRate, unit: 'bpm' } }
          ]
        }
      });
    }
    
    if (exportOptions.includeInsights) {
      fhirBundle.entry.push({
        resource: {
          resourceType: 'ClinicalImpression',
          status: 'completed',
          subject: { reference: `Patient/${data.medicalRecordNumber}` },
          summary: 'AI-generated clinical insights and recommendations',
          finding: [
            { itemCodeableConcept: { text: 'Consider ruling out acute coronary syndrome' } },
            { itemCodeableConcept: { text: 'Recommend ECG and cardiac enzyme testing' } }
          ]
        }
      });
    }
    
    if (exportOptions.includeDiagnosis && selectedDisease) {
      fhirBundle.entry.push({
        resource: {
          resourceType: 'Condition',
          clinicalStatus: { coding: [{ code: 'active' }] },
          code: { text: selectedDisease.name },
          note: [{ text: selectedDisease.description }],
          meta: { 
            tag: selectedDisease.isCustom ? [{ code: 'doctor-added' }] : [{ code: 'ai-suggested' }]
          }
        }
      });
    }
    
    if (exportOptions.includeActionPlan && actionPlan) {
      fhirBundle.entry.push({
        resource: {
          resourceType: 'CarePlan',
          status: 'active',
          intent: 'plan',
          title: 'Treatment Plan',
          description: `${actionPlan.urgency} priority plan with estimated duration: ${actionPlan.estimatedDuration}`,
          activity: actionPlan.steps.map((step: any, index: number) => ({
            detail: {
              code: { text: step.title },
              status: 'not-started',
              description: step.description,
              scheduledTiming: step.estimatedTime ? { repeat: { duration: step.estimatedTime } } : undefined
            }
          }))
        }
      });
    }
    
    return JSON.stringify(fhirBundle, null, 2);
  };

  const generatePDFPreview = (data: any) => {
    let content = `MEDICAL SUMMARY\n`;
    content += `================\n\n`;
    content += `Patient: ${data.firstName} ${data.lastName}\n`;
    content += `MRN: ${data.medicalRecordNumber}\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n`;
    content += `Encounter ID: ${encounterId}\n\n`;
    
    if (exportOptions.includeVitals) {
      content += `VITAL SIGNS\n`;
      content += `-----------\n`;
      content += `Blood Pressure: ${data.vitals.bloodPressureSystolic}/${data.vitals.bloodPressureDiastolic} mmHg\n`;
      content += `Heart Rate: ${data.vitals.heartRate} bpm\n`;
      content += `Temperature: ${data.vitals.temperature}°F\n`;
      content += `Oxygen Saturation: ${data.vitals.oxygenSaturation}%\n\n`;
    }
    
    if (exportOptions.includeMedications) {
      content += `CURRENT MEDICATIONS\n`;
      content += `------------------\n`;
      data.medications.forEach((med: any) => {
        content += `• ${med.name} ${med.dosage} - ${med.frequency}\n`;
      });
      content += `\n`;
    }
    
    if (exportOptions.includeFeatures) {
      content += `SYMPTOMS & FINDINGS\n`;
      content += `------------------\n`;
      data.features.forEach((feature: any) => {
        content += `• ${feature.name}`;
        if (feature.severity) content += ` (${feature.severity})`;
        if (feature.description) content += ` - ${feature.description}`;
        content += `\n`;
      });
      content += `\n`;
    }
    
    if (exportOptions.includeInsights) {
      content += `AI INSIGHTS & RECOMMENDATIONS\n`;
      content += `-----------------------------\n`;
      content += `• Consider ruling out acute coronary syndrome based on symptoms\n`;
      content += `• Recommend ECG and cardiac enzyme testing\n`;
      content += `• Monitor vital signs closely for changes\n`;
      content += `• Patient may benefit from cardiology consultation\n`;
      content += `\n`;
    }
    
    if (exportOptions.includeDiagnosis && selectedDisease) {
      content += `SELECTED DIAGNOSIS\n`;
      content += `-----------------\n`;
      content += `Primary Diagnosis: ${selectedDisease.name}\n`;
      content += `Confidence: ${Math.round(selectedDisease.probability * 100)}%\n`;
      content += `Description: ${selectedDisease.description}\n`;
      if (selectedDisease.isCustom) {
        content += `Note: Doctor-added diagnosis\n`;
      }
      content += `\n`;
    }
    
    if (exportOptions.includeActionPlan && actionPlan) {
      content += `TREATMENT PLAN\n`;
      content += `-------------\n`;
      content += `Urgency: ${actionPlan.urgency.toUpperCase()}\n`;
      content += `Duration: ${actionPlan.estimatedDuration}\n`;
      content += `Follow-up Required: ${actionPlan.followUpRequired ? 'Yes' : 'No'}\n\n`;
      content += `Action Steps:\n`;
      actionPlan.steps.forEach((step: any, index: number) => {
        content += `${index + 1}. ${step.title} (${step.priority})\n`;
        content += `   ${step.description}\n`;
        if (step.estimatedTime) {
          content += `   Time: ${step.estimatedTime}\n`;
        }
        content += `\n`;
      });
    }
    
    if (exportOptions.includeNotes) {
      content += `CLINICAL NOTES\n`;
      content += `-------------\n`;
      data.notes.forEach((note: string) => {
        content += `${note}\n`;
      });
      content += `\n`;
    }
    
    return content;
  };

  const generateDOCXPreview = (data: any) => {
    let content = `[WORD DOCUMENT PREVIEW]\n\n`;
    content += `MEDICAL SUMMARY\n`;
    content += `===============\n\n`;
    content += `Patient: ${data.firstName} ${data.lastName}\n`;
    content += `MRN: ${data.medicalRecordNumber}\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n`;
    content += `Encounter ID: ${encounterId}\n\n`;
    
    if (exportOptions.includeVitals) {
      content += `🔍 VITAL SIGNS\n`;
      content += `• Blood Pressure: ${data.vitals.bloodPressureSystolic}/${data.vitals.bloodPressureDiastolic} mmHg\n`;
      content += `• Heart Rate: ${data.vitals.heartRate} bpm\n`;
      content += `• Temperature: ${data.vitals.temperature}°F\n`;
      content += `• Oxygen Saturation: ${data.vitals.oxygenSaturation}%\n\n`;
    }
    
    if (exportOptions.includeMedications) {
      content += `💊 CURRENT MEDICATIONS\n`;
      data.medications.forEach((med: any) => {
        content += `• ${med.name} ${med.dosage} - ${med.frequency}\n`;
      });
      content += `\n`;
    }
    
    if (exportOptions.includeInsights) {
      content += `🧠 AI INSIGHTS & RECOMMENDATIONS\n`;
      content += `• Consider ruling out acute coronary syndrome based on symptoms\n`;
      content += `• Recommend ECG and cardiac enzyme testing\n`;
      content += `• Monitor vital signs closely for changes\n`;
      content += `• Patient may benefit from cardiology consultation\n`;
      content += `\n`;
    }
    
    if (exportOptions.includeDiagnosis && selectedDisease) {
      content += `🩺 SELECTED DIAGNOSIS\n`;
      content += `Primary Diagnosis: ${selectedDisease.name}\n`;
      content += `Confidence: ${Math.round(selectedDisease.probability * 100)}%\n`;
      content += `Description: ${selectedDisease.description}\n`;
      if (selectedDisease.isCustom) {
        content += `[Doctor-added diagnosis]\n`;
      }
      content += `\n`;
    }
    
    if (exportOptions.includeActionPlan && actionPlan) {
      content += `📋 TREATMENT PLAN\n`;
      content += `Urgency: ${actionPlan.urgency.toUpperCase()}\n`;
      content += `Duration: ${actionPlan.estimatedDuration}\n`;
      content += `Follow-up Required: ${actionPlan.followUpRequired ? 'Yes' : 'No'}\n\n`;
      content += `Action Steps:\n`;
      actionPlan.steps.forEach((step: any, index: number) => {
        content += `${index + 1}. ${step.title} (${step.priority})\n`;
        content += `   ${step.description}\n`;
        if (step.estimatedTime) {
          content += `   ⏱️ Time: ${step.estimatedTime}\n`;
        }
        content += `\n`;
      });
    }
    
    content += `\n[This is a preview. Actual WORD document will be properly formatted with headers, styling, and layout.]`;
    
    return content;
  };

  const generatePreview = () => {
    const format = exportOptions.format;
    
    // Mock patient data for preview
    const mockPatientData = {
      firstName: 'Sarah',
      lastName: 'Johnson',
      medicalRecordNumber: 'MR001234',
      vitals: {
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        heartRate: 72,
        temperature: 98.6,
        oxygenSaturation: 98
      },
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Daily' },
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
      ],
      features: [
        { name: 'Chest pain', severity: 'moderate', description: 'Sharp, stabbing pain in left chest' },
        { name: 'Shortness of breath', severity: 'mild' }
      ],
      notes: [
        'Patient presents with chest discomfort and shortness of breath.',
        'Physical examination reveals normal heart sounds.',
        'No signs of acute distress noted.'
      ]
    };
    
    switch (format) {
      case 'json':
        return generateJSONPreview(mockPatientData);
      case 'fhir':
        return generateFHIRPreview(mockPatientData);
      case 'pdf':
        return generatePDFPreview(mockPatientData);
      case 'docx':
        return generateDOCXPreview(mockPatientData);
      default:
        return generateJSONPreview(mockPatientData);
    }
  };

  // Update preview when options change
  const previewContent = generatePreview();

  const getFileExtension = (format: ExportFormat['type']) => {
    switch (format) {
      case 'pdf': return 'pdf';
      case 'docx': return 'docx';
      case 'json': return 'json';
      case 'fhir': return 'json';
      default: return 'txt';
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportSummary(encounterId, exportOptions, selectedDisease, actionPlan);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const fileExtension = getFileExtension(exportOptions.format);
      const fileName = `${patientName.replace(/\s+/g, '_')}_summary_${encounterId}_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      a.download = fileName;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: `Summary exported as ${fileName}`
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
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
    if (exportOptions.format !== 'json' || !hasSelectedContent) return;
    
    try {
      const blob = await exportSummary(encounterId, exportOptions, selectedDisease, actionPlan);
      const text = await blob.text();
      
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "JSON data has been copied to your clipboard"
      });
    } catch (error) {
      console.error('Copy error:', error);
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
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
                    { key: 'includeInsights', label: 'AI Insights', description: 'AI-generated recommendations' },
                    { key: 'includeDiagnosis', label: 'Selected Diagnosis', description: 'Doctor-confirmed diagnosis' },
                    { key: 'includeActionPlan', label: 'Treatment Plan', description: 'Action steps and timeline' }
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
                  {hasSelectedContent ? (
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {previewContent}
                    </pre>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No content selected for export</p>
                        <p className="text-xs">Please select at least one option to include in the export</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {hasSelectedContent ? (
              <>
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Ready for export</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span>Select content options to export</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {exportOptions.format === 'json' && (
              <Button 
                variant="outline" 
                onClick={handleCopyJSON}
                disabled={!hasSelectedContent}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>
            )}
            
            <Button
              onClick={handleExport}
              disabled={exporting || !hasSelectedContent}
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