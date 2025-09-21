import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AIInsight } from "@/lib/types";
import { getInsights, acknowledgeInsight } from "@/lib/api";
import { InsightDetailModal } from "@/components/modals/InsightDetailModal";
import { 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Info, 
  Lightbulb,
  Check,
  HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InsightsPanelProps {
  patientId?: string;
  encounterId?: string;
  className?: string;
  defaultOpen?: boolean;
}

export function InsightsPanel({ 
  patientId, 
  encounterId, 
  className = "", 
  defaultOpen = false 
}: InsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (patientId) {
      loadInsights();
    }
  }, [patientId, encounterId]);

  const loadInsights = async () => {
    if (!patientId) return;
    
    setLoading(true);
    try {
      const data = await getInsights(patientId);
      setInsights(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load AI insights",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (insightId: string) => {
    try {
      await acknowledgeInsight(insightId, 'current-user'); // TODO: Get from auth context
      setInsights(prev => 
        prev.map(insight => 
          insight.id === insightId 
            ? { ...insight, isAcknowledged: true, acknowledgedAt: new Date().toISOString() }
            : insight
        )
      );
      
      toast({
        title: "Insight acknowledged",
        description: "The AI insight has been marked as reviewed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to acknowledge insight",
        variant: "destructive"
      });
    }
  };

  const toggleInsightExpanded = (insightId: string) => {
    setExpandedInsights(prev => {
      const next = new Set(prev);
      if (next.has(insightId)) {
        next.delete(insightId);
      } else {
        next.add(insightId);
      }
      return next;
    });
  };

  const openInsightModal = (insight: AIInsight) => {
    setSelectedInsight(insight);
    setModalOpen(true);
  };

  const closeInsightModal = () => {
    setSelectedInsight(null);
    setModalOpen(false);
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
      case 'critical': return 'border-destructive bg-destructive/5 text-destructive-foreground';
      case 'warning': return 'border-warning bg-warning/5 text-warning-foreground';
      case 'info': return 'border-accent bg-accent/5 text-accent-foreground';
      default: return 'border-muted bg-muted/5';
    }
  };

  const unacknowledgedCount = insights.filter(i => !i.isAcknowledged).length;

  return (
    <Card className={`${className} ${!isOpen ? 'min-h-0 h-auto overflow-hidden' : ''}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Insights
                {unacknowledgedCount > 0 && (
                  <Badge variant="secondary" className="bg-accent/40 text-black hover:bg-accent/60 transition-colors">
                    {unacknowledgedCount} new
                  </Badge>
                )}
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                )}
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {insights.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No AI insights available</p>
                <p className="text-xs mt-1">Insights will appear as data is analyzed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => {
                  const Icon = getInsightIcon(insight.type);
                  const isExpanded = expandedInsights.has(insight.id);
                  
                  return (
                    <div
                      key={insight.id}
                      className={`p-4 rounded-lg border-l-4 cursor-pointer hover:bg-muted/30 transition-colors ${getSeverityColor(insight.severity)}`}
                      onClick={() => openInsightModal(insight)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-4 w-4 flex-shrink-0 text-black" />
                            <h4 className="font-medium text-sm truncate text-foreground">{insight.title}</h4>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {Math.round(insight.confidence * 100)}%
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {insight.content}
                          </p>
                          
                          {isExpanded && (
                            <div className="space-y-3">
                              {insight.recommendations.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-medium text-muted-foreground mb-1">
                                    Recommendations:
                                  </h5>
                                  <ul className="text-xs space-y-1">
                                    {insight.recommendations.map((rec, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <div className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {insight.sources.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-medium text-muted-foreground mb-1">
                                    Based on:
                                  </h5>
                                  <div className="flex flex-wrap gap-1">
                                    {insight.sources.map((source, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {source}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleInsightExpanded(insight.id)}
                            className="h-6 w-6 p-0"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <HelpCircle className="h-3 w-3" />
                            )}
                          </Button>
                          
                          {!insight.isAcknowledged && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAcknowledge(insight.id)}
                              className="h-6 w-6 p-0 text-success hover:text-success hover:bg-success/10"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              insight.severity === 'critical' ? 'border-destructive text-destructive' :
                              insight.severity === 'warning' ? 'border-warning text-warning' :
                              'border-accent text-accent'
                            }`}
                          >
                            {insight.type.replace('-', ' ')}
                          </Badge>
                          <span>•</span>
                          <span>{new Date(insight.createdAt).toLocaleTimeString()}</span>
                        </div>
                        
                        {insight.isAcknowledged && (
                          <div className="flex items-center gap-1 text-xs text-success">
                            <Check className="h-3 w-3" />
                            <span>Reviewed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
      
      <InsightDetailModal
        insight={selectedInsight}
        isOpen={modalOpen}
        onClose={closeInsightModal}
        onAcknowledge={handleAcknowledge}
      />
    </Card>
  );
}