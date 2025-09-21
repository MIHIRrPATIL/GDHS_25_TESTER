// API Configuration
const API_BASE_URL = 'http://localhost:3000';

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface PatientSignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  Gender: 'Male' | 'Female' | 'Other';
  age: number;
  height: number;
  weight: number;
  occupation: string; // Added - backend expects this
  gender: string; // Added - backend expects this (different from Gender)
  isSmoker: boolean;
  isDrunkard: boolean;
  exercise: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';
  chronicDiseases: string;
  allergies: string;
  currentMeds: string;
  familyHistory: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface DoctorSignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Simple POST function
async function postRequest(endpoint: string, data: any) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const payload = JSON.stringify(data);
    
    // console.log('API Request Details:');
    // console.log('- URL:', url);
    // console.log('- Method: POST');
    // console.log('- Headers:', { 'Content-Type': 'application/json' });
    // console.log('- Body (raw):', payload);
    // console.log('- Body (parsed):', data);
    console.log(payload)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    console.log('API Response Details:');
    console.log('- Status:', response.status);
    console.log('- Status Text:', response.statusText);
    console.log('- Headers:', Object.fromEntries(response.headers.entries()));

    // Handle empty response body for successful requests
    let result;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      // For sendStatus(200) responses, there's no JSON body
      result = response.status === 200 ? { success: true } : await response.text();
    }
    
    console.log('- Response Body:', result);

    if (!response.ok) {
      console.error('API Error - Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        body: result
      });
      throw new Error(result.message || result.error || `HTTP ${response.status}`);
    }

    console.log('API Success:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('API Request Failed:', {
      endpoint,
      data,
      error: error instanceof Error ? error.message : error
    });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Request failed' 
    };
  }
}

// Authentication API Functions
export const authAPI = {
  patientLogin: (credentials: LoginRequest) => postRequest('/patient/logIn', credentials),
  patientSignUp: (userData: PatientSignUpRequest) => postRequest('/patient/signUp', userData),
  doctorLogin: (credentials: LoginRequest) => postRequest('/doctor/logIn', credentials),
  doctorSignUp: (userData: DoctorSignUpRequest) => postRequest('/doctor/signUp', userData),
};

// Token management removed - handled by backend only

export default authAPI;
