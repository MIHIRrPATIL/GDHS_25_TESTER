import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AIInsight, PossibleDisease, ActionPlan } from "@/lib/types";
import { getActionPlan, addCustomDisease, updateInsightWithDisease } from "@/lib/api";
import { useState } from "react";
import { 
  Brain, 
  AlertTriangle, 
  Info, 
  Lightbulb,
  Check,
  Clock,
  TrendingUp,
  FileText,
  Plus,
  Stethoscope,
  ClipboardList,
  Loader2
} from "lucide-react";

interface InsightDetailModalProps {
  insight: AIInsight | null;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge?: (insightId: string) => void;
  onInsightUpdate?: (updatedInsight: AIInsight) => void;
}

export function InsightDetailModal({ 
  insight, 
  isOpen, 
  onClose, 
  onAcknowledge,
  onInsightUpdate 
}: InsightDetailModalProps) {
  const [selectedDisease, setSelectedDisease] = useState<PossibleDisease | null>(insight?.selectedDisease || null);
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(insight?.actionPlan || null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [showAddDisease, setShowAddDisease] = useState(false);
  const [newDisease, setNewDisease] = useState({
    name: '',
    description: '',
    probability: 0.5
  });

  if (!insight) return null;

  const handleDiseaseSelect = async (disease: PossibleDisease) => {
    setSelectedDisease(disease);
    setIsLoadingPlan(true);
    
    try {
      const plan = await getActionPlan(disease.id, insight.patientId);
      setActionPlan(plan);
      
      const updatedInsight = await updateInsightWithDisease(insight.id, disease, plan);
      if (onInsightUpdate) {
        onInsightUpdate(updatedInsight);
      }
    } catch (error) {
      console.error('Failed to get action plan:', error);
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const handleAddCustomDisease = async () => {
    if (!newDisease.name.trim()) return;
    
    try {
      const customDisease = await addCustomDisease(insight.id, {
        name: newDisease.name,
        description: newDisease.description,
        probability: newDisease.probability,
        symptoms: [] // Could be expanded to include custom symptoms
      });
      
      // Update the insight with the new disease
      insight.possibleDiseases.push(customDisease);
      
      setNewDisease({ name: '', description: '', probability: 0.5 });
      setShowAddDisease(false);
    } catch (error) {
      console.error('Failed to add custom disease:', error);
    }
  };

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

            {/* Possible Diseases */}
            {insight.possibleDiseases && insight.possibleDiseases.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-primary" />
                      Possible Diseases
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddDisease(!showAddDisease)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Disease
                    </Button>
                  </div>
                  
                  {showAddDisease && (
                    <div className="mb-4 p-4 bg-muted/30 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="disease-name">Disease Name</Label>
                          <Input
                            id="disease-name"
                            value={newDisease.name}
                            onChange={(e) => setNewDisease(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter disease name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="probability">Probability (%)</Label>
                          <Input
                            id="probability"
                            type="number"
                            min="0"
                            max="100"
                            value={Math.round(newDisease.probability * 100)}
                            onChange={(e) => setNewDisease(prev => ({ ...prev, probability: Number(e.target.value) / 100 }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="disease-description">Description</Label>
                        <Textarea
                          id="disease-description"
                          value={newDisease.description}
                          onChange={(e) => setNewDisease(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description of the disease"
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleAddCustomDisease}>
                          Add Disease
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowAddDisease(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {insight.possibleDiseases.map((disease, index) => (
                      <div 
                        key={disease.id} 
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedDisease?.id === disease.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-muted hover:border-primary/50'
                        }`}
                        onClick={() => handleDiseaseSelect(disease)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{disease.name}</h4>
                              {disease.isCustom && (
                                <Badge variant="secondary" className="text-xs">Custom</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{disease.description}</p>
                            {disease.symptoms && disease.symptoms.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {disease.symptoms.map((symptom, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {symptom}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant="secondary" 
                              className={`${
                                disease.probability > 0.7 ? 'bg-destructive/10 text-destructive' :
                                disease.probability > 0.5 ? 'bg-warning/10 text-warning' :
                                'bg-muted'
                              }`}
                            >
                              {Math.round(disease.probability * 100)}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Action Plan */}
            {selectedDisease && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Plan of Action for {selectedDisease.name}
                  </h3>
                  
                  {isLoadingPlan ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2">Generating treatment plan...</span>
                    </div>
                  ) : actionPlan ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Urgency:</span>
                          <Badge 
                            variant="outline"
                            className={
                              actionPlan.urgency === 'critical' ? 'border-destructive text-destructive' :
                              actionPlan.urgency === 'high' ? 'border-warning text-warning' :
                              actionPlan.urgency === 'medium' ? 'border-accent text-accent' :
                              'border-muted'
                            }
                          >
                            {actionPlan.urgency}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Duration:</span>
                          <span className="text-sm">{actionPlan.estimatedDuration}</span>
                        </div>
                        {actionPlan.followUpRequired && (
                          <Badge variant="outline" className="text-xs">
                            Follow-up Required
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {actionPlan.steps.map((step, index) => (
                          <div key={step.id} className="flex gap-3 p-3 border rounded-lg">
                            <div className="flex-shrink-0">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                step.priority === 'immediate' ? 'bg-destructive text-destructive-foreground' :
                                step.priority === 'urgent' ? 'bg-warning text-warning-foreground' :
                                'bg-primary text-primary-foreground'
                              }`}>
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{step.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {step.type}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    step.priority === 'immediate' ? 'border-destructive text-destructive' :
                                    step.priority === 'urgent' ? 'border-warning text-warning' :
                                    'border-muted'
                                  }`}
                                >
                                  {step.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                              {step.estimatedTime && (
                                <p className="text-xs text-muted-foreground">
                                  Estimated time: {step.estimatedTime}
                                </p>
                              )}
                              {step.resources && step.resources.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {step.resources.map((resource, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {resource}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
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