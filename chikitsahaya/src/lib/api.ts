import { 
  Patient, 
  Encounter, 
  Feature, 
  AIInsight, 
  ChatThread, 
  ChatMessage, 
  ScheduleEvent, 
  SearchResult,
  ExportOptions 
} from './types';

// Mock data for development
const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '1985-03-15',
    gender: 'female',
    contactNumber: '+1-555-0123',
    email: 'sarah.johnson@email.com',
    medicalRecordNumber: 'MR001234',
    allergies: ['Penicillin', 'Shellfish'],
    currentMedications: [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Daily',
        prescribedBy: 'Dr. Smith',
        startDate: '2024-01-15',
        active: true
      }
    ],
    chiefComplaint: 'Chest pain and shortness of breath',
    lastTriageScore: 85,
    hasAIInsights: true,
    status: 'waiting',
    assignedDoctorId: 'doc1',
    createdAt: '2024-09-20T08:30:00Z',
    updatedAt: '2024-09-20T09:15:00Z'
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    dateOfBirth: '1992-07-22',
    gender: 'male',
    contactNumber: '+1-555-0456',
    email: 'michael.chen@email.com',
    medicalRecordNumber: 'MR001235',
    allergies: ['Latex'],
    currentMedications: [],
    chiefComplaint: 'Severe headache and nausea',
    lastTriageScore: 72,
    hasAIInsights: false,
    status: 'in-progress',
    assignedDoctorId: 'doc1',
    createdAt: '2024-09-20T09:00:00Z',
    updatedAt: '2024-09-20T09:30:00Z'
  }
];

const mockFeatures: Feature[] = [
  {
    id: 'f1',
    patientId: '1',
    type: 'symptom',
    name: 'Chest pain',
    description: 'Sharp, stabbing pain in left chest',
    severity: 'moderate',
    onset: '2 hours ago',
    duration: 'Intermittent',
    location: 'Left chest',
    quality: 'Sharp, stabbing',
    isActive: true,
    confidence: 0.9,
    source: 'patient-reported',
    createdAt: '2024-09-20T08:30:00Z',
    updatedAt: '2024-09-20T08:30:00Z',
    createdBy: 'patient'
  }
];

const mockInsights: AIInsight[] = [
  {
    id: 'ai1',
    patientId: '1',
    type: 'differential-diagnosis',
    title: 'Potential Cardiac Events',
    content: 'Based on presenting symptoms and patient history, consider ruling out acute coronary syndrome.',
    severity: 'critical',
    confidence: 0.82,
    sources: ['Clinical presentation', 'Patient history', 'Age and gender'],
    recommendations: [
      'Order 12-lead ECG immediately',
      'Check troponin levels',
      'Monitor vital signs closely',
      'Consider chest X-ray'
    ],
    createdAt: '2024-09-20T08:35:00Z',
    isAcknowledged: false
  }
];

const mockScheduleEvents: ScheduleEvent[] = [
  {
    id: 'sch1',
    title: 'Sarah Johnson - Follow-up',
    type: 'patient-visit',
    startTime: '2024-09-20T14:00:00Z',
    endTime: '2024-09-20T14:30:00Z',
    location: 'Room 205',
    patientId: '1',
    doctorId: 'doc1',
    status: 'scheduled',
    isRecurring: false,
    attendees: ['doc1', '1'],
    reminders: [
      { type: 'email', minutesBefore: 60 },
      { type: 'sms', minutesBefore: 15 }
    ],
    createdAt: '2024-09-19T10:00:00Z',
    updatedAt: '2024-09-19T10:00:00Z'
  }
];

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Patient API
export const getPatients = async (): Promise<Patient[]> => {
  await delay(500);
  return mockPatients;
};

export const getPatient = async (id: string): Promise<Patient | null> => {
  await delay(300);
  return mockPatients.find(p => p.id === id) || null;
};

export const updatePatient = async (id: string, updates: Partial<Patient>): Promise<Patient> => {
  await delay(400);
  const patientIndex = mockPatients.findIndex(p => p.id === id);
  if (patientIndex === -1) throw new Error('Patient not found');
  
  mockPatients[patientIndex] = { ...mockPatients[patientIndex], ...updates };
  return mockPatients[patientIndex];
};

