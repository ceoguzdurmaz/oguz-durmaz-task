"use client";

// External libraries
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

// Utility and configuration imports
import { generateSlug, cleanAndLowercaseString } from "@/Utils";
import { API_URL } from "@/Services";

// Type imports for data structures and props
import {
  TabInfo,
  PluginInfo,
  TemporaryDataStructure,
  AppDataProps,
  APIResponseData,
} from "@/Types";

// Setting up default values for our context
const defaultAppData: AppDataProps = {
  tabsData: [],
  pluginsData: [],
  defaultTab: "",
  togglePluginStatus: async (pluginTitle: string) => {},
  toggleEnableDisableAllPlugins: async () => {},
  loading: false,
  isAllPluginsDisabled: false,
  setIsAllPluginsDisabled: () => {},
};

// Create a new context for the application data
const AppDataContext = createContext<AppDataProps>(defaultAppData);

// Helper function to assign a slug for each tab based on its title
const formatTabs = (data: Record<string, TabInfo>): TabInfo[] => {
  return Object.values(data).map((tab) => ({
    ...tab,
    slug: generateSlug(tab.title),
  }));
};

// Helper function to format the plugins data, categorizing them and assigning properties
const formatPlugins = (
  formattedTabs: TabInfo[],
  pluginsData: Record<string, PluginInfo>
): PluginInfo[] => {
  const formattedPlugins: PluginInfo[] = [];

  for (const tab of formattedTabs) {
    const category = tab.slug;
    const newArr = tab.active.concat(tab.disabled, tab.inactive);
    const uniqueArr = newArr.filter(
      (item, index) => newArr.indexOf(item) === index
    );
    uniqueArr.sort((a, b) => a.localeCompare(b));

    uniqueArr.forEach((pluginKey) => {
      const plugin = pluginsData[pluginKey];
      const disabled = tab.disabled.find(
        (pluginName) => pluginName === cleanAndLowercaseString(plugin.title)
      );
      const status = tab.active.find(
        (pluginName) => pluginName === cleanAndLowercaseString(plugin.title)
      );
      if (plugin) {
        formattedPlugins.push({
          ...plugin,
          category: category,
          disabled: !!disabled,
          status: !!status,
        });
      }
    });
  }
  return formattedPlugins;
};

// This component provides all app related data to its children
export const AppDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State management
  const [tabsData, setTabsData] = useState<TabInfo[]>([]);
  const [pluginsData, setPluginsData] = useState<PluginInfo[]>([]);
  const [defaultTab, setDefaultTab] = useState<string>("");
  const [tempData, setTempData] = useState<TemporaryDataStructure>({
    data: { tabs: [], tabData: {}, plugins: {} },
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [isAllPluginsDisabled, setIsAllPluginsDisabled] =
    useState<boolean>(false);

  // Function to fetch data from the API and format it
  const isDataAvailable = pluginsData.length > 0;
  const fetchData = async () => {
    try {
      !isDataAvailable && setLoading(true);

      const { data } = await axios.get<APIResponseData>(`${API_URL}`);
      const formattedTabs = formatTabs(data.tabData);
      const formattedPlugins = formatPlugins(formattedTabs, data.plugins);
      setTabsData(formattedTabs);
      setDefaultTab(formattedTabs[0]?.slug);
      setPluginsData(formattedPlugins);
      setTempData({ data });
      setIsAllPluginsDisabled(
        formattedPlugins.every((plugin) => plugin.disabled)
      );
      !isDataAvailable && setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  // Function to toggle the status of a given plugin
  const togglePluginStatus = async (pluginTitle: string) => {
    const pluginKey = Object.keys(tempData.data.plugins).find(
      (key) => tempData.data.plugins[key].title === pluginTitle
    );

    if (!pluginKey) {
      console.error("Plugin not found");
      return;
    }

    const updatedTabsData = [...tabsData];
    for (const tab of updatedTabsData) {
      if (tab.active.includes(pluginKey)) {
        const index = tab.active.indexOf(pluginKey);
        tab.active.splice(index, 1);
        tab.inactive.push(pluginKey);
      } else if (tab.inactive.includes(pluginKey)) {
        const index = tab.inactive.indexOf(pluginKey);
        tab.inactive.splice(index, 1);
        tab.active.push(pluginKey);
      }
    }

    const updatedPluginsData = pluginsData.map((plugin) => {
      if (plugin.title === pluginTitle) {
        return { ...plugin, status: !plugin.status };
      }
      return plugin;
    });

    try {
      const data = { ...tempData.data };
      await axios.post(`${API_URL}`, data);
      setTabsData(updatedTabsData);
      setPluginsData(updatedPluginsData);
    } catch (error) {
      console.error("Error toggling plugin status:", error);
      // Here you can either revert the changes or notify the user
    }
  };

  // Function to toggle the disabled/enabled status of all plugins
  const toggleEnableDisableAllPlugins = async () => {
    const newData = { ...tempData.data };
    const allPluginsAreDisabled = pluginsData.every(
      (plugin) => plugin.disabled
    );

    // Toggle the disabled status in the local data
    for (const tabKey in newData.tabData) {
      const tab = newData.tabData[tabKey];
      const allPlugins = [...tab.active, ...tab.inactive];
      if (allPluginsAreDisabled) {
        tab.disabled = [];
      } else {
        tab.disabled = allPlugins;
      }
    }

    try {
      // Send the modified data to the backend
      await axios.post(`${API_URL}`, newData);

      // Update the local UI state
      const updatedPluginsData = pluginsData.map((plugin) => {
        return { ...plugin, disabled: !allPluginsAreDisabled };
      });
      setTabsData(Object.values(newData.tabData)); // Assuming tabData is an object, not an array
      setPluginsData(updatedPluginsData);
      setIsAllPluginsDisabled(!allPluginsAreDisabled);
    } catch (error) {
      console.error("Error toggling disabled plugins:", error);
      // Handle errors accordingly, e.g., show a notification to the user
    }
  };

  // Fetch the data when the component mounts
  useEffect(() => {
    fetchData().then(() => {
      console.log("Data fetched successfully");
    });
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        tabsData,
        defaultTab,
        pluginsData,
        togglePluginStatus,
        toggleEnableDisableAllPlugins,
        loading,
        isAllPluginsDisabled,
        setIsAllPluginsDisabled,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

// Custom hook to make it easier to use our App data context
export const useAppDataContext = (): AppDataProps => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppDataContext must be used within AppDataProvider");
  }
  return context;
};
