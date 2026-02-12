import * as React from 'react'

export interface TabObject {
  [key: string]: any;
}

export interface TabsDirectory {
  [key: string]: (props: any) => React.ReactNode;
}

export interface SplitViewContextType {
  mainTabs: TabObject[];
  setMainTabs: React.Dispatch<React.SetStateAction<TabObject[]>>;
  sideTabs: TabObject[];
  setSideTabs: React.Dispatch<React.SetStateAction<TabObject[]>>;
  selectedMainTab: number;
  setSelectedMainTab: React.Dispatch<React.SetStateAction<number>>;
  selectedSideTab: number;
  setSelectedSideTab: React.Dispatch<React.SetStateAction<number>>;
  closeMainTab: (index: number) => void;
  closeSideTab: (index: number) => void;
  closeTab: (name: string, pane?: "main" | "side" | null) => boolean;
  openTab: (name: string, data: any, pane?: "main" | "side", selectIfExists?: boolean) => number;
}

export const SplitViewContext = React.createContext<SplitViewContextType>({} as SplitViewContextType)
export const SplitViewProvider: React.FC<React.PropsWithChildren & { value: SplitViewContextType }> = ({ value, children }) => {
  return (
    <SplitViewContext.Provider value={value}>
      {children}
    </SplitViewContext.Provider>
  )
}
export const useSplitView = (): SplitViewContextType => {
  const ctx = React.useContext(SplitViewContext)
  if (ctx === undefined || ctx === null) {
    throw new Error('useSplitView must be used within a SplitViewProvider')
  }
  return ctx
}
