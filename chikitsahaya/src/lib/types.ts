export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  contactNumber: string;
  email?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalRecordNumber: string;
  insuranceId?: string;
  allergies: string[];
  currentMedications: Medication[];
  chiefComplaint?: string;
  lastTriageScore?: number;
  hasAIInsights?: boolean;
  status: 'waiting' | 'in-progress' | 'completed' | 'no-show';
  assignedDoctorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
  active: boolean;
}

export interface Vitals {
  temperature: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  height?: number;
  weight?: number;
  bmi?: number;
  painLevel?: number;
  recordedAt: string;
  recordedBy: string;
}

export interface Feature {
  id: string;
  patientId: string;
  encounterId?: string;
  type: 'symptom' | 'finding' | 'diagnosis' | 'procedure';
  name: string;
  description?: string;
  severity?: 'mild' | 'moderate' | 'severe' | 'critical';
  onset?: string;
  duration?: string;
  location?: string;
  quality?: string;
  associatedFactors?: string[];
  relievingFactors?: string[];
  aggravatingFactors?: string[];
  isActive: boolean;
  confidence?: number;
  source: 'patient-reported' | 'clinician-observed' | 'ai-extracted';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Encounter {
  id: string;
  patientId: string;
  doctorId: string;
  type: 'emergency' | 'urgent-care' | 'routine' | 'follow-up' | 'telemedicine';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  chiefComplaint: string;
  presentingSymptoms: string[];
  vitals?: Vitals;
  features: Feature[];
  triageScore: number;
  triageLevel: 'low' | 'moderate' | 'high' | 'critical';
  notes: EncounterNote[];
  diagnosis?: string[];
  treatment?: string[];
  disposition: 'home' | 'admitted' | 'transferred' | 'observation' | 'deceased';
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface EncounterNote {
  id: string;
  encounterId: string;
  type: 'assessment' | 'plan' | 'subjective' | 'objective' | 'general';
  content: string;
  createdBy: string;
  createdAt: string;
  isPrivate: boolean;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderType: 'doctor' | 'patient' | 'ai-assistant' | 'system';
  content: string;
  timestamp: string;
  messageType: 'text' | 'audio' | 'image' | 'document';
  attachments?: Attachment[];
  isRead: boolean;
  metadata?: Record<string, any>;
}

export interface ChatThread {
  id: string;
  patientId: string;
  doctorId: string;
  encounterId?: string;
  title: string;
  status: 'active' | 'resolved' | 'archived';
  lastMessage?: ChatMessage;
  unreadCount: number;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface PossibleDisease {
  id: string;
  name: string;
  probability: number;
  description: string;
  symptoms: string[];
  isCustom?: boolean;
}

export interface ActionPlan {
  id: string;
  diseaseId: string;
  steps: ActionStep[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: string;
  followUpRequired: boolean;
  createdAt: string;
}

export interface ActionStep {
  id: string;
  title: string;
  description: string;
  type: 'diagnostic' | 'treatment' | 'monitoring' | 'referral';
  priority: 'immediate' | 'urgent' | 'routine';
  estimatedTime?: string;
  resources?: string[];
}

export interface AIInsight {
  id: string;
  patientId: string;
  encounterId?: string;
  type: 'differential-diagnosis' | 'risk-assessment' | 'recommendation' | 'alert';
  title: string;
  content: string;
  severity: 'info' | 'warning' | 'critical';
  confidence: number;
  sources: string[];
  recommendations: string[];
  possibleDiseases: PossibleDisease[];
  selectedDisease?: PossibleDisease;
  actionPlan?: ActionPlan;
  createdAt: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  metadata?: {
    algorithms?: string[];
    dataPoints?: string[];
    references?: string[];
  };
}

export interface ScheduleEvent {
  id: string;
  title: string;
  type: 'patient-visit' | 'doctor-shift' | 'consultation' | 'procedure' | 'meeting';
  startTime: string;
  endTime: string;
  location: string;
  description?: string;
  patientId?: string;
  doctorId?: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  isRecurring: boolean;
  recurrencePattern?: string;
  attendees: string[];
  reminders: {
    type: 'email' | 'sms' | 'push';
    minutesBefore: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  licenseNumber: string;
  email: string;
  phone: string;
  department: string;
  isActive: boolean;
  schedule: ScheduleEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ExportFormat {
  type: 'pdf' | 'docx' | 'json' | 'fhir';
  label: string;
  description: string;
}

export interface ExportOptions {
  format: ExportFormat['type'];
  includeVitals: boolean;
  includeMedications: boolean;
  includeProblemList: boolean;
  includeFeatures: boolean;
  includeNotes: boolean;
  includeInsights: boolean;
  includeDiagnosis: boolean;
  includeActionPlan: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SearchResult {
  id: string;
  type: 'patient' | 'encounter' | 'conversation' | 'feature' | 'insight' | 'schedule';
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: Record<string, any>;
  relevanceScore?: number;
}

export type UrgencyLevel = 'low' | 'moderate' | 'high' | 'critical';
export type PatientStatus = 'waiting' | 'in-progress' | 'completed' | 'no-show';
export type EncounterStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';