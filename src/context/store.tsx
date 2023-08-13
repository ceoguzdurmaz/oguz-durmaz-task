"use client"; // Directive to specify this is client-side code

// Importing required libraries and utilities
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"; // Required React hooks and components
import axios from "axios"; // Library for making HTTP requests

// Import utility functions and configurations
import { generateSlug, cleanAndLowercaseString } from "@/Utils"; // Utility functions
import { API_URL } from "@/Services"; // API endpoint

// Type imports for our data structures and component properties
import {
  TabInfo,
  PluginInfo,
  TemporaryDataStructure,
  AppDataProps,
  APIResponseData,
} from "@/Types";

// Default data for the context
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

// Creating a context for the app data
const AppDataContext = createContext<AppDataProps>(defaultAppData);

// Helper function to format the tab data by adding a slug based on the title
const formatTabs = (data: Record<string, TabInfo>): TabInfo[] => {
  return Object.values(data).map((tab) => ({
    ...tab,
    slug: generateSlug(tab.title), // Generating a URL-friendly slug
  }));
};

// Helper function to format the plugins' data
const formatPlugins = (
  formattedTabs: TabInfo[],
  pluginsData: Record<string, PluginInfo>
): PluginInfo[] => {
  const formattedPlugins: PluginInfo[] = [];

  // Iterate through each tab and categorize plugins
  for (const tab of formattedTabs) {
    const category = tab.slug;
    const newArr = tab.active.concat(tab.disabled, tab.inactive);
    const uniqueArr = newArr.filter(
      (item, index) => newArr.indexOf(item) === index
    );
    uniqueArr.sort((a, b) => a.localeCompare(b));

    // Iterate through each plugin and assign properties
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

// The component that provides all app-related data to its children
export const AppDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Local state management for tabs, plugins, etc.
  const [tabsData, setTabsData] = useState<TabInfo[]>([]);
  const [pluginsData, setPluginsData] = useState<PluginInfo[]>([]);
  const [defaultTab, setDefaultTab] = useState<string>("");
  const [tempData, setTempData] = useState<TemporaryDataStructure>({
    data: { tabs: [], tabData: {}, plugins: {} },
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [isAllPluginsDisabled, setIsAllPluginsDisabled] =
    useState<boolean>(false);

  // Check if data is available
  const isDataAvailable = pluginsData.length > 0;

  // Function to fetch and format data from the API
  const fetchData = async () => {
    try {
      // If data isn't loaded, set loading state
      !isDataAvailable && setLoading(true);

      // Make the API call
      const { data } = await axios.get<APIResponseData>(`${API_URL}`);

      // Process the API data
      const formattedTabs = formatTabs(data.tabData);
      const formattedPlugins = formatPlugins(formattedTabs, data.plugins);
      setTabsData(formattedTabs);
      setDefaultTab(formattedTabs[0]?.slug);
      setPluginsData(formattedPlugins);
      setTempData({ data });
      setIsAllPluginsDisabled(
        formattedPlugins.every((plugin) => plugin.disabled)
      );

      // If data was previously not loaded, reset loading state
      !isDataAvailable && setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error); // Log errors
    }
  };

  // Function to toggle the active/inactive status of a given plugin
  const togglePluginStatus = async (pluginTitle: string) => {
    // Find the plugin key by title
    const pluginKey = Object.keys(tempData.data.plugins).find(
      (key) => tempData.data.plugins[key].title === pluginTitle
    );

    if (!pluginKey) {
      console.error("Plugin not found");
      return;
    }

    // Update the tab's active/inactive status based on the plugin
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

    // Update the plugin's status locally
    const updatedPluginsData = pluginsData.map((plugin) => {
      if (plugin.title === pluginTitle) {
        return { ...plugin, status: !plugin.status };
      }
      return plugin;
    });

    try {
      // Send the updated data to the backend
      const data = { ...tempData.data };
      await axios.post(`${API_URL}`, data);

      // Update the local state with the modified data
      setTabsData(updatedTabsData);
      setPluginsData(updatedPluginsData);
    } catch (error) {
      console.error("Error toggling plugin status:", error);
      // Handle errors, such as reverting changes or notifying the user
    }
  };

  // Function to toggle the disabled/enabled status of all plugins
  const toggleEnableDisableAllPlugins = async () => {
    // Create a copy of the temp data
    const updatedTempData = { ...tempData.data };

    // Check if all plugins are disabled
    const allPluginsAreDisabled = pluginsData.every(
      (plugin) => plugin.disabled
    );

    // Toggle the disabled status in the temporary data
    for (const tabKey in updatedTempData.tabData) {
      const tab = updatedTempData.tabData[tabKey];
      const allPlugins = [...tab.active, ...tab.inactive];
      if (allPluginsAreDisabled) {
        tab.disabled = [];
      } else {
        tab.disabled = allPlugins;
      }
    }

    try {
      // Send the modified data to the backend
      await axios.post(`${API_URL}`, updatedTempData);

      // Process the updated data and set it in the local state
      const formattedTabs = formatTabs(updatedTempData.tabData);
      const formattedPlugins = formatPlugins(
        formattedTabs,
        updatedTempData.plugins
      );
      setTabsData(formattedTabs);
      setPluginsData(formattedPlugins);
      setIsAllPluginsDisabled(!allPluginsAreDisabled);
    } catch (error) {
      console.error("Error toggling disabled plugins:", error);
      // Handle errors, such as reverting changes or notifying the user
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchData().then(() => {
      console.log("Data fetched successfully");
    });
  }, []);

  return (
    // Use context provider to share data with child components
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

// Custom hook for accessing our App data context
export const useAppDataContext = (): AppDataProps => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppDataContext must be used within AppDataProvider");
  }
  return context;
};
