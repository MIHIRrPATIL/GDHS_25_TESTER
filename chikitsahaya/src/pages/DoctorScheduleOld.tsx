import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleEvent } from "@/lib/types";
import { getDoctorSchedule } from "@/lib/api";
import { 
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Building,
  Eye,
  Play,
  Edit,
  X,
  Check,
  Users,
  AlertTriangle,
  Info,
  CalendarDays,
  List,
  Grid3X3,
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DoctorSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'timeline'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const data = await getDoctorSchedule('doc1'); // TODO: Get from auth context
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
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || event.type === filterType;
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    
    const eventDate = new Date(event.startTime);
    const isToday = eventDate.toDateString() === selectedDate.toDateString();
    
    return matchesSearch && matchesFilter && matchesStatus && isToday;
  });

  const getTypeColor = (type: ScheduleEvent['type']) => {
    switch (type) {
      case 'doctor-shift': return 'bg-primary/20 text-primary-foreground';
      case 'consultation': return 'bg-accent/20 text-accent-foreground';
      case 'procedure': return 'bg-warning/20 text-warning-foreground';
      case 'meeting': return 'bg-secondary/20 text-secondary-foreground';
      case 'patient-visit': return 'bg-success/20 text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: ScheduleEvent['type']) => {
    switch (type) {
      case 'doctor-shift': return Building;
      case 'consultation': return Stethoscope;
      case 'procedure': return Stethoscope;
      case 'meeting': return Calendar;
      case 'patient-visit': return Stethoscope;
      default: return Calendar;
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

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const updateEventStatus = (eventId: string, newStatus: ScheduleEvent['status']) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? { ...event, status: newStatus, updatedAt: new Date().toISOString() }
          : event
      )
    );
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const getStatusColor = (status: ScheduleEvent['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'confirmed': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'no-show': return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getUrgencyLevel = (event: ScheduleEvent) => {
    if (event.type === 'patient-visit' && event.description?.toLowerCase().includes('emergency')) {
      return 'critical';
    }
    if (event.type === 'consultation' || event.type === 'procedure') {
      return 'high';
    }
    if (event.type === 'meeting') {
      return 'medium';
    }
    return 'low';
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 3);
  };

  const getTodayStats = () => {
    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === new Date().toDateString();
    });

    return {
      total: todayEvents.length,
      completed: todayEvents.filter(e => e.status === 'completed').length,
      inProgress: todayEvents.filter(e => e.status === 'in-progress').length,
      upcoming: todayEvents.filter(e => {
        const now = new Date();
        return new Date(e.startTime) > now && e.status === 'scheduled';
      }).length,
      cancelled: todayEvents.filter(e => e.status === 'cancelled' || e.status === 'no-show').length
    };
  };

  const todayStats = getTodayStats();

  // Event Detail Modal Component
  const EventDetailModal = ({ event, onClose, onStatusUpdate }: {
    event: ScheduleEvent;
    onClose: () => void;
    onStatusUpdate: (status: ScheduleEvent['status']) => void;
  }) => {
    const urgency = getUrgencyLevel(event);
    const isUpcoming = new Date(event.startTime) > new Date();
    const canStart = event.status === 'scheduled' || event.status === 'confirmed';

    return (
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate">{event.title}</span>
            <Badge className={getStatusColor(event.status)}>
              {event.status.replace('-', ' ')}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Event Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(event.startTime, event.endTime)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(event.type)}>
                  {event.type.replace('-', ' ')}
                </Badge>
                {urgency !== 'low' && (
                  <Badge variant={urgency === 'critical' ? 'destructive' : 'outline'}>
                    {urgency} priority
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {event.attendees && event.attendees.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{event.attendees.length} attendees</span>
                </div>
              )}
              
              {event.isRecurring && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Recurring: {event.recurrencePattern || 'Weekly'}
                  </span>
                </div>
              )}
              
              {event.reminders && event.reminders.length > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {event.reminders.length} reminder{event.reminders.length !== 1 ? 's' : ''} set
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Description */}
          {event.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                {event.description}
              </p>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              {canStart && isUpcoming && (
                <Button 
                  size="sm" 
                  onClick={() => onStatusUpdate('in-progress')}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Session
                </Button>
              )}
              
              {event.status === 'in-progress' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onStatusUpdate('completed')}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Mark Complete
                </Button>
              )}
              
              {event.status === 'scheduled' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onStatusUpdate('confirmed')}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Confirm
                </Button>
              )}
              
              {(event.status === 'scheduled' || event.status === 'confirmed') && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onStatusUpdate('cancelled')}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              )}
              
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Event
              </Button>
              
              {event.type === 'patient-visit' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate(`/doctor/chat`)}
                  className="flex items-center gap-2"
                >
                  <Stethoscope className="h-4 w-4" />
                  Patient Chat
                </Button>
              )}
            </div>
          </div>
          
          {/* Reminders */}
          {event.reminders && event.reminders.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Reminders</h4>
              <div className="space-y-2">
                {event.reminders.map((reminder, index) => (
                  <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                    <span className="capitalize">{reminder.type}</span>
                    <span>{reminder.minutesBefore} minutes before</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your schedule...</p>
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
                <Stethoscope className="h-6 w-6" />
                My Schedule
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-muted-foreground">
                  {filteredEvents.length} events today
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="bg-green-50">
                    {todayStats.completed} completed
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-50">
                    {todayStats.inProgress} in progress
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50">
                    {todayStats.upcoming} upcoming
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    List
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Calendar
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timeline
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button onClick={() => navigate('/doctor/dashboard')} variant="outline">
                Back to Dashboard
              </Button>
              <Button onClick={() => navigate('/doctor/patient-schedule')} variant="outline">
                Patient Schedule
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Search & Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events by title, location, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Event Type</label>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="patient-visit">Patient Visits</SelectItem>
                          <SelectItem value="consultation">Consultations</SelectItem>
                          <SelectItem value="procedure">Procedures</SelectItem>
                          <SelectItem value="meeting">Meetings</SelectItem>
                          <SelectItem value="doctor-shift">Doctor Shifts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="no-show">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setFilterType('all');
                          setFilterStatus('all');
                        }}
                        className="w-full"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Schedule List */}
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No events found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'You have no events scheduled for this day'
                    }
                  </p>
                  {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery('');
                        setFilterType('all');
                        setFilterStatus('all');
                      }}
                    >
                      Clear all filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Tabs value={viewMode} className="w-full">
                <TabsContent value="list" className="space-y-4">
                  {filteredEvents
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .map((event) => {
                      const TypeIcon = getTypeIcon(event.type);
                      const urgency = getUrgencyLevel(event);
                      const isUpcoming = new Date(event.startTime) > new Date();
                      const isPast = new Date(event.endTime) < new Date();
                      
                      return (
                        <Card 
                          key={event.id} 
                          className={`patient-card-hover cursor-pointer transition-all hover:shadow-md ${
                            event.status === 'in-progress' ? 'ring-2 ring-yellow-500' : ''
                          } ${urgency === 'critical' ? 'border-red-300' : ''}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4 flex-1">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(event.type)}`}>
                                  <TypeIcon className="h-6 w-6" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <Badge className={getStatusColor(event.status)}>
                                        {event.status.replace('-', ' ')}
                                      </Badge>
                                      {urgency !== 'low' && (
                                        <Badge variant={urgency === 'critical' ? 'destructive' : 'outline'}>
                                          {urgency}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                        </span>
                                      </div>
                                      <Badge variant="outline" className="h-5 text-xs">
                                        {formatDuration(event.startTime, event.endTime)}
                                      </Badge>
                                      {isPast && event.status !== 'completed' && event.status !== 'cancelled' && (
                                        <Badge variant="destructive" className="h-5 text-xs">
                                          Overdue
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{event.location}</span>
                                      </div>
                                      {event.attendees && event.attendees.length > 1 && (
                                        <div className="flex items-center gap-1 text-xs">
                                          <Users className="h-3 w-3" />
                                          <span>{event.attendees.length} attendees</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {event.description && (
                                      <p className="text-sm mt-2 line-clamp-2">{event.description}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2 flex-shrink-0">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => setSelectedEvent(event)}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      Details
                                    </Button>
                                  </DialogTrigger>
                                  {selectedEvent && selectedEvent.id === event.id && (
                                    <EventDetailModal
                                      event={selectedEvent}
                                      onClose={() => setSelectedEvent(null)}
                                      onStatusUpdate={(status) => updateEventStatus(event.id, status)}
                                    />
                                  )}
                                </Dialog>
                                
                                {/* Quick Action Buttons */}
                                {event.status === 'scheduled' && isUpcoming && (
                                  <Button 
                                    size="sm"
                                    onClick={() => updateEventStatus(event.id, 'in-progress')}
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    Start
                                  </Button>
                                )}
                                
                                {event.status === 'in-progress' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateEventStatus(event.id, 'completed')}
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Complete
                                  </Button>
                                )}
                                
                                {event.type === 'patient-visit' && event.status !== 'cancelled' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => navigate('/doctor/chat')}
                                  >
                                    <Stethoscope className="h-4 w-4 mr-2" />
                                    Chat
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </TabsContent>
                
                <TabsContent value="calendar" className="space-y-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Calendar View</h3>
                      <p className="text-muted-foreground">
                        Calendar view is coming soon! This will show your schedule in a monthly calendar format.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="timeline" className="space-y-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Timeline View</h3>
                      <p className="text-muted-foreground">
                        Timeline view is coming soon! This will show your schedule in a time-based timeline format.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
            
            {/* Upcoming Events Quick Preview */}
            {filteredEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Next Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getUpcomingEvents().slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded flex items-center justify-center ${getTypeColor(event.type)}`}>
                            {React.createElement(getTypeIcon(event.type), { className: "h-4 w-4" })}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatTime(event.startTime)} • {event.location}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(event.status)} text-xs`}>
                          {event.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    ))}
                    {getUpcomingEvents().length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No upcoming events scheduled
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}