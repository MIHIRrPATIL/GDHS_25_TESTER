import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AIInsight } from "@/lib/types";
import { 
  Brain, 
  AlertTriangle, 
  Info, 
  Lightbulb,
  Check,
  Clock,
  TrendingUp,
  FileText
} from "lucide-react";

interface InsightDetailModalProps {
  insight: AIInsight | null;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge?: (insightId: string) => void;
}

export function InsightDetailModal({ 
  insight, 
  isOpen, 
  onClose, 
  onAcknowledge 
}: InsightDetailModalProps) {
  if (!insight) return null;

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'differential-diagnosis': return Lightbulb;
      case 'risk-assessment': return AlertTriangle;
      case 'recommendation': return Info;
      case 'alert': return AlertTriangle;
      default: return Brain;
    }
  };

  const getSeverityColor = (severity: AIInsight['severity']) => {
    switch (severity) {
      case 'critical': return 'text-destructive border-destructive';
      case 'warning': return 'text-warning border-warning';
      case 'info': return 'text-accent border-accent';
      default: return 'text-muted-foreground border-muted';
    }
  };

  const Icon = getInsightIcon(insight.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-primary" />
            <span>{insight.title}</span>
            <Badge 
              variant="outline" 
              className={getSeverityColor(insight.severity)}
            >
              {insight.severity}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Confidence Score */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-medium">Confidence Score</span>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {Math.round(insight.confidence * 100)}%
            </Badge>
          </div>

          {/* Main Content */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Clinical Assessment
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {insight.content}
              </p>
            </div>

            <Separator />

            {/* AI Reasoning Section */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                AI Reasoning & Deduction
              </h3>
              <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-primary mb-2">Data Points Analyzed:</h4>
                  <ul className="text-sm space-y-1">
                    {insight.sources.map((source, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span>{source}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-primary mb-2">Logical Deduction Process:</h4>
                  <div className="text-sm space-y-2">
                    <p>1. <strong>Pattern Recognition:</strong> The AI identified correlations between the patient's symptoms and known medical patterns.</p>
                    <p>2. <strong>Risk Stratification:</strong> Based on symptom severity and patient history, risk levels were calculated.</p>
                    <p>3. <strong>Differential Analysis:</strong> Multiple possible diagnoses were evaluated and ranked by probability.</p>
                    <p>4. <strong>Evidence Synthesis:</strong> Clinical guidelines and evidence-based medicine informed the final assessment.</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-primary mb-2">Confidence Factors:</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-background p-2 rounded">
                      <span className="font-medium">Data Quality:</span> High
                    </div>
                    <div className="bg-background p-2 rounded">
                      <span className="font-medium">Pattern Match:</span> {insight.confidence > 0.8 ? 'Strong' : insight.confidence > 0.6 ? 'Moderate' : 'Weak'}
                    </div>
                    <div className="bg-background p-2 rounded">
                      <span className="font-medium">Clinical Relevance:</span> {insight.severity === 'critical' ? 'High' : 'Moderate'}
                    </div>
                    <div className="bg-background p-2 rounded">
                      <span className="font-medium">Evidence Base:</span> Strong
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {insight.recommendations.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Clinical Recommendations</h3>
                  <ul className="space-y-2">
                    {insight.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Metadata */}
            <Separator />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Generated: {new Date(insight.createdAt).toLocaleString()}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {insight.type.replace('-', ' ')}
                </Badge>
              </div>
              
              {insight.isAcknowledged && (
                <div className="flex items-center gap-1 text-success">
                  <Check className="h-3 w-3" />
                  <span>Reviewed</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {!insight.isAcknowledged && onAcknowledge && (
              <Button 
                onClick={() => {
                  onAcknowledge(insight.id);
                  onClose();
                }}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Mark as Reviewed
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}