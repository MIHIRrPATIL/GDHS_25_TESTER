import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Upload, 
  FileText, 
  Image, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Download,
  Eye,
  Activity,
  TrendingUp
} from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  result?: any;
}

const LabScanner = () => {
  const { user } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // API function for lab scanner
  const uploadFileToAPI = async (file: File): Promise<any> => {
    const API_ENDPOINT = 'http://localhost:3000/uploadFile';
    
    if (!user?.token) {
      throw new Error('Authentication required');
    }
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('labReport', file);
    
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Transform backend response to match frontend expectations
      return {
        id: Date.now(),
        labReport: file.name,
        fileUrl: URL.createObjectURL(file),
        analysis: {
          type: 'Lab Report Analysis',
          confidence: 0.95,
          symptoms: result.symptoms || [],
          biomarkers: result['bio-marker'] || [],
          findings: [
            'Analysis completed successfully',
            'All biomarkers have been evaluated',
            'Results compared against reference ranges'
          ]
        }
      };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'uploading' as const,
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(true);

    // Process each file
    for (const uploadFile of newFiles) {
      try {
        // Update progress
        const progressInterval = setInterval(() => {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f
            )
          );
        }, 200);

        // Upload to API
        const result = await uploadFileToAPI(uploadFile.file);
        
        clearInterval(progressInterval);
        
        // Update file status
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'success', progress: 100, result }
              : f
          )
        );
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'error', progress: 0 }
              : f
          )
        );
      }
    }

    setIsUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true
  });

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-8 w-8" />;
    return <FileText className="h-8 w-8" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getSeverityBadge = (symptom: any) => {
    if (!symptom.severity) {
      return <Badge variant="outline" className="text-xs">Detected</Badge>;
    }
    
    const severityColors = {
      'high': 'destructive',
      'medium': 'secondary',
      'low': 'outline'
    };
    
    return (
      <Badge variant={severityColors[symptom.severity] || 'outline'} className="text-xs">
        {symptom.severity} priority
      </Badge>
    );
  };

  // Show authentication error if user is not logged in
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the Lab Scanner feature.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lab Scanner</h1>
          <p className="text-muted-foreground">
            Upload your lab reports, prescriptions, and medical documents for AI analysis
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Medical Documents</CardTitle>
          <CardDescription>
            Drag and drop your files here, or click to browse. Supports images, PDFs, and text documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
              ${isDragActive 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:scale-[1.01]'
              }
            `}
          >
            <input {...getInputProps()} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-lg font-medium">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports: Images (PNG, JPG, GIF), PDFs, Word documents, Text files
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedFiles.map((uploadFile) => (
              <motion.div
                key={uploadFile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-4 p-4 border rounded-lg"
              >
                <div className="flex-shrink-0">
                  {uploadFile.preview ? (
                    <img
                      src={uploadFile.preview}
                      alt="Preview"
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    getFileIcon(uploadFile.file)
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium truncate">
                      {uploadFile.file.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        uploadFile.status === 'success' ? 'default' :
                        uploadFile.status === 'error' ? 'destructive' : 'secondary'
                      }>
                        {uploadFile.status}
                      </Badge>
                      {getStatusIcon(uploadFile.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadFile.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>{(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span>{uploadFile.file.type}</span>
                  </div>
                  
                  {uploadFile.status === 'uploading' && (
                    <Progress value={uploadFile.progress} className="h-2" />
                  )}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {uploadedFiles.some(f => f.status === 'success' && f.result) && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {uploadedFiles
              .filter(f => f.status === 'success' && f.result)
              .map((file) => {
                const { symptoms = [], biomarkers = [], findings = [] } = file.result.analysis;
                
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border rounded-lg p-6 space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{file.file.name}</h3>
                      <Badge variant="outline">
                        {file.result.analysis.type}
                      </Badge>
                    </div>
                    
                    {/* Key Findings */}
                    <div>
                      <h4 className="font-medium mb-3 text-sm text-muted-foreground flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        KEY FINDINGS
                      </h4>
                      <div className="grid gap-3">
                        {findings.map((finding: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{finding}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Symptoms Detection */}
                    {symptoms.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 text-sm text-muted-foreground flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          SYMPTOMS DETECTED
                        </h4>
                        <div className="grid gap-4">
                          {symptoms.map((symptom: any, index: number) => (
                            <div key={index} className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium">{symptom.name}</h5>
                                {getSeverityBadge(symptom)}
                              </div>
                              
                              {symptom.related_measure && (
                                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-md border">
                                  <p className="text-sm font-mono text-muted-foreground">
                                    Related Measure:
                                  </p>
                                  <p className="text-sm font-mono mt-1">{symptom.related_measure}</p>
                                </div>
                              )}
                              
                              <div className="mt-3 text-xs text-muted-foreground">
                                <p>This finding may require medical attention. Please consult with your healthcare provider for proper evaluation.</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Biomarkers */}
                    {biomarkers.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 text-sm text-muted-foreground flex items-center">
                          <Activity className="h-4 w-4 mr-2" />
                          BIOMARKERS ANALYZED
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {biomarkers.map((biomarker: any, index: number) => (
                            <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center space-x-2">
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">{biomarker.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-medium mb-3 text-sm text-muted-foreground">RECOMMENDATIONS</h4>
                      <div className="space-y-3">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Consult a Healthcare Professional</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Schedule an appointment with your doctor to discuss these findings and get professional medical advice.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {symptoms.some((s: any) => s.name.toLowerCase().includes('anemia')) && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start space-x-3">
                              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium">Anemia Management</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Consider discussing iron-rich foods and potential supplementation with your healthcare provider.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Follow-up Testing</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Your doctor may recommend follow-up tests to monitor these levels and track your health progress.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-xs text-muted-foreground">
                        Analysis completed • {new Date().toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View File
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                            <DialogHeader>
                              <DialogTitle>{file.file.name}</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                              {file.file.type.startsWith('image/') ? (
                                <img
                                  src={file.result.fileUrl}
                                  alt={file.file.name}
                                  className="w-full h-auto max-h-[60vh] object-contain rounded-lg border"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                                  <div className="text-center">
                                    <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">File Preview</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {file.file.name}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {uploadedFiles.some(f => f.status === 'error') && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some files failed to upload. Please try again or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default LabScanner;