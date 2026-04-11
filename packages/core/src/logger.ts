import pino from "pino";

export function createLogger(name: string) {
  const isStdio = (process.env.MCP_TRANSPORT ?? "stdio") === "stdio";
  const transport =
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true, destination: 2 } }
      : undefined;

  const options = {
    name,
    level: process.env.LOG_LEVEL ?? (isStdio ? "silent" : "info"),
    transport,
  } as const;

  if (isStdio) {
    return pino(options, pino.destination(2));
  }

  return pino(options);
}
