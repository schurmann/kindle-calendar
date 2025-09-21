import type { BatteryInfo } from "../types/dashboard";
import { css, Style } from "hono/css";

interface StatusBarProps {
  batteryInfo: BatteryInfo;
}

export function StatusBar({ batteryInfo }: StatusBarProps) {
  if (batteryInfo.level === null) return null;

  const statusBarClass = css`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 8px 0;
    border-bottom: 2px solid #000;
    margin-bottom: 10px;
    height: 30px;
  `;

  const batteryIndicatorClass = css`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: bold;
  `;

  const batteryIconClass = css`
    width: 32px;
    height: 18px;
    border: 2px solid #000;
    border-radius: 2px;
    position: relative;
    background: white;
    &::after {
      content: "";
      position: absolute;
      right: -6px;
      top: 4px;
      width: 4px;
      height: 8px;
      background: #000;
      border-radius: 0 2px 2px 0;
    }
  `;

  const batteryFillClass = css`
    height: 100%;
    background: #000;
    border-radius: 1px;
    width: var(--battery-width, 0%);
  `;

  return (
    <>
      <Style />
      <div class={statusBarClass}>
        <div class={batteryIndicatorClass}>
          <>
            <div class={batteryIconClass}>
              <div class={batteryFillClass}></div>
            </div>
            <span>{batteryInfo.text}</span>
          </>
        </div>
      </div>
    </>
  );
}
