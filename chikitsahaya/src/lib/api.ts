import { 
  Patient, 
  Encounter, 
  Feature, 
  AIInsight, 
  ChatThread, 
  ChatMessage, 
  ScheduleEvent, 
  SearchResult,
  ExportOptions,
  PossibleDisease,
  ActionPlan 
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
    possibleDiseases: [
      {
        id: 'disease1',
        name: 'Acute Coronary Syndrome',
        probability: 0.75,
        description: 'Sudden reduced blood flow to the heart muscle',
        symptoms: ['Chest pain', 'Shortness of breath', 'Nausea', 'Sweating']
      },
      {
        id: 'disease2',
        name: 'Pulmonary Embolism',
        probability: 0.65,
        description: 'Blood clot blocking blood flow to lungs',
        symptoms: ['Chest pain', 'Shortness of breath', 'Rapid heart rate']
      },
      {
        id: 'disease3',
        name: 'Anxiety/Panic Attack',
        probability: 0.45,
        description: 'Acute anxiety response with physical symptoms',
        symptoms: ['Chest tightness', 'Palpitations', 'Shortness of breath', 'Sweating']
      }
    ],
    createdAt: '2024-09-20T08:35:00Z',
    isAcknowledged: false
  }
];

const mockScheduleEvents: ScheduleEvent[] = [
  // Today's appointments (September 21, 2025)
  {
    id: 'sch1',
    title: 'Sarah Johnson - Cardiology Follow-up',
    type: 'patient-visit',
    startTime: '2025-09-21T09:00:00Z',
    endTime: '2025-09-21T09:30:00Z',
    location: 'Room 205 - Cardiology Wing',
    description: 'Post-MI follow-up, review test results and medication adjustment',
    patientId: '1',
    doctorId: 'doc1',
    status: 'confirmed',
    isRecurring: false,
    attendees: ['doc1', '1'],
    reminders: [
      { type: 'email', minutesBefore: 60 },
      { type: 'sms', minutesBefore: 15 }
    ],
    createdAt: '2025-09-20T10:00:00Z',
    updatedAt: '2025-09-20T10:00:00Z'
  },
  {
    id: 'sch2',
    title: 'Michael Chen - Emergency Consultation',
    type: 'patient-visit',
    startTime: '2025-09-21T09:45:00Z',
    endTime: '2025-09-21T10:15:00Z',
    location: 'ER Bay 3',
    description: 'Severe headache and nausea, possible migraine or neurological issue',
    patientId: '2',
    doctorId: 'doc1',
    status: 'in-progress',
    isRecurring: false,
    attendees: ['doc1', '2'],
    reminders: [
      { type: 'push', minutesBefore: 5 }
    ],
    createdAt: '2025-09-21T09:30:00Z',
    updatedAt: '2025-09-21T09:40:00Z'
  },
  {
    id: 'sch3',
    title: 'Emma Rodriguez - Routine Check-up',
    type: 'patient-visit',
    startTime: '2025-09-21T10:30:00Z',
    endTime: '2025-09-21T11:00:00Z',
    location: 'Room 110 - General Medicine',
    description: 'Annual physical examination and preventive care screening',
    patientId: '3',
    doctorId: 'doc1',
    status: 'scheduled',
    isRecurring: true,
    recurrencePattern: 'yearly',
    attendees: ['doc1', '3'],
    reminders: [
      { type: 'email', minutesBefore: 1440 }, // 24 hours
      { type: 'sms', minutesBefore: 60 }
    ],
    createdAt: '2025-09-10T14:00:00Z',
    updatedAt: '2025-09-10T14:00:00Z'
  },
  {
    id: 'sch4',
    title: 'James Thompson - Diabetes Management',
    type: 'patient-visit',
    startTime: '2025-09-21T11:15:00Z',
    endTime: '2025-09-21T11:45:00Z',
    location: 'Room 201 - Endocrinology',
    description: 'Type 2 diabetes follow-up, A1C results review, insulin adjustment',
    patientId: '4',
    doctorId: 'doc1',
    status: 'scheduled',
    isRecurring: true,
    recurrencePattern: 'every 3 months',
    attendees: ['doc1', '4'],
    reminders: [
      { type: 'email', minutesBefore: 120 },
      { type: 'sms', minutesBefore: 30 }
    ],
    createdAt: '2025-09-14T16:30:00Z',
    updatedAt: '2025-09-14T16:30:00Z'
  },
  {
    id: 'sch5',
    title: 'Dr. Wilson - Team Meeting',
    type: 'meeting',
    startTime: '2025-09-21T12:00:00Z',
    endTime: '2025-09-21T13:00:00Z',
    location: 'Conference Room A',
    description: 'Weekly multidisciplinary team meeting - case reviews and care coordination',
    doctorId: 'doc1',
    status: 'scheduled',
    isRecurring: true,
    recurrencePattern: 'weekly',
    attendees: ['doc1', 'doc2', 'doc3', 'nurse1', 'nurse2'],
    reminders: [
      { type: 'push', minutesBefore: 15 }
    ],
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z'
  },
  {
    id: 'sch6',
    title: 'Lisa Park - Pediatric Consultation',
    type: 'patient-visit',
    startTime: '2025-09-21T14:00:00Z',
    endTime: '2025-09-21T14:30:00Z',
    location: 'Room 305 - Pediatrics',
    description: 'Child wellness exam, immunizations, growth assessment',
    patientId: '5',
    doctorId: 'doc1',
    status: 'confirmed',
    isRecurring: false,
    attendees: ['doc1', '5'],
    reminders: [
      { type: 'email', minutesBefore: 480 }, // 8 hours
      { type: 'sms', minutesBefore: 60 }
    ],
    createdAt: '2025-09-18T11:20:00Z',
    updatedAt: '2025-09-19T09:15:00Z'
  },
  {
    id: 'sch7',
    title: 'Robert Williams - Orthopedic Follow-up',
    type: 'patient-visit',
    startTime: '2025-09-21T14:45:00Z',
    endTime: '2025-09-21T15:15:00Z',
    location: 'Room 408 - Orthopedics',
    description: 'Post-surgery knee replacement follow-up, physical therapy evaluation',
    patientId: '6',
    doctorId: 'doc1',
    status: 'scheduled',
    isRecurring: false,
    attendees: ['doc1', '6'],
    reminders: [
      { type: 'email', minutesBefore: 240 },
      { type: 'sms', minutesBefore: 30 }
    ],
    createdAt: '2025-09-15T13:45:00Z',
    updatedAt: '2025-09-15T13:45:00Z'
  },
  {
    id: 'sch8',
    title: 'Maria Garcia - Prenatal Visit',
    type: 'patient-visit',
    startTime: '2025-09-21T15:30:00Z',
    endTime: '2025-09-21T16:00:00Z',
    location: 'Room 220 - OB/GYN',
    description: '32-week prenatal check, ultrasound and fetal monitoring',
    patientId: '7',
    doctorId: 'doc1',
    status: 'confirmed',
    isRecurring: true,
    recurrencePattern: 'bi-weekly',
    attendees: ['doc1', '7'],
    reminders: [
      { type: 'email', minutesBefore: 180 },
      { type: 'sms', minutesBefore: 45 }
    ],
    createdAt: '2025-09-07T15:00:00Z',
    updatedAt: '2025-09-07T15:00:00Z'
  },
  {
    id: 'sch9',
    title: 'David Kim - Therapy Session',
    type: 'consultation',
    startTime: '2025-09-21T16:15:00Z',
    endTime: '2025-09-21T17:00:00Z',
    location: 'Room 115 - Mental Health',
    description: 'Cognitive behavioral therapy session for anxiety management',
    patientId: '8',
    doctorId: 'doc1',
    status: 'scheduled',
    isRecurring: true,
    recurrencePattern: 'weekly',
    attendees: ['doc1', '8'],
    reminders: [
      { type: 'email', minutesBefore: 120 },
      { type: 'sms', minutesBefore: 60 }
    ],
    createdAt: '2025-09-01T14:30:00Z',
    updatedAt: '2025-09-01T14:30:00Z'
  },
  {
    id: 'sch10',
    title: 'Anna Johnson - Cancelled Appointment',
    type: 'patient-visit',
    startTime: '2025-09-21T17:15:00Z',
    endTime: '2025-09-21T17:45:00Z',
    location: 'Room 103 - General Medicine',
    description: 'Patient cancelled due to family emergency, needs rescheduling',
    patientId: '9',
    doctorId: 'doc1',
    status: 'cancelled',
    isRecurring: false,
    attendees: ['doc1', '9'],
    reminders: [],
    createdAt: '2025-09-16T10:20:00Z',
    updatedAt: '2025-09-21T08:30:00Z'
  },
  
  // Yesterday's appointments (September 20, 2025)
  {
    id: 'sch11',
    title: 'John Davis - Completed Visit',
    type: 'patient-visit',
    startTime: '2025-09-20T14:00:00Z',
    endTime: '2025-09-20T14:30:00Z',
    location: 'Room 205',
    description: 'Routine check-up completed successfully',
    patientId: '10',
    doctorId: 'doc1',
    status: 'completed',
    isRecurring: false,
    attendees: ['doc1', '10'],
    reminders: [],
    createdAt: '2025-09-19T10:00:00Z',
    updatedAt: '2025-09-20T14:30:00Z'
  },
  {
    id: 'sch12',
    title: 'Sandra Lee - No Show',
    type: 'patient-visit',
    startTime: '2025-09-20T15:00:00Z',
    endTime: '2025-09-20T15:30:00Z',
    location: 'Room 101',
    description: 'Patient did not arrive for scheduled appointment',
    patientId: '11',
    doctorId: 'doc1',
    status: 'no-show',
    isRecurring: false,
    attendees: ['doc1', '11'],
    reminders: [],
    createdAt: '2025-09-18T09:00:00Z',
    updatedAt: '2025-09-20T15:35:00Z'
  },
  
  // Tomorrow's appointments (September 22, 2025)
  {
    id: 'sch13',
    title: 'Patricia Brown - New Patient Intake',
    type: 'patient-visit',
    startTime: '2025-09-22T09:00:00Z',
    endTime: '2025-09-22T10:00:00Z',
    location: 'Room 102 - General Medicine',
    description: 'New patient comprehensive examination and medical history review',
    patientId: '12',
    doctorId: 'doc1',
    status: 'scheduled',
    isRecurring: false,
    attendees: ['doc1', '12'],
    reminders: [
      { type: 'email', minutesBefore: 1440 },
      { type: 'sms', minutesBefore: 120 }
    ],
    createdAt: '2025-09-15T11:30:00Z',
    updatedAt: '2025-09-15T11:30:00Z'
  },
  {
    id: 'sch14',
    title: 'Mark Wilson - Surgical Consultation',
    type: 'consultation',
    startTime: '2025-09-22T10:30:00Z',
    endTime: '2025-09-22T11:30:00Z',
    location: 'Room 401 - Surgery',
    description: 'Pre-operative consultation for gallbladder surgery',
    patientId: '13',
    doctorId: 'doc1',
    status: 'confirmed',
    isRecurring: false,
    attendees: ['doc1', '13'],
    reminders: [
      { type: 'email', minutesBefore: 720 },
      { type: 'sms', minutesBefore: 60 }
    ],
    createdAt: '2025-09-10T16:45:00Z',
    updatedAt: '2025-09-20T14:20:00Z'
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

export const addCustomDisease = async (insightId: string, disease: Omit<PossibleDisease, 'id'>): Promise<PossibleDisease> => {
  await delay(400);
  const insight = mockInsights.find(i => i.id === insightId);
  if (!insight) throw new Error('Insight not found');
  
  const newDisease: PossibleDisease = {
    ...disease,
    id: Math.random().toString(36).substr(2, 9),
    isCustom: true
  };
  
  insight.possibleDiseases.push(newDisease);
  return newDisease;
};

export const getActionPlan = async (diseaseId: string, patientId: string): Promise<ActionPlan> => {
  await delay(800); // Simulate AI processing time
  
  // Mock action plan based on disease
  const mockActionPlans: Record<string, Omit<ActionPlan, 'id' | 'diseaseId' | 'createdAt'>> = {
    'disease1': {
      steps: [
        {
          id: 'step1',
          title: 'Immediate ECG',
          description: 'Perform 12-lead ECG to assess cardiac rhythm and signs of ischemia',
          type: 'diagnostic',
          priority: 'immediate',
          estimatedTime: '5 minutes',
          resources: ['ECG machine', 'ECG leads']
        },
        {
          id: 'step2',
          title: 'Cardiac Biomarkers',
          description: 'Draw blood for troponin I/T, CK-MB levels',
          type: 'diagnostic',
          priority: 'immediate',
          estimatedTime: '15 minutes',
          resources: ['Blood draw kit', 'Lab processing']
        },
        {
          id: 'step3',
          title: 'Aspirin Administration',
          description: 'Give 325mg aspirin unless contraindicated',
          type: 'treatment',
          priority: 'urgent',
          estimatedTime: '2 minutes'
        },
        {
          id: 'step4',
          title: 'Cardiology Consultation',
          description: 'Contact cardiology for urgent evaluation',
          type: 'referral',
          priority: 'urgent',
          estimatedTime: '30 minutes'
        }
      ],
      urgency: 'critical',
      estimatedDuration: '2-4 hours',
      followUpRequired: true
    },
    'disease2': {
      steps: [
        {
          id: 'step1',
          title: 'CT Pulmonary Angiogram',
          description: 'CTPA to confirm pulmonary embolism',
          type: 'diagnostic',
          priority: 'immediate',
          estimatedTime: '30 minutes',
          resources: ['CT scanner', 'Contrast agent']
        },
        {
          id: 'step2',
          title: 'D-dimer Test',
          description: 'Blood test for D-dimer levels',
          type: 'diagnostic',
          priority: 'urgent',
          estimatedTime: '15 minutes'
        },
        {
          id: 'step3',
          title: 'Anticoagulation',
          description: 'Start heparin or DOAC therapy if confirmed',
          type: 'treatment',
          priority: 'urgent',
          estimatedTime: '10 minutes'
        }
      ],
      urgency: 'high',
      estimatedDuration: '3-6 hours',
      followUpRequired: true
    },
    'disease3': {
      steps: [
        {
          id: 'step1',
          title: 'Reassurance and Education',
          description: 'Explain nature of panic attack and provide reassurance',
          type: 'treatment',
          priority: 'routine',
          estimatedTime: '15 minutes'
        },
        {
          id: 'step2',
          title: 'Breathing Exercises',
          description: 'Teach and practice controlled breathing techniques',
          type: 'treatment',
          priority: 'routine',
          estimatedTime: '10 minutes'
        },
        {
          id: 'step3',
          title: 'Psychology Referral',
          description: 'Refer to mental health services if recurrent episodes',
          type: 'referral',
          priority: 'routine',
          estimatedTime: 'Ongoing'
        }
      ],
      urgency: 'low',
      estimatedDuration: '1-2 hours',
      followUpRequired: false
    }
  };
  
  const planTemplate = mockActionPlans[diseaseId] || mockActionPlans['disease3'];
  
  const actionPlan: ActionPlan = {
    id: Math.random().toString(36).substr(2, 9),
    diseaseId,
    createdAt: new Date().toISOString(),
    ...planTemplate
  };
  
  return actionPlan;
};

export const updateInsightWithDisease = async (insightId: string, disease: PossibleDisease, actionPlan?: ActionPlan): Promise<AIInsight> => {
  await delay(300);
  const insight = mockInsights.find(i => i.id === insightId);
  if (!insight) throw new Error('Insight not found');
  
  insight.selectedDisease = disease;
  if (actionPlan) {
    insight.actionPlan = actionPlan;
  }
  
  return insight;
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
  return mockScheduleEvents.filter(e => e.doctorId === doctorId);
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
export const exportSummary = async (encounterId: string, options: ExportOptions, selectedDisease?: any, actionPlan?: any): Promise<Blob> => {
  await delay(1000);
  
  // Get patient data (mock - in real app would fetch from API)
  const patient = mockPatients.find(p => p.id === '1') || mockPatients[0];
  const insights = mockInsights.filter(i => i.patientId === patient.id);
  const features = mockFeatures.filter(f => f.patientId === patient.id);
  
  const exportData = {
    patient,
    encounterId,
    exportedAt: new Date().toISOString(),
    selectedDisease,
    actionPlan,
    insights: options.includeInsights ? insights : [],
    features: options.includeFeatures ? features : [],
    vitals: options.includeVitals ? {
      temperature: 98.6,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRate: 72,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      recordedAt: new Date().toISOString(),
      recordedBy: 'Dr. Smith'
    } : null,
    medications: options.includeMedications ? patient.currentMedications : [],
    notes: options.includeNotes ? [
      'Patient presents with chest discomfort and shortness of breath.',
      'Physical examination reveals normal heart sounds.',
      'No signs of acute distress noted.'
    ] : []
  };
  
  switch (options.format) {
    case 'json':
      return generateJSONExport(exportData);
    case 'fhir':
      return generateFHIRExport(exportData);
    case 'pdf':
      return generatePDFExport(exportData, options);
    case 'docx':
      return generateDOCXExport(exportData, options);
    default:
      return generateJSONExport(exportData);
  }
};

const generateJSONExport = (data: any): Blob => {
  const jsonContent = JSON.stringify(data, null, 2);
  return new Blob([jsonContent], { type: 'application/json' });
};

const generateFHIRExport = (data: any): Blob => {
  const fhirBundle = {
    resourceType: 'Bundle',
    id: data.encounterId,
    type: 'document',
    timestamp: data.exportedAt,
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: data.patient.id,
          name: [{
            given: [data.patient.firstName],
            family: data.patient.lastName
          }],
          gender: data.patient.gender,
          birthDate: data.patient.dateOfBirth,
          telecom: [{
            system: 'phone',
            value: data.patient.contactNumber
          }],
          identifier: [{
            system: 'medical-record-number',
            value: data.patient.medicalRecordNumber
          }]
        }
      },
      ...(data.vitals ? [{
        resource: {
          resourceType: 'Observation',
          status: 'final',
          category: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs'
            }]
          }],
          subject: { reference: `Patient/${data.patient.id}` },
          effectiveDateTime: data.vitals.recordedAt,
          component: [
            {
              code: { coding: [{ code: '8480-6', display: 'Systolic blood pressure' }] },
              valueQuantity: { value: data.vitals.bloodPressureSystolic, unit: 'mmHg' }
            },
            {
              code: { coding: [{ code: '8462-4', display: 'Diastolic blood pressure' }] },
              valueQuantity: { value: data.vitals.bloodPressureDiastolic, unit: 'mmHg' }
            },
            {
              code: { coding: [{ code: '8867-4', display: 'Heart rate' }] },
              valueQuantity: { value: data.vitals.heartRate, unit: 'beats/min' }
            }
          ]
        }
      }] : []),
      ...(data.insights && data.insights.length > 0 ? [{
        resource: {
          resourceType: 'ClinicalImpression',
          status: 'completed',
          subject: { reference: `Patient/${data.patient.id}` },
          summary: 'AI-generated clinical insights and recommendations',
          finding: [
            { itemCodeableConcept: { text: 'Consider ruling out acute coronary syndrome based on symptoms' } },
            { itemCodeableConcept: { text: 'Recommend ECG and cardiac enzyme testing' } },
            { itemCodeableConcept: { text: 'Monitor vital signs closely for changes' } },
            { itemCodeableConcept: { text: 'Patient may benefit from cardiology consultation' } }
          ]
        }
      }] : []),
      ...(data.selectedDisease ? [{
        resource: {
          resourceType: 'Condition',
          clinicalStatus: { coding: [{ code: 'active' }] },
          code: { text: data.selectedDisease.name },
          subject: { reference: `Patient/${data.patient.id}` },
          recordedDate: new Date().toISOString(),
          note: [{ text: data.selectedDisease.description }]
        }
      }] : []),
      ...(data.actionPlan ? [{
        resource: {
          resourceType: 'CarePlan',
          status: 'active',
          intent: 'plan',
          title: 'Treatment Plan',
          subject: { reference: `Patient/${data.patient.id}` },
          description: `${data.actionPlan.urgency} priority plan with estimated duration: ${data.actionPlan.estimatedDuration}`,
          activity: data.actionPlan.steps.map((step: any, index: number) => ({
            detail: {
              code: { text: step.title },
              status: 'not-started',
              description: step.description,
              scheduledTiming: step.estimatedTime ? { repeat: { duration: step.estimatedTime } } : undefined
            }
          }))
        }
      }] : [])
    ]
  };
  
  return new Blob([JSON.stringify(fhirBundle, null, 2)], { type: 'application/fhir+json' });
};

