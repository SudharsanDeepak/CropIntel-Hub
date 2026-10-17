import { useEffect, useState } from 'react'

const DISTRICT_STORAGE_KEY = 'cropintelhub.selectedDistrict'
const DISTRICT_EVENT = 'cropintelhub:district-change'

export const getSelectedDistrict = () => localStorage.getItem(DISTRICT_STORAGE_KEY) || ''

export const setSelectedDistrict = (district) => {
  if (district) {
    localStorage.setItem(DISTRICT_STORAGE_KEY, district)
  } else {
    localStorage.removeItem(DISTRICT_STORAGE_KEY)
  }
  window.dispatchEvent(new CustomEvent(DISTRICT_EVENT, { detail: district || '' }))
}

export const useSelectedDistrict = () => {
  const [district, setDistrictState] = useState(getSelectedDistrict)

  useEffect(() => {
    const handleDistrictChange = (event) => {
      setDistrictState(event.detail ?? getSelectedDistrict())
    }
    const handleStorageChange = () => setDistrictState(getSelectedDistrict())

    window.addEventListener(DISTRICT_EVENT, handleDistrictChange)
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener(DISTRICT_EVENT, handleDistrictChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const updateDistrict = (nextDistrict) => {
    setDistrictState(nextDistrict || '')
    setSelectedDistrict(nextDistrict)
  }

  return [district, updateDistrict]
}
