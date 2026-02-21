import { useState, useCallback } from 'react'
export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning',
    onConfirm: null,
    isLoading: false
  })
  const confirm = useCallback(({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning'
  }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          resolve(true)
          setConfirmState(prev => ({ ...prev, isOpen: false }))
        },
        isLoading: false
      })
    })
  }, [])
  const close = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }))
  }, [])
  const setLoading = useCallback((loading) => {
    setConfirmState(prev => ({ ...prev, isLoading: loading }))
  }, [])
  return {
    confirmState,
    confirm,
    close,
    setLoading
  }
}