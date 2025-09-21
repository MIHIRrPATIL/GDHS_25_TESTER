import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Feature } from "@/lib/types";
import { getFeatures, upsertFeature, removeFeature } from "@/lib/api";
import { Plus, X, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeatureChipsProps {
  patientId: string;
  encounterId?: string;
  readOnly?: boolean;
}

const COMMON_SYMPTOMS = [
  'Chest pain', 'Shortness of breath', 'Headache', 'Nausea', 'Vomiting',
  'Abdominal pain', 'Fever', 'Fatigue', 'Dizziness', 'Cough',
  'Joint pain', 'Muscle pain', 'Rash', 'Swelling', 'Palpitations'
];

const SEVERITY_COLORS = {
  mild: 'bg-success/20 text-success-foreground border-success/50 hover:bg-success/30',
  moderate: 'bg-primary/20 text-primary-foreground border-primary/50 hover:bg-primary/30',
  severe: 'bg-warning/20 text-warning-foreground border-warning/50 hover:bg-warning/30',
  critical: 'bg-destructive/20 text-destructive-foreground border-destructive/50 hover:bg-destructive/30'
};

export function FeatureChips({ patientId, encounterId, readOnly = false }: FeatureChipsProps) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFeatures();
  }, [patientId]);

  useEffect(() => {
    if (inputValue.length > 0) {
      const filtered = COMMON_SYMPTOMS.filter(symptom =>
        symptom.toLowerCase().includes(inputValue.toLowerCase()) &&
        !features.some(f => f.name.toLowerCase() === symptom.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [inputValue, features]);

  const loadFeatures = async () => {
    setLoading(true);
    try {
      const data = await getFeatures(patientId);
      setFeatures(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load features",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addFeature = async (name: string) => {
    if (!name.trim() || features.some(f => f.name.toLowerCase() === name.toLowerCase())) {
      return;
    }

    try {
      const newFeature = await upsertFeature({
        patientId,
        encounterId,
        type: 'symptom',
        name: name.trim(),
        severity: 'moderate',
        isActive: true,
        source: 'clinician-observed',
        createdBy: 'current-user' // TODO: Get from auth context
      });

      setFeatures(prev => [...prev, newFeature]);
      setInputValue('');
      setShowSuggestions(false);
      
      toast({
        title: "Feature added",
        description: `${name} has been added to the patient's features`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add feature",
        variant: "destructive"
      });
    }
  };

  const removeFeatureById = async (id: string) => {
    try {
      await removeFeature(id);
      setFeatures(prev => prev.filter(f => f.id !== id));
      
      toast({
        title: "Feature removed",
        description: "Feature has been removed from the patient's record"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove feature",
        variant: "destructive"
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          addFeature(suggestions[selectedSuggestionIndex]);
        } else if (inputValue.trim()) {
          addFeature(inputValue);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addFeature(suggestion);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Input for adding new features */}
      {!readOnly && (
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Add symptom or finding..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
                role="combobox"
                aria-expanded={showSuggestions}
                aria-autocomplete="list"
              />
            </div>
            <Button
              onClick={() => inputValue.trim() && addFeature(inputValue)}
              disabled={!inputValue.trim()}
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
              <CardContent className="p-2">
                <div 
                  role="listbox" 
                  aria-label="Symptom suggestions"
                  className="max-h-40 overflow-y-auto"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion}
                      className={`w-full text-left px-3 py-2 rounded text-sm medical-transition ${
                        index === selectedSuggestionIndex 
                          ? 'bg-accent text-accent-foreground' 
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      role="option"
                      aria-selected={index === selectedSuggestionIndex}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Feature chips */}
      <div className="flex flex-wrap gap-2">
        {features.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            {readOnly ? 'No features recorded' : 'No features added yet. Start typing to add symptoms or findings.'}
          </p>
        ) : (
          features.map((feature) => (
            <Badge
              key={feature.id}
              variant="outline"
              className={`feature-chip ${
                feature.severity ? SEVERITY_COLORS[feature.severity] : ''
              } ${readOnly ? 'cursor-default' : 'group cursor-pointer'}`}
            >
              <span className="mr-1">{feature.name}</span>
              {feature.severity && (
                <span className="text-xs opacity-75">
                  ({feature.severity})
                </span>
              )}
              {feature.onset && (
                <span className="text-xs opacity-75 ml-1">
                  - {feature.onset}
                </span>
              )}
              {!readOnly && (
                <X
                  className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 medical-transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFeatureById(feature.id);
                  }}
                />
              )}
            </Badge>
          ))
        )}
      </div>

      {/* Feature legend */}
      {features.some(f => f.severity) && (
        <div className="flex flex-wrap gap-4 pt-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-success/40"></div>
            <span>Mild</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-accent/40"></div>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-warning/40"></div>
            <span>Severe</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-destructive/40"></div>
            <span>Critical</span>
          </div>
        </div>
      )}
    </div>
  );
}