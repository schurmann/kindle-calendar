import type { BatteryInfo } from "../types/dashboard";

export function parseBatteryInfo(batteryParam?: string): BatteryInfo {
  let batteryLevel = null;
  let batteryFillWidth = "0%";
  let batteryText = "";

  if (batteryParam) {
    // Parse battery level (expecting format like "85" or "85%")
    const batteryMatch = batteryParam.match(/(\d+)/);
    if (batteryMatch) {
      batteryLevel = parseInt(batteryMatch[1]);
      batteryFillWidth = `${Math.min(Math.max(batteryLevel, 0), 100)}%`;
      batteryText = `${batteryLevel}%`;
    }
  }

  return {
    level: batteryLevel,
    fillWidth: batteryFillWidth,
    text: batteryText,
  };
}
