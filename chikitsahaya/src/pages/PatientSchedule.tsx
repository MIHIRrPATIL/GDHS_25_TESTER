import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScheduleEvent } from "@/lib/types";
import { getPatientSchedule } from "@/lib/api";
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PatientSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const data = await getPatientSchedule('doc1'); // TODO: Get from auth context
      setEvents(data);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    
    const eventDate = new Date(event.startTime);
    const isToday = eventDate.toDateString() === selectedDate.toDateString();
    
    return matchesSearch && matchesFilter && isToday;
  });

  const getStatusColor = (status: ScheduleEvent['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-secondary text-secondary-foreground';
      case 'confirmed': return 'bg-primary/20 text-primary-foreground';
      case 'in-progress': return 'bg-accent/20 text-accent-foreground';
      case 'completed': return 'bg-success/20 text-success-foreground';
      case 'cancelled': return 'bg-destructive/20 text-destructive-foreground';
      case 'no-show': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading patient schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Patient Schedule
              </h1>
              <p className="text-muted-foreground">
                {filteredEvents.length} appointments today
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/doctor/dashboard')} variant="outline">
                Back to Dashboard
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="space-y-6">
          {/* Date Navigation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <h2 className="text-lg font-semibold">{formatDate(selectedDate)}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedDate.toDateString() === new Date().toDateString() ? 'Today' : 
                     selectedDate.toDateString() === new Date(Date.now() + 86400000).toDateString() ? 'Tomorrow' :
                     selectedDate.toDateString() === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' : ''}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters & Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search appointments by patient name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {['all', 'scheduled', 'confirmed', 'in-progress', 'completed'].map((status) => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus(status)}
                      className="capitalize"
                    >
                      {status === 'all' ? 'All' : status.replace('-', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule List */}
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No appointments found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'No appointments scheduled for this day'
                    }
                  </p>
                  {searchQuery && (
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      Clear search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredEvents
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map((event) => (
                  <Card key={event.id} className="patient-card-hover cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                              <Badge className={getStatusColor(event.status)}>
                                {event.status.replace('-', ' ')}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                              
                              {event.description && (
                                <p className="text-sm mt-2 line-clamp-2">{event.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          {event.status === 'scheduled' && (
                            <Button size="sm">
                              Start Visit
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}