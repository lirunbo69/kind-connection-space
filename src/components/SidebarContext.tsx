import { createContext, useContext, useState, type ReactNode } from "react";

const SidebarContext = createContext({ collapsed: false, setCollapsed: (_: boolean) => {} });

export const useSidebarCollapsed = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};
