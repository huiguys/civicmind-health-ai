import { createContext, useState, useContext } from 'react'
import abhaData from '../../data/abhaFhirMock.json'

const PatientContext = createContext()

export function usePatient() {
  const context = useContext(PatientContext)
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider')
  }
  return context
}

export function PatientProvider({ children }) {
  const [currentPatient, setCurrentPatient] = useState(null)
  const [authError, setAuthError] = useState('')

  const login = (abhaId) => {
    // Check if the ABHA ID exists in our mock data
    if (abhaData[abhaId]) {
      setCurrentPatient(abhaData[abhaId])
      setAuthError('')
      return true
    } else {
      // Show available ABHA IDs for testing
      const availableIds = Object.keys(abhaData).join(', ')
      setAuthError(`Invalid ABHA ID. Available test IDs: ${availableIds}`)
      setCurrentPatient(null)
      return false
    }
  }

  const logout = () => {
    setCurrentPatient(null)
    setAuthError('')
  }

  const value = {
    currentPatient,
    login,
    logout,
    authError
  }

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  )
}
