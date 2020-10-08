import { Alerts, getBulletins, getLastAlertTime } from "./Alerts";
import { Cameras } from "./Cameras";
import { DateTime } from "luxon";
import { isFunction } from "lodash";
import { isOnline } from "../lib/api";
import { Terminal } from "../../server/lib/terminals";
import clsx from "clsx";
import React, { FunctionComponent, ReactNode, useState } from "react";
import ReactGA from "react-ga";

enum Tabs {
  cameras = "cameras",
  alerts = "alerts",
}

interface Props {
  onChange: (isOpen: boolean) => void;
  terminal: Terminal;
  time: DateTime;
}

export const Footer: FunctionComponent<Props> = (props) => {
  const { onChange, terminal, time } = props;
  const [cameraTime, setCameraTime] = useState<number>(
    DateTime.local().toSeconds()
  );
  const [isOpen, setOpen] = useState<boolean>(false);
  const [tab, setTab] = useState<Tabs | null>(null);
  const [isReloading, setReloading] = useState<boolean>(false);

  const showCameras = !isOpen || tab === Tabs.cameras;
  const showAlerts = !isOpen || tab === Tabs.alerts;

  const wrapFooter = (content: ReactNode): ReactNode => (
    <div
      className={clsx(
        "fixed top-0 inset-x z-10",
        "bg-green-dark text-white",
        "w-full shadow-up-lg",
        "flex justify-center",
        "animate",
        "pr-safe-right pl-safe-left mb-safe-bottom"
      )}
      style={{
        height: window.innerHeight,
        top: isOpen ? "0" : "calc(100% - 4rem)",
      }}
    >
      <div
        className={clsx(
          "w-full max-w-6xl",
          "flex flex-col",
          "pt-safe-top pb-safe-bottom"
        )}
      >
        {content}
      </div>
    </div>
  );

  const toggleTab = (isOpen: boolean, tab: Tabs | null = null): void => {
    setOpen(isOpen);
    setTab(tab);
    if (isFunction(onChange)) {
      onChange(isOpen);
    }
  };

  const renderToggle = (): ReactNode => {
    const showMap = !isOpen;
    return (
      <div className="flex">
        {showCameras && renderToggleCameras()}
        {showMap && renderMapLink()}
        {showAlerts && renderToggleAlerts()}
      </div>
    );
  };

  const renderMapLink = (): ReactNode => {
    const { vesselwatch } = terminal;
    if (!vesselwatch) {
      return null;
    }
    return (
      <a className="h-16 py-4 flex items-center" href={vesselwatch}>
        <i className="fas fa-lg fa-map-marked" />
      </a>
    );
  };

  const renderToggleCameras = (): ReactNode => {
    if (!isOnline()) {
      return <div className="flex-1" />;
    }
    return (
      <div
        className={clsx(
          "relative h-16 p-4",
          "flex items-center justify-start",
          "cursor-pointer",
          "flex-1 flex-no-wrap min-w-0"
        )}
      >
        <div
          className="flex-grow flex items-center flex-no-wrap min-w-0"
          onClick={() => {
            if (isOpen) {
              toggleTab(false);
              ReactGA.event({
                category: "Navigation",
                action: "Close Cameras",
              });
            } else {
              toggleTab(true, Tabs.cameras);
              ReactGA.event({
                category: "Navigation",
                action: "Open Cameras",
              });
            }
          }}
        >
          <i
            className={clsx(
              "fas fa-lg mr-4",
              isOpen ? "fa-chevron-down" : "fa-video"
            )}
          />
          <span className="truncate">Cameras</span>
        </div>
        {isOpen && (
          <i
            className={clsx(
              "fas fa-redo fa-lg fa-spin cursor-pointer",
              !isReloading && "fa-spin-pause"
            )}
            onClick={() => {
              setReloading(true);
              setCameraTime(DateTime.local().toSeconds());
              setTimeout(() => setReloading(false), 1 * 1000);
            }}
          />
        )}
      </div>
    );
  };

  const renderToggleAlerts = (): ReactNode => {
    if (!getBulletins(terminal).length) {
      return <div className="flex-1" />;
    }
    return (
      <div
        className={clsx(
          "relative h-16 p-4",
          "flex items-center flex-1 justify-end",
          "flex-no-wrap min-w-0",
          "cursor-pointer"
        )}
        onClick={() => {
          if (isOpen) {
            toggleTab(false);
            ReactGA.event({
              category: "Navigation",
              action: "Close Alerts",
            });
          } else {
            toggleTab(true, Tabs.alerts);
            ReactGA.event({
              category: "Navigation",
              action: "Open Alerts",
            });
          }
        }}
      >
        <span className="truncate">
          {isOpen ? "Alerts" : getLastAlertTime(terminal)}
        </span>
        <i
          className={clsx(
            "fas fa-lg ml-4",
            isOpen ? "fa-chevron-down" : "fa-exclamation-triangle"
          )}
        />
      </div>
    );
  };

  return (
    <>
      <div className="h-48 w-full" />
      {wrapFooter(
        <>
          {renderToggle()}
          {showCameras && (
            <Cameras terminal={terminal} cameraTime={cameraTime} />
          )}
          {showAlerts && <Alerts terminal={terminal} time={time} />}
        </>
      )}
      <div className="h-safe-bottom w-full bg-green-dark" />
    </>
  );
};
