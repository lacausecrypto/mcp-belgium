import { z } from "zod";

export const languageSchema = z
  .enum(["en", "fr", "nl", "de"])
  .default("en")
  .describe("Preferred language for titles and descriptions (falls back to another Belgian language)");
