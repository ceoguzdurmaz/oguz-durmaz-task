"use client";
import { Switch } from "@nextui-org/react";
import React from "react";

interface SwitchComponentProps {
  isSwitchOn: boolean;
  setIsSwitchOn: (value: boolean) => void;
}

const SwitchComponent: React.FC<SwitchComponentProps> = ({
  isSwitchOn,
  setIsSwitchOn,
}) => {
  return (
    <div className="plugin-switch">
      <Switch
        defaultSelected={isSwitchOn}
        size={`md`}
        onValueChange={() => setIsSwitchOn(!isSwitchOn)}
        color={"success"}
        className={isSwitchOn ? "" : "bg-danger-support"}
      ></Switch>
      <p className={`${isSwitchOn ? "success-color" : "error-color"}`}>
        {isSwitchOn ? "Allowed" : "Blocked"}
      </p>
    </div>
  );
};

export default SwitchComponent;
