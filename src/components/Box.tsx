"use client";
import React, { useState } from "react";
import { PluginInfo } from "@/Types";
import SwitchComponentProps from "@/components/Switch";
import { useAppDataContext } from "@/context/store";

interface BoxProps {
  plugin: PluginInfo;
}

const BoxComponent: React.FC<BoxProps> = ({ plugin }) => {
  const { togglePluginStatus } = useAppDataContext();

  const [isSwitchOn, setIsSwitchOn] = useState(plugin.status);

  const handleSwitch = () => {
    togglePluginStatus(plugin.title).then(() => {
      setIsSwitchOn(!isSwitchOn);
    });
  };

  return (
    <div className={`plugin-box ${plugin.disabled ? "disabled-box" : ""}`}>
      <div className={"text-area"}>
        <h2 className="text-xl">{plugin.title}</h2>
        <p className="text-gray-600">{plugin.description}</p>
      </div>
      <div className={"switch-action"}>
        <SwitchComponentProps
          isSwitchOn={isSwitchOn}
          setIsSwitchOn={handleSwitch}
        />
      </div>
    </div>
  );
};

export default BoxComponent;
