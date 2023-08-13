import { Dispatch, SetStateAction } from "react";

// Interfaces
export interface TabInfo {
  title: string;
  icon: string;
  slug: string;
  active: string[];
  disabled: string[];
  inactive: string[];
}

export interface APIResponseData {
  tabs: string[];
  tabData: Record<string, TabInfo>;
  plugins: Record<string, PluginInfo>;
}
export interface PluginInfo {
  title: string;
  description: string;
  category: string;
  disabled: boolean;
  status: boolean;
}

export interface TemporaryDataStructure {
  data: {
    tabs?: string[];
    tabData: Record<string, TabInfo>;
    plugins: Record<string, PluginInfo>;
  };
}

export interface AppDataProps {
  tabsData: TabInfo[];
  pluginsData: PluginInfo[];
  defaultTab: string;
  togglePluginStatus: (pluginTitle: string) => Promise<void>;
  toggleDisabledPlugins: () => Promise<void>;
  loading: boolean;
  isAllPluginsDisabled: boolean;
  setIsAllPluginsDisabled: Dispatch<SetStateAction<boolean>>;
}
