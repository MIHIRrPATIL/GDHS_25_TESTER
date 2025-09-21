import { useState, useCallback, useRef, useEffect } from 'react';

export interface MicState {
  isRecording: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
  volume: number;
}

export interface DualMicState {
  doctor: MicState;
  patient: MicState;
  isConnected: boolean;
  sessionDuration: number;
}

export const useDualMic = () => {
  const [state, setState] = useState<DualMicState>({
    doctor: {
      isRecording: false,
      transcript: '',
      isSupported: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window,
      error: null,
      volume: 0
    },
    patient: {
      isRecording: false,
      transcript: '',
      isSupported: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window,
      error: null,
      volume: 0
    },
    isConnected: false,
    sessionDuration: 0
  });

  const doctorRecognition = useRef<any>(null);
  const patientRecognition = useRef<any>(null);
  const sessionStartTime = useRef<number>(0);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  // Mock mode for when speech recognition is not available
  const mockMode = !state.doctor.isSupported;

  const initializeRecognition = useCallback((type: 'doctor' | 'patient') => {
    if (mockMode) return null;

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setState(prev => ({
        ...prev,
        [type]: { ...prev[type], isRecording: true, error: null }
      }));
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      
      setState(prev => ({
        ...prev,
        [type]: { ...prev[type], transcript }
      }));
    };

    recognition.onerror = (event: any) => {
      setState(prev => ({
        ...prev,
        [type]: { ...prev[type], error: event.error, isRecording: false }
      }));
    };

    recognition.onend = () => {
      setState(prev => ({
        ...prev,
        [type]: { ...prev[type], isRecording: false }
      }));
    };

    return recognition;
  }, [mockMode]);

  const startMic = useCallback(async (type: 'doctor' | 'patient') => {
    try {
      // Request microphone permissions
      await navigator.mediaDevices.getUserMedia({ audio: true });

      if (mockMode) {
        // Mock speech recognition for demo
        setState(prev => ({
          ...prev,
          [type]: { ...prev[type], isRecording: true, error: null }
        }));

        // Simulate speech recognition with mock data
        setTimeout(() => {
          const mockTranscripts = {
            doctor: [
              "How are you feeling today?",
              "Can you describe the pain you're experiencing?",
              "When did these symptoms first start?",
              "Have you taken any medication for this?"
            ],
            patient: [
              "I've been having chest pain since this morning",
              "It's a sharp pain that comes and goes",
              "I haven't taken anything for it yet",
              "It gets worse when I take deep breaths"
            ]
          };

          const transcripts = mockTranscripts[type];
          const randomTranscript = transcripts[Math.floor(Math.random() * transcripts.length)];
          
          setState(prev => ({
            ...prev,
            [type]: { ...prev[type], transcript: randomTranscript }
          }));
        }, 2000);

        return;
      }

      const recognition = type === 'doctor' 
        ? (doctorRecognition.current = initializeRecognition('doctor'))
        : (patientRecognition.current = initializeRecognition('patient'));

      if (recognition) {
        recognition.start();
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        [type]: { 
          ...prev[type], 
          error: 'Microphone access denied. Please enable microphone permissions.',
          isRecording: false 
        }
      }));
    }
  }, [initializeRecognition, mockMode]);

  const stopMic = useCallback((type: 'doctor' | 'patient') => {
    if (mockMode) {
      setState(prev => ({
        ...prev,
        [type]: { ...prev[type], isRecording: false }
      }));
      return;
    }

    const recognition = type === 'doctor' ? doctorRecognition.current : patientRecognition.current;
    if (recognition && recognition.stop) {
      recognition.stop();
    }
  }, [mockMode]);

  const startBoth = useCallback(async () => {
    sessionStartTime.current = Date.now();
    setState(prev => ({ ...prev, isConnected: true, sessionDuration: 0 }));
    
    // Start duration counter
    durationInterval.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        sessionDuration: Math.floor((Date.now() - sessionStartTime.current) / 1000)
      }));
    }, 1000);

    await Promise.all([startMic('doctor'), startMic('patient')]);
  }, [startMic]);

  const stopBoth = useCallback(() => {
    stopMic('doctor');
    stopMic('patient');
    
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    
    setState(prev => ({ ...prev, isConnected: false }));
  }, [stopMic]);

  const swapSides = useCallback(() => {
    setState(prev => ({
      ...prev,
      doctor: { ...prev.patient, isRecording: false },
      patient: { ...prev.doctor, isRecording: false }
    }));
  }, []);

  const clearTranscripts = useCallback(() => {
    setState(prev => ({
      ...prev,
      doctor: { ...prev.doctor, transcript: '' },
      patient: { ...prev.patient, transcript: '' }
    }));
  }, []);

  const saveConversation = useCallback(async () => {
    const conversationData = {
      doctorTranscript: state.doctor.transcript,
      patientTranscript: state.patient.transcript,
      duration: state.sessionDuration,
      timestamp: new Date().toISOString()
    };

    // TODO: Save to API
    console.log('Saving conversation:', conversationData);
    
    return conversationData;
  }, [state]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      stopBoth();
    };
  }, [stopBoth]);

  return {
    state,
    startMic,
    stopMic,
    startBoth,
    stopBoth,
    swapSides,
    clearTranscripts,
    saveConversation,
    mockMode
  };
};