// Dashboard-specific types
export interface BatteryInfo {
  level: number | null;
  fillWidth: string;
  text: string;
}

export interface DashboardQuery {
  battery?: string;
}

export interface ScreenshotConfig {
  type: "png";
  clip: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ViewportConfig {
  width: number;
  height: number;
}
