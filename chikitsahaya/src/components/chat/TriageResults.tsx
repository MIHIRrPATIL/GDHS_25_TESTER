import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TriageResult } from '@/services/chat-api';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  Heart,
  FileText,
  Lightbulb
} from 'lucide-react';

interface TriageResultsProps {
  result: TriageResult;
}

export const TriageResults: React.FC<TriageResultsProps> = ({ result }) => {
  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'Emergency':
        return <Zap className="w-4 h-4" />;
      case 'Urgent':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Routine':
        return <Clock className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'Emergency':
        return 'destructive';
      case 'Urgent':
        return 'destructive';
      case 'Routine':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getUrgencyDescription = (level: string) => {
    switch (level) {
      case 'Emergency':
        return 'Seek immediate medical attention or call emergency services.';
      case 'Urgent':
        return 'Schedule an appointment with a healthcare provider as soon as possible.';
      case 'Routine':
        return 'Consider scheduling an appointment with a healthcare provider within a few days.';
      default:
        return 'Please consult with a healthcare professional for proper evaluation.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Urgency Level Alert */}
      <Alert className={`border-l-4 ${
        result.urgency_level === 'Emergency' || result.urgency_level === 'Urgent' 
          ? 'border-l-red-500 bg-red-50' 
          : result.urgency_level === 'Routine'
          ? 'border-l-yellow-500 bg-yellow-50'
          : 'border-l-green-500 bg-green-50'
      }`}>
        <div className="flex items-center gap-2">
          {getUrgencyIcon(result.urgency_level)}
          <Badge variant={getUrgencyColor(result.urgency_level) as any} className="capitalize">
            {result.urgency_level} Priority
          </Badge>
        </div>
        <AlertDescription className="mt-2">
          {getUrgencyDescription(result.urgency_level)}
        </AlertDescription>
      </Alert>

      {/* Symptoms Summary */}
      {result.symptoms && result.symptoms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Symptoms Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.symptoms.map((symptom, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-base">{symptom.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    {symptom.duration && (
                      <div>
                        <span className="font-medium text-muted-foreground">Duration:</span>
                        <p className="mt-1">{symptom.duration}</p>
                      </div>
                    )}
                    {symptom.severity && (
                      <div>
                        <span className="font-medium text-muted-foreground">Severity:</span>
                        <p className="mt-1">{symptom.severity}</p>
                      </div>
                    )}
                    {symptom.additional_context && (
                      <div className="md:col-span-1">
                        <span className="font-medium text-muted-foreground">Additional Context:</span>
                        <p className="mt-1">{symptom.additional_context}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {/* {result.recommendations && result.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )} */}

      {/* Suggested Actions */}
      {/* {result.suggested_actions && result.suggested_actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Suggested Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.suggested_actions.map((action, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-sm">{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )} */}

      {/* Disclaimer */}
      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          <strong>Medical Disclaimer:</strong> This triage assessment is for informational purposes only 
          and should not replace professional medical advice, diagnosis, or treatment. Always consult 
          with a qualified healthcare provider for proper medical evaluation and care.
        </AlertDescription>
      </Alert>
    </div>
  );
};
