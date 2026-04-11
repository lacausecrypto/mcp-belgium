export function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

export function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export function getPort(envName: string, fallback: number): number {
  const val = process.env[envName];
  return val ? parseInt(val, 10) : fallback;
}
