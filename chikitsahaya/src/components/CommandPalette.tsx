import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SearchResult } from "@/lib/types";
import { searchAll } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { 
  User, 
  FileText, 
  MessageCircle, 
  Stethoscope, 
  Lightbulb, 
  Calendar,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const getIconForType = (type: SearchResult['type']) => {
  switch (type) {
    case 'patient': return User;
    case 'encounter': return Stethoscope;
    case 'conversation': return MessageCircle;
    case 'feature': return FileText;
    case 'insight': return Lightbulb;
    case 'schedule': return Calendar;
    default: return FileText;
  }
};

const getRouteForResult = (result: SearchResult): string => {
  switch (result.type) {
    case 'patient':
      return `/doctor/encounter/new?patientId=${result.id}`;
    case 'encounter':
      return `/doctor/encounter/${result.id}`;
    case 'conversation':
      return `/doctor/chat/${result.id}`;
    case 'schedule':
      return `/doctor/schedule`;
    default:
      return '/doctor/dashboard';
  }
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const debouncedQuery = useDebounce(query, 300);

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Perform search
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const searchResults = await searchAll(debouncedQuery);
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleSelect = (result: SearchResult) => {
    const route = getRouteForResult(result);
    navigate(route);
    setOpen(false);
    setQuery('');
  };

  const groupedResults = results.reduce((acc, result) => {
    const type = result.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search patients, conversations, schedules..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}
        
        {!loading && results.length === 0 && query.length >= 2 && (
          <CommandEmpty>No results found for "{query}"</CommandEmpty>
        )}

        {!loading && Object.entries(groupedResults).map(([type, typeResults]) => {
          const Icon = getIconForType(type as SearchResult['type']);
          
          return (
            <CommandGroup 
              key={type} 
              heading={type.charAt(0).toUpperCase() + type.slice(1) + 's'}
            >
              {typeResults.map((result) => (
                <CommandItem
                  key={result.id}
                  value={`${result.title} ${result.subtitle || ''} ${result.description || ''}`}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-sm text-muted-foreground truncate">
                        {result.subtitle}
                      </div>
                    )}
                    {result.description && (
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        {result.description}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}

        {!loading && results.length === 0 && query.length < 2 && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            <div className="mb-2">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                ⌘K
              </kbd>{' '}
              to search
            </div>
            <div>Search for patients, conversations, insights, and more...</div>
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}