const generatePDFExport = (data: any, options: ExportOptions): Blob => {
  // For a real implementation, you'd use a library like jsPDF or PDFKit
  // This creates a simple text-based "PDF" for demonstration
  let content = `MEDICAL SUMMARY\n`;
  content += `================\n\n`;
  content += `Patient: ${data.patient.firstName} ${data.patient.lastName}\n`;
  content += `MRN: ${data.patient.medicalRecordNumber}\n`;
  content += `Date: ${new Date(data.exportedAt).toLocaleDateString()}\n`;
  content += `Encounter ID: ${data.encounterId}\n\n`;
  
  if (options.includeVitals && data.vitals) {
    content += `VITAL SIGNS\n`;
    content += `-----------\n`;
    content += `Blood Pressure: ${data.vitals.bloodPressureSystolic}/${data.vitals.bloodPressureDiastolic} mmHg\n`;
    content += `Heart Rate: ${data.vitals.heartRate} bpm\n`;
    content += `Temperature: ${data.vitals.temperature}°F\n`;
    content += `Oxygen Saturation: ${data.vitals.oxygenSaturation}%\n\n`;
  }
  
  if (options.includeMedications && data.medications.length > 0) {
    content += `CURRENT MEDICATIONS\n`;
    content += `------------------\n`;
    data.medications.forEach((med: any) => {
      content += `• ${med.name} ${med.dosage} - ${med.frequency}\n`;
    });
    content += `\n`;
  }
  
  if (options.includeFeatures && data.features.length > 0) {
    content += `SYMPTOMS & FINDINGS\n`;
    content += `------------------\n`;
    data.features.forEach((feature: any) => {
      content += `• ${feature.name}`;
      if (feature.severity) content += ` (${feature.severity})`;
      if (feature.description) content += ` - ${feature.description}`;
      content += `\n`;
    });
    content += `\n`;
  }
  
  if (options.includeInsights) {
    content += `AI INSIGHTS & RECOMMENDATIONS\n`;
    content += `-----------------------------\n`;
    content += `• Consider ruling out acute coronary syndrome based on symptoms\n`;
    content += `• Recommend ECG and cardiac enzyme testing\n`;
    content += `• Monitor vital signs closely for changes\n`;
    content += `• Patient may benefit from cardiology consultation\n`;
    content += `\n`;
  }
  
  if (options.includeDiagnosis && data.selectedDisease) {
    content += `SELECTED DIAGNOSIS\n`;
    content += `-----------------\n`;
    content += `Primary Diagnosis: ${data.selectedDisease.name}\n`;
    content += `Confidence: ${Math.round(data.selectedDisease.probability * 100)}%\n`;
    content += `Description: ${data.selectedDisease.description}\n`;
    if (data.selectedDisease.isCustom) {
      content += `Note: Doctor-added diagnosis\n`;
    }
    content += `\n`;
  }
  
  if (options.includeActionPlan && data.actionPlan) {
    content += `TREATMENT PLAN\n`;
    content += `-------------\n`;
    content += `Urgency: ${data.actionPlan.urgency.toUpperCase()}\n`;
    content += `Duration: ${data.actionPlan.estimatedDuration}\n`;
    content += `Follow-up Required: ${data.actionPlan.followUpRequired ? 'Yes' : 'No'}\n\n`;
    content += `Action Steps:\n`;
    data.actionPlan.steps.forEach((step: any, index: number) => {
      content += `${index + 1}. ${step.title} (${step.priority})\n`;
      content += `   ${step.description}\n`;
      if (step.estimatedTime) {
        content += `   Time: ${step.estimatedTime}\n`;
      }
      content += `\n`;
    });
  }
  
  if (options.includeNotes && data.notes.length > 0) {
    content += `CLINICAL NOTES\n`;
    content += `-------------\n`;
    data.notes.forEach((note: string) => {
      content += `${note}\n`;
    });
    content += `\n`;
  }
  
  return new Blob([content], { type: 'application/pdf' });
};

