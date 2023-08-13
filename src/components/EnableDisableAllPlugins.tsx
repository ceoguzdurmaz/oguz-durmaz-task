import { Switch } from "@nextui-org/react";
import React from "react";
import Image from "next/image";

interface BottomSwitchProps {
  isSwitchOn: boolean;
  setIsSwitchOn: () => void;
}

const EnableDisableAllPlugins: React.FC<BottomSwitchProps> = ({
  isSwitchOn,
  setIsSwitchOn,
}) => {
  return (
    <div className="bottom-switch">
      <span>All plugins {isSwitchOn ? "enabled" : "disabled"}</span>
      <Switch
        defaultSelected={isSwitchOn}
        size={`lg`}
        onValueChange={() => setIsSwitchOn()}
        color={"success"}
        className={isSwitchOn ? "" : "bg-danger-support"}
        thumbIcon={() =>
          isSwitchOn ? (
            <Image
              src={`/images/icons/power-success.png`}
              alt="success"
              width={15}
              height={15}
            />
          ) : (
            <Image
              src={`/images/icons/power-danger.png`}
              alt="danger"
              width={15}
              height={15}
            />
          )
        }
      ></Switch>
    </div>
  );
};

export default EnableDisableAllPlugins;
