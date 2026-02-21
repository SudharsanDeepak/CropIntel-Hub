import { useQuery, useMutation, useQueryClient } from 'react-query'
import { marketAPI } from '../services/api'
import toast from 'react-hot-toast'
export const useMarketData = () => {
  const queryClient = useQueryClient()
  const useDemandForecast = (days = 7) => {
    return useQuery(
      ['demandForecast', days],
      () => marketAPI.getDemandForecast(days),
      {
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
          toast.error(`Failed to update data: ${error.message}`)
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