// Features API
export const getFeatures = async (patientId: string): Promise<Feature[]> => {
  await delay(300);
  return mockFeatures.filter(f => f.patientId === patientId);
};

export const upsertFeature = async (feature: Omit<Feature, 'id' | 'createdAt' | 'updatedAt'>): Promise<Feature> => {
  await delay(400);
  const newFeature: Feature = {
    ...feature,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockFeatures.push(newFeature);
  return newFeature;
};

export const removeFeature = async (id: string): Promise<void> => {
  await delay(300);
  const index = mockFeatures.findIndex(f => f.id === id);
  if (index > -1) mockFeatures.splice(index, 1);
};

// AI Insights API
export const getInsights = async (patientId: string): Promise<AIInsight[]> => {
  await delay(400);
  return mockInsights.filter(i => i.patientId === patientId);
};

export const acknowledgeInsight = async (id: string, userId: string): Promise<void> => {
  await delay(300);
  const insight = mockInsights.find(i => i.id === id);
  if (insight) {
    insight.isAcknowledged = true;
    insight.acknowledgedBy = userId;
    insight.acknowledgedAt = new Date().toISOString();
  }
};

// Chat API
export const getChatThreads = async (doctorId: string): Promise<ChatThread[]> => {
  await delay(300);
  // TODO: Implement mock chat threads
  return [];
};

export const getChatMessages = async (threadId: string): Promise<ChatMessage[]> => {
  await delay(300);
  // TODO: Implement mock chat messages
  return [];
};

export const sendMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> => {
  await delay(400);
  // TODO: Implement message sending
  const newMessage: ChatMessage = {
    ...message,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString()
  };
  return newMessage;
};

// Schedule API
export const getPatientSchedule = async (doctorId: string): Promise<ScheduleEvent[]> => {
  await delay(300);
  return mockScheduleEvents.filter(e => e.type === 'patient-visit' && e.doctorId === doctorId);
};

export const getDoctorSchedule = async (doctorId: string): Promise<ScheduleEvent[]> => {
  await delay(300);
  return mockScheduleEvents.filter(e => e.doctorId === doctorId);
};

// Search API
export const searchAll = async (query: string): Promise<SearchResult[]> => {
  await delay(400);
  
  const results: SearchResult[] = [];
  
  // Search patients
  mockPatients.forEach(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`;
    if (fullName.toLowerCase().includes(query.toLowerCase()) || 
        patient.medicalRecordNumber.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        id: patient.id,
        type: 'patient',
        title: fullName,
        subtitle: patient.medicalRecordNumber,
        description: patient.chiefComplaint || 'No chief complaint',
        relevanceScore: 0.9
      });
    }
  });
  
  // Search features
  mockFeatures.forEach(feature => {
    if (feature.name.toLowerCase().includes(query.toLowerCase()) ||
        feature.description?.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        id: feature.id,
        type: 'feature',
        title: feature.name,
        subtitle: feature.type,
        description: feature.description,
        relevanceScore: 0.7
      });
    }
  });
  
  return results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
};

// Export API
export const exportSummary = async (encounterId: string, options: ExportOptions): Promise<Blob> => {
  await delay(1000);
  
  // Mock export - in real implementation, this would generate actual files
  const mockData = {
    encounterId,
    exportedAt: new Date().toISOString(),
    format: options.format,
    data: 'Mock export data would be here'
  };
  
  return new Blob([JSON.stringify(mockData, null, 2)], { 
    type: options.format === 'json' ? 'application/json' : 'text/plain' 
  });
};

// Encounters API
export const getEncounters = async (patientId?: string): Promise<Encounter[]> => {
  await delay(400);
  // TODO: Implement mock encounters
  return [];
};

export const createEncounter = async (encounter: Omit<Encounter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Encounter> => {
  await delay(500);
  // TODO: Implement encounter creation
  const newEncounter: Encounter = {
    ...encounter,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return newEncounter;
};