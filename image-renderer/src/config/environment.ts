import type { GoogleAuthCredentials } from "../types/environment";

function requireEnvVar(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

export function getGoogleAuthCredentials(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
): GoogleAuthCredentials {
  const privateKeyBase64 = requireEnvVar(
    env.GOOGLE_PRIVATE_KEY_BASE64,
    "GOOGLE_PRIVATE_KEY_BASE64",
  );

  let privateKey: string;
  try {
    privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf-8').replace(/\\n/g, "\n");
  } catch (error) {
    throw new Error('Invalid base64 encoded private key');
  }

  return {
    type: "service_account",
    project_id: requireEnvVar(env.GOOGLE_PROJECT_ID, "GOOGLE_PROJECT_ID"),
    private_key_id: requireEnvVar(
      env.GOOGLE_PRIVATE_KEY_ID,
      "GOOGLE_PRIVATE_KEY_ID",
    ),
    private_key: privateKey,
    client_email: requireEnvVar(
      env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    ),
    client_id: "117909210471431257098",
    universe_domain: "googleapis.com",
  };
}

export function getCalendarIds(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
): string[] {
  const calendarIds = requireEnvVar(env.CALENDAR_IDS, "CALENDAR_IDS");
  return calendarIds
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}
