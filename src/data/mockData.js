// src/data/mockData.js

export const hospitalQueue = [
  {
    id: "Q-101",
    name: "Rahul Sharma",
    abhaId: "14-1234-5678-9012",
    status: "Waiting in Lobby",
    otpVerified: true,
    avatar: "RS"
  },
  {
    id: "Q-102",
    name: "Priya Patel",
    abhaId: "14-9876-5432-1098",
    status: "Awaiting Reception OTP",
    otpVerified: false,
    avatar: "PP"
  },
  {
    id: "Q-103",
    name: "Vikram Singh",
    abhaId: "14-4567-8901-2345",
    status: "Emergency Override",
    otpVerified: false,
    isEmergency: true,
    avatar: "VS"
  },
  {
    id: "Q-104",
    name: "Unknown Patient (Accident Victim)",
    abhaId: "TEMP-EMERGENCY-001",
    status: "No ID - Emergency Admission",
    otpVerified: false,
    isEmergency: true,
    isUnidentified: true,
    avatar: "?",
    admissionNote: "Road accident victim. Brought by stranger. No identification documents. Awaiting family/ID verification."
  }
];

export const patientMedicalRecord = {
  general: {
    bloodGroup: "O+",
    allergies: ["Penicillin", "Dust Mites"],
    vitals: { bp: "120/80", weight: "72kg", height: "175cm" }
  },
  sensitive: {
    chronicConditions: ["Type 2 Diabetes", "Hypertension Grade 1"],
    activeMedications: ["Metformin 500mg", "Amlodipine 5mg"],
    history: "Patient reports history of severe anxiety. Requested privacy."
  }
};