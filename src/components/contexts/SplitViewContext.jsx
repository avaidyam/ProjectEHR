import React from 'react'

export const SplitViewContext = React.createContext()

export const SplitViewProvider = ({ children }) => {
  const state = React.useState(null)
  return (
    <SplitViewContext.Provider value={state}>
      {children}
    </SplitViewContext.Provider>
  )
}

export const useSplitView = () => {
  const ctx = React.useContext(SplitViewContext)
  if (ctx === undefined) {
    throw new Error('useSplitView must be used within a SplitViewProvider')
  }
  return ctx
}
