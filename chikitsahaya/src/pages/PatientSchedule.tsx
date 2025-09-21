import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Users,
  Repeat,
  Eye,
  Play,
  MoreHorizontal,
  CalendarDays,
  List
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface AppointmentDetailModalProps {
  appointment: ScheduleEvent;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: ScheduleEvent['status']) => void;
}

function AppointmentDetailModal({ appointment, isOpen, onClose, onStatusUpdate }: AppointmentDetailModalProps) {
  const { toast } = useToast();

  const handleStatusUpdate = (newStatus: ScheduleEvent['status']) => {
    onStatusUpdate(appointment.id, newStatus);
    toast({
      title: "Status Updated",
      description: `Appointment status changed to ${newStatus.replace('-', ' ')}`,
    });
    onClose();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
    };
  };

  const startDateTime = formatDateTime(appointment.startTime);
  const endDateTime = formatDateTime(appointment.endTime);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Details
          </DialogTitle>
          <DialogDescription>
            Complete information for this appointment
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">{appointment.title}</h3>
              <Badge className={`mt-2 ${getStatusColor(appointment.status)}`}>
                {appointment.status.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>ID: {appointment.id}</p>
              <p>Type: {appointment.type.replace('-', ' ')}</p>
            </div>
          </div>

          {/* Time & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Time</span>
                </div>
                <p className="text-sm">{startDateTime.date}</p>
                <p className="text-lg font-semibold">
                  {startDateTime.time} - {endDateTime.time}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Location</span>
                </div>
                <p className="text-lg font-semibold">{appointment.location}</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {appointment.description && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Description</span>
                </div>
                <p className="text-sm text-muted-foreground">{appointment.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Recurring Info */}
          {appointment.isRecurring && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Recurring Appointment</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pattern: {appointment.recurrencePattern || 'Custom schedule'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Attendees & Reminders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Attendees</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {appointment.attendees.length} participant(s)
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Reminders</span>
                </div>
                <div className="space-y-1">
                  {appointment.reminders.map((reminder, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      {reminder.type} - {reminder.minutesBefore} min before
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {appointment.status === 'scheduled' && (
              <>
                <Button onClick={() => handleStatusUpdate('confirmed')} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm
                </Button>
                <Button 
                  onClick={() => handleStatusUpdate('in-progress')} 
                  variant="secondary"
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Visit
                </Button>
              </>
            )}
            
            {appointment.status === 'confirmed' && (
              <Button 
                onClick={() => handleStatusUpdate('in-progress')} 
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Visit
              </Button>
            )}
            
            {appointment.status === 'in-progress' && (
              <Button 
                onClick={() => handleStatusUpdate('completed')} 
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Visit
              </Button>
            )}
            
            {['scheduled', 'confirmed'].includes(appointment.status) && (
              <Button 
                onClick={() => handleStatusUpdate('cancelled')} 
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
            
            <Button variant="outline" className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const getStatusColor = (status: ScheduleEvent['status']) => {
  switch (status) {
    case 'scheduled': return 'bg-secondary text-secondary-foreground';
    case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'no-show': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function PatientSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<ScheduleEvent | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const data = await getPatientSchedule('doc1'); // TODO: Get from auth context
      setEvents(data);
    } catch (error) {
      console.error('Failed to load schedule:', error);
      toast({
        title: "Error",
        description: "Failed to load schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (appointmentId: string, newStatus: ScheduleEvent['status']) => {
    setEvents(prev => prev.map(event => 
      event.id === appointmentId 
        ? { ...event, status: newStatus, updatedAt: new Date().toISOString() }
        : event
    ));
  };

  const handleAppointmentClick = (appointment: ScheduleEvent) => {
    setSelectedAppointment(appointment);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    
    const eventDate = new Date(event.startTime);
    const isSelectedDay = eventDate.toDateString() === selectedDate.toDateString();
    
    return matchesSearch && matchesFilter && isSelectedDay;
  });

  const getStatusIcon = (status: ScheduleEvent['status']) => {
    switch (status) {
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'no-show': return <AlertCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: ScheduleEvent['type']) => {
    switch (type) {
      case 'patient-visit': return <User className="h-5 w-5" />;
      case 'consultation': return <Users className="h-5 w-5" />;
      case 'procedure': return <AlertCircle className="h-5 w-5" />;
      case 'meeting': return <Users className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
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

  const getDayStats = () => {
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === selectedDate.toDateString();
    });

    return {
      total: dayEvents.length,
      completed: dayEvents.filter(e => e.status === 'completed').length,
      inProgress: dayEvents.filter(e => e.status === 'in-progress').length,
      upcoming: dayEvents.filter(e => ['scheduled', 'confirmed'].includes(e.status)).length,
      cancelled: dayEvents.filter(e => ['cancelled', 'no-show'].includes(e.status)).length,
    };
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const quickActions = (appointment: ScheduleEvent): Array<{
    label: string;
    action: () => void;
    icon: React.ComponentType<{ className?: string }>;
  }> => {
    const actions: Array<{
      label: string;
      action: () => void;
      icon: React.ComponentType<{ className?: string }>;
    }> = [];
    
    if (appointment.status === 'scheduled') {
      actions.push(
        { label: 'Confirm', action: () => handleStatusUpdate(appointment.id, 'confirmed'), icon: CheckCircle },
        { label: 'Start Visit', action: () => handleStatusUpdate(appointment.id, 'in-progress'), icon: Play }
      );
    }
    
    if (appointment.status === 'confirmed') {
      actions.push(
        { label: 'Start Visit', action: () => handleStatusUpdate(appointment.id, 'in-progress'), icon: Play }
      );
    }
    
    if (appointment.status === 'in-progress') {
      actions.push(
        { label: 'Complete', action: () => handleStatusUpdate(appointment.id, 'completed'), icon: CheckCircle }
      );
    }
    
    if (['scheduled', 'confirmed'].includes(appointment.status)) {
      actions.push(
        { label: 'Cancel', action: () => handleStatusUpdate(appointment.id, 'cancelled'), icon: XCircle }
      );
    }
    
    return actions;
  };

  const stats = getDayStats();

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
                {stats.total} appointments • {stats.upcoming} upcoming • {stats.completed} completed
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
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.upcoming}</div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Upcoming</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.inProgress}</div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">In Progress</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.completed}</div>
                <p className="text-sm text-green-600 dark:text-green-400">Completed</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.cancelled}</div>
                <p className="text-sm text-red-600 dark:text-red-400">Cancelled</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.total}</div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Total</p>
              </CardContent>
            </Card>
          </div>

          {/* Date Navigation & View Toggle */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
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
                  <Button variant="ghost" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                </div>
                
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'calendar')}>
                  <TabsList>
                    <TabsTrigger value="list" className="flex items-center gap-2">
                      <List className="h-4 w-4" />
                      List
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Calendar
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
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
                    placeholder="Search appointments by patient name, location, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled'].map((status) => (
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

          {/* Schedule Content */}
          <Tabs value={viewMode} className="space-y-4">
            <TabsContent value="list" className="space-y-4">
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
                    <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              {getTypeIcon(event.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                                <div className="flex items-center gap-2">
                                  {event.isRecurring && (
                                    <Badge variant="outline" className="text-xs">
                                      <Repeat className="h-3 w-3 mr-1" />
                                      Recurring
                                    </Badge>
                                  )}
                                  <Badge className={getStatusColor(event.status)}>
                                    <span className="flex items-center gap-1">
                                      {getStatusIcon(event.status)}
                                      {event.status.replace('-', ' ')}
                                    </span>
                                  </Badge>
                                </div>
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
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAppointmentClick(event)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {quickActions(event).map((action, index) => (
                                  <DropdownMenuItem 
                                    key={index}
                                    onClick={action.action}
                                    className="flex items-center gap-2"
                                  >
                                    <action.icon className="h-4 w-4" />
                                    {action.label}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  Edit Appointment
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                                  <XCircle className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </TabsContent>
            
            <TabsContent value="calendar" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <CalendarDays className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Calendar View</h3>
                    <p className="text-muted-foreground">
                      Calendar view will be implemented in the next phase
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}