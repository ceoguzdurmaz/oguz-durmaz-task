import React, { ReactNode } from "react";
import { useAppDataContext } from "@/context/store";
import Image from "next/image";
import Link from "next/link";
import classNames from "classnames";
import EnableDisableAllPlugins from "@/components/EnableDisableAllPlugins";

interface PageLayoutProps {
  children: ReactNode;
  slug?: string;
}

const PageLayout: React.FunctionComponent<PageLayoutProps> = ({
  children,
  slug,
}) => {
  const {
    tabsData,
    toggleDisabledPlugins,
    isAllPluginsDisabled,
    setIsAllPluginsDisabled,
    loading,
  } = useAppDataContext();

  const handleSwitch = () => {
    toggleDisabledPlugins().then(() => {
      setIsAllPluginsDisabled(!isAllPluginsDisabled);
    });
  };

  return (
    <div className="page-layout">
      <div className={"side-menu"}>
        <div className={"logo"}>
          <Image
            src="/images/logo.svg"
            alt="Picture of the author"
            width={220}
            height={60}
          />
        </div>

        <ul className={"menu"}>
          {tabsData.map((tab, index) => (
            <li
              key={index}
              className={classNames(slug === tab.slug ? "active-tab" : "")}
            >
              <Link href={`${tab.slug}`}>
                <Image
                  src={`/images/icons/${tab.icon}.png`}
                  alt="Picture of the author"
                  width={30}
                  height={30}
                />
                <span>{tab.title}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div
          className={`turn-on-of-plugins ${
            !isAllPluginsDisabled ? "" : "danger-bg"
          }`}
        >
          {!loading && (
            <EnableDisableAllPlugins
              isSwitchOn={!isAllPluginsDisabled}
              setIsSwitchOn={handleSwitch}
            />
          )}
        </div>
      </div>
      <div className={"main"}>{children}</div>
    </div>
  );
};

export default PageLayout;
