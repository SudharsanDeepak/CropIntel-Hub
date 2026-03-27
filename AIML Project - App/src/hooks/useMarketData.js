import { useQuery, useMutation, useQueryClient } from 'react-query'
import { marketAPI } from '../services/api'
import toast from 'react-hot-toast'

const shouldRetryQuery = (failureCount, error) => {
  const status = error?.status || error?.response?.status
  if (status === 429 || status >= 500) {
    return false
  }

  return failureCount < 1
}

export const useMarketData = () => {
  const queryClient = useQueryClient()
  const useDemandForecast = (days = 7) => {
    return useQuery(
      ['demandForecast', days],
      () => marketAPI.getDemandForecast(days),
      {
        retry: shouldRetryQuery,
        staleTime: 5 * 60 * 1000, 
        refetchInterval: 5 * 60 * 1000, 
        refetchIntervalInBackground: true, 
        onError: (error) => {
          toast.error(`Failed to fetch demand forecast: ${error.message}`)
        },
      }
    )
  }
  const usePriceForecast = (days = 7) => {
    return useQuery(
      ['priceForecast', days],
      () => marketAPI.getPriceForecast(days),
      {
        retry: shouldRetryQuery,
        staleTime: 5 * 60 * 1000, 
        refetchInterval: 5 * 60 * 1000, 
        refetchIntervalInBackground: true, 
        onError: (error) => {
          toast.error(`Failed to fetch price forecast: ${error.message}`)
        },
      }
    )
  }
  const useStockAnalysis = (days = 7) => {
    return useQuery(
      ['stockAnalysis', days],
      () => marketAPI.getStockAnalysis(days),
      {
        retry: shouldRetryQuery,
        staleTime: 5 * 60 * 1000, 
        refetchInterval: 5 * 60 * 1000, 
        refetchIntervalInBackground: true, 
        onError: (error) => {
          toast.error(`Failed to fetch stock analysis: ${error.message}`)
        },
      }
    )
  }
  const useElasticity = () => {
    return useQuery(
      'elasticity',
      () => marketAPI.getElasticity(),
      {
        retry: shouldRetryQuery,
        staleTime: 5 * 60 * 1000, 
        refetchInterval: 5 * 60 * 1000, 
        refetchIntervalInBackground: true, 
        onError: (error) => {
          toast.error(`Failed to fetch elasticity: ${error.message}`)
        },
      }
    )
  }
  const useDataSources = () => {
    return useQuery(
      'dataSources',
      () => marketAPI.getDataSources(),
      {
        staleTime: 30 * 60 * 1000,
      }
    )
  }
  const useUpdateMarketData = () => {
    return useMutation(
      () => marketAPI.updateMarketData(),
      {
        onSuccess: () => {
          toast.success('Market data updated successfully!')
          queryClient.invalidateQueries()
        },
        onError: (error) => {
          console.error('Update market data error:', error)
          const errorMessage = error.response?.data?.error || error.message || 'Unknown error'
          
          if (error.code === 'ECONNABORTED' || errorMessage.includes('timeout')) {
            toast.error('Update is taking longer than expected. The data will be updated in the background.')
          } else if (errorMessage.includes('Failed to update market data')) {
            toast.error('Unable to update market data. The ML service may be temporarily unavailable.')
          } else {
            toast.error(`Failed to update data: ${errorMessage}`)
          }
        },
      }
    )
  }
  return {
    useDemandForecast,
    usePriceForecast,
    useStockAnalysis,
    useElasticity,
    useDataSources,
    useUpdateMarketData,
  }
}