const generateDOCXExport = (data: any, options: ExportOptions): Blob => {
  // For a real implementation, you'd use a library like docx or mammoth
  // This creates a simple text-based document for demonstration
  let content = `<!DOCTYPE html>
<html>
<head>
  <title>Medical Summary</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #2563eb; border-bottom: 2px solid #2563eb; }
    h2 { color: #1e40af; margin-top: 30px; }
    .header { text-align: center; margin-bottom: 30px; }
    .section { margin-bottom: 20px; }
    .medication, .symptom, .step { margin: 5px 0; padding: 5px; background: #f8f9fa; }
    .diagnosis { background: #e0f2fe; padding: 15px; border-left: 4px solid #0288d1; }
  </style>
</head>
<body>
  <div class="header">
    <h1>MEDICAL SUMMARY</h1>
    <p><strong>Patient:</strong> ${data.patient.firstName} ${data.patient.lastName}</p>
    <p><strong>MRN:</strong> ${data.patient.medicalRecordNumber}</p>
    <p><strong>Date:</strong> ${new Date(data.exportedAt).toLocaleDateString()}</p>
    <p><strong>Encounter ID:</strong> ${data.encounterId}</p>
  </div>`;
  
  if (options.includeVitals && data.vitals) {
    content += `
    <div class="section">
      <h2>Vital Signs</h2>
      <p><strong>Blood Pressure:</strong> ${data.vitals.bloodPressureSystolic}/${data.vitals.bloodPressureDiastolic} mmHg</p>
      <p><strong>Heart Rate:</strong> ${data.vitals.heartRate} bpm</p>
      <p><strong>Temperature:</strong> ${data.vitals.temperature}°F</p>
      <p><strong>Oxygen Saturation:</strong> ${data.vitals.oxygenSaturation}%</p>
    </div>`;
  }
  
  if (options.includeMedications && data.medications.length > 0) {
    content += `
    <div class="section">
      <h2>Current Medications</h2>`;
    data.medications.forEach((med: any) => {
      content += `<div class="medication">• ${med.name} ${med.dosage} - ${med.frequency}</div>`;
    });
    content += `</div>`;
  }
  
  if (options.includeInsights) {
    content += `
    <div class="section">
      <h2>AI Insights & Recommendations</h2>
      <div class="medication">• Consider ruling out acute coronary syndrome based on symptoms</div>
      <div class="medication">• Recommend ECG and cardiac enzyme testing</div>
      <div class="medication">• Monitor vital signs closely for changes</div>
      <div class="medication">• Patient may benefit from cardiology consultation</div>
    </div>`;
  }
  
  if (options.includeDiagnosis && data.selectedDisease) {
    content += `
    <div class="section">
      <h2>Selected Diagnosis</h2>
      <div class="diagnosis">
        <p><strong>Primary Diagnosis:</strong> ${data.selectedDisease.name}</p>
        <p><strong>Confidence:</strong> ${Math.round(data.selectedDisease.probability * 100)}%</p>
        <p><strong>Description:</strong> ${data.selectedDisease.description}</p>
        ${data.selectedDisease.isCustom ? '<p><em>Doctor-added diagnosis</em></p>' : ''}
      </div>
    </div>`;
  }
  
  if (options.includeActionPlan && data.actionPlan) {
    content += `
    <div class="section">
      <h2>Treatment Plan</h2>
      <p><strong>Urgency:</strong> ${data.actionPlan.urgency.toUpperCase()}</p>
      <p><strong>Duration:</strong> ${data.actionPlan.estimatedDuration}</p>
      <p><strong>Follow-up Required:</strong> ${data.actionPlan.followUpRequired ? 'Yes' : 'No'}</p>
      <h3>Action Steps:</h3>`;
    data.actionPlan.steps.forEach((step: any, index: number) => {
      content += `
      <div class="step">
        <strong>${index + 1}. ${step.title}</strong> (${step.priority})<br>
        ${step.description}
        ${step.estimatedTime ? `<br><em>Time: ${step.estimatedTime}</em>` : ''}
      </div>`;
    });
    content += `</div>`;
  }
  
  content += `</body></html>`;
  
  return new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
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