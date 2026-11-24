// Dashboard-specific types
export interface BatteryInfo {
  level: number | null;
  fillWidth: string;
  text: string;
}

export interface DashboardQuery {
  battery?: string;
}
