import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;
process.env.STIB_API_KEY = "test-key";

import { escapeOdsString, stibClient } from "../src/client.js";

function capturedWhereParam(): string {
  const call = mockFetch.mock.calls[0];
  expect(call).toBeDefined();
  const url = new URL(String(call![0]));
  const where = url.searchParams.get("where");
  expect(where).not.toBeNull();
  return where!;
}

describe("stibClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchStops returns stop results", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        records: [{ stop_name: "Rogier", pointid: "0511" }],
      }),
    });

    const results = await stibClient.searchStops("Rogier");
    expect(results).toHaveLength(1);
    expect(results[0]?.stop_name).toBe("Rogier");
  });
});

describe("escapeOdsString", () => {
  it("leaves plain strings untouched", () => {
    expect(escapeOdsString("Rogier")).toBe("Rogier");
  });

  it("escapes a lone double quote", () => {
    expect(escapeOdsString('ab"cd')).toBe('ab\\"cd');
  });

  it("escapes a lone backslash", () => {
    expect(escapeOdsString("ab\\cd")).toBe("ab\\\\cd");
  });

  it("escapes backslash before quote so the quote cannot break out", () => {
    // Attack payload: a literal backslash followed by a quote.
    // Naive escaping (only quotes) would yield `ab\\"` which the ODS
    // parser decodes as `\` + unescaped `"`, terminating the string
    // and allowing SQL-like operator injection.
    expect(escapeOdsString('ab\\"cd')).toBe('ab\\\\\\"cd');
  });

  it("neutralizes a full ODS injection payload", () => {
    const payload = 'x\\") OR search(stop_name, "y';
    const escaped = escapeOdsString(payload);
    // Every backslash doubled, every quote prefixed with a single backslash
    expect(escaped).toBe('x\\\\\\") OR search(stop_name, \\"y');
    // Re-parsing rule: \\ -> \, \" -> ", other chars verbatim.
    // The decoded string must equal the original payload, i.e. the
    // attacker input is interpreted as a single literal string, not as
    // a terminator + operator.
    const decoded = escaped.replace(/\\(.)/g, "$1");
    expect(decoded).toBe(payload);
  });
});

describe("stibClient injection resistance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("serializes a backslash+quote payload without breaking out of the search() argument", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ records: [] }) });

    const payload = 'x\\") OR 1=1 OR search(stop_name, "y';
    await stibClient.searchStops(payload);

    const where = capturedWhereParam();
    // The entire payload must sit inside a single search() call, i.e.
    // the inner `"` characters must all be preceded by a backslash and
    // every injected `\` must itself be doubled. A naive fix would
    // leave `\"` unprotected and produce a second `search(...)` call.
    expect(where).toBe(
      'search(stop_name, "x\\\\\\") OR 1=1 OR search(stop_name, \\"y")',
    );
    // Hard invariant: there must be exactly one unescaped closing quote
    // (the one belonging to the surrounding template), everything else
    // escaped.
    const unescapedQuoteCount = where.replace(/\\./g, "").match(/"/g)?.length ?? 0;
    expect(unescapedQuoteCount).toBe(2); // opening + closing of the search() arg
  });
});
