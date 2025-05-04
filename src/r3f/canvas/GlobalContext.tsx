import { createContext, Dispatch, ReactNode, SetStateAction, useState } from 'react'

export type ContextType = {
  isLoading: boolean
  setIsLoading: Dispatch<SetStateAction<boolean>>
  isContentReady: boolean
  setIsContentReady: Dispatch<SetStateAction<boolean>>
}
export const GlobalContext = createContext({} as ContextType)

export const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isContentReady, setIsContentReady] = useState(false)
  return (
    <GlobalContext.Provider value={{ isLoading, setIsLoading, isContentReady, setIsContentReady }}>
      {children}
    </GlobalContext.Provider>
  )
}
