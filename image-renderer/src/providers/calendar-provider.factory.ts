import type { CalendarProvider } from "./calendar-provider.interface";
import { CalendarProviderType } from "./calendar-provider.interface";
import { GoogleCalendarProvider } from "./google-calendar.provider";
import { MockCalendarProvider } from "./mock-calendar.provider";

export class CalendarProviderFactory {
  /**
   * Creates a calendar provider based on the specified type and environment
   * @param type - The type of calendar provider to create
   * @param env - Environment variables for provider configuration
   * @returns Configured calendar provider instance
   */
  static create(
    type: CalendarProviderType,
    env: NodeJS.ProcessEnv | Record<string, string | undefined>
  ): CalendarProvider {
    switch (type) {
      case CalendarProviderType.GOOGLE:
        return new GoogleCalendarProvider(env);

      case CalendarProviderType.MOCK:
        return new MockCalendarProvider();

      default:
        throw new Error(`Unsupported calendar provider type: ${type}`);
    }
  }

  /**
   * Creates a calendar provider based on environment configuration
   * Reads CALENDAR_PROVIDER environment variable, defaults to Google
   * @param env - Environment variables
   * @returns Configured calendar provider instance
   */
  static createFromEnvironment(
    env: NodeJS.ProcessEnv | Record<string, string | undefined>
  ): CalendarProvider {
    const providerType = env.CALENDAR_PROVIDER as CalendarProviderType;

    // Backwards compatibility: check USE_MOCK_DATA for existing deployments
    if (env.USE_MOCK_DATA === "true") {
      return this.create(CalendarProviderType.MOCK, env);
    }

    // Use explicit provider type or default to Google
    const type = providerType || CalendarProviderType.GOOGLE;
    return this.create(type, env);
  }

  /**
   * Gets all available provider types
   * @returns Array of supported calendar provider types
   */
  static getAvailableProviders(): CalendarProviderType[] {
    return Object.values(CalendarProviderType);
  }
}