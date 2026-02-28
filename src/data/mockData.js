// src/data/mockData.js

export const hospitalQueue = [
  {
    id: "Q-101",
    name: "Rahul Sharma",
    abhaId: "14-9876-5432-1011",
    status: "Waiting in Lobby",
    otpVerified: true,
    avatar: "RS"
  },
  {
    id: "Q-102",
    name: "Priya Patel",
    abhaId: "14-1122-3344-5566",
    status: "Awaiting Reception OTP",
    otpVerified: false,
    avatar: "PP"
  },
  {
    id: "Q-103",
    name: "Amit Singh",
    abhaId: "14-9988-7766-5544",
    status: "Emergency Override",
    otpVerified: false,
    isEmergency: true,
    avatar: "AS"
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