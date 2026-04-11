export interface WfsFeatureTypeSummary {
  name: string;
  title?: string;
  abstract?: string;
  defaultCrs?: string;
  lowerCorner?: string;
  upperCorner?: string;
}

export interface XsdElementSummary {
  name: string;
  type?: string;
  nillable?: boolean;
  minOccurs?: string;
  maxOccurs?: string;
}

export interface WmsLayerSummary {
  name: string;
  title?: string;
  abstract?: string;
  crs: string[];
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function extractXmlBlocks(xml: string, tagName: string): string[] {
  const blocks: string[] = [];
  const tokenPattern = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "g");
  const stack: number[] = [];

  for (const match of xml.matchAll(tokenPattern)) {
    const token = match[0];
    const index = match.index ?? 0;

    if (token.startsWith("</")) {
      const start = stack.pop();
      if (start !== undefined) {
        blocks.push(xml.slice(start, index));
      }
      continue;
    }

    if (!token.endsWith("/>")) {
      stack.push(index + token.length);
    }
  }

  return blocks;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractFirstTagText(xml: string, localNames: string[]): string | undefined {
  for (const localName of localNames) {
    const pattern = new RegExp(`<(?:[A-Za-z0-9_-]+:)?${escapeRegex(localName)}\\b[^>]*>([\\s\\S]*?)<\\/(?:[A-Za-z0-9_-]+:)?${escapeRegex(localName)}>`);
    const match = xml.match(pattern);
    if (match?.[1]) {
      return decodeXmlEntities(match[1].trim());
    }
  }
  return undefined;
}

function extractAllTagTexts(xml: string, localNames: string[]): string[] {
  const values: string[] = [];

  for (const localName of localNames) {
    const pattern = new RegExp(
      `<(?:[A-Za-z0-9_-]+:)?${escapeRegex(localName)}\\b[^>]*>([\\s\\S]*?)<\\/(?:[A-Za-z0-9_-]+:)?${escapeRegex(localName)}>`,
      "g"
    );

    for (const match of xml.matchAll(pattern)) {
      const value = match[1]?.trim();
      if (value) values.push(decodeXmlEntities(value));
    }
  }

  return values;
}

export function parseWfsFeatureTypes(xml: string): WfsFeatureTypeSummary[] {
  return extractXmlBlocks(xml, "FeatureType")
    .map((block): WfsFeatureTypeSummary | null => {
      const name = extractFirstTagText(block, ["Name"]);
      if (!name) return null;

      return {
        name,
        title: extractFirstTagText(block, ["Title"]),
        abstract: extractFirstTagText(block, ["Abstract"]),
        defaultCrs: extractFirstTagText(block, ["DefaultCRS"]),
        lowerCorner: extractFirstTagText(block, ["LowerCorner"]),
        upperCorner: extractFirstTagText(block, ["UpperCorner"]),
      };
    })
    .filter((item): item is WfsFeatureTypeSummary => item !== null);
}

export function parseXsdElements(xml: string): XsdElementSummary[] {
  const values: XsdElementSummary[] = [];
  const pattern =
    /<(?:xsd:)?element\b([^>]*\bname="([^"]+)"[^>]*)\/?>/g;

  for (const match of xml.matchAll(pattern)) {
    const attributes = match[1] ?? "";
    const name = match[2];
    if (!name) continue;

    const type = attributes.match(/\btype="([^"]+)"/)?.[1];
    const nillable = attributes.match(/\bnillable="([^"]+)"/)?.[1];
    const minOccurs = attributes.match(/\bminOccurs="([^"]+)"/)?.[1];
    const maxOccurs = attributes.match(/\bmaxOccurs="([^"]+)"/)?.[1];

    values.push({
      name,
      type,
      nillable: nillable === undefined ? undefined : nillable === "true",
      minOccurs,
      maxOccurs,
    });
  }

  return values;
}

export function parseWmsLayers(xml: string): WmsLayerSummary[] {
  return extractXmlBlocks(xml, "Layer")
    .map((block): WmsLayerSummary | null => {
      const firstNameIndex = block.search(/<(?:[A-Za-z0-9_-]+:)?Name\b/);
      const nestedLayerIndex = block.search(/<Layer\b/);
      const directBlock = nestedLayerIndex === -1 ? block : block.slice(0, nestedLayerIndex);

      if (firstNameIndex === -1) return null;
      if (nestedLayerIndex !== -1 && nestedLayerIndex < firstNameIndex) return null;

      const name = extractFirstTagText(directBlock, ["Name"]);
      if (!name || name === "WMS" || name.toLowerCase().startsWith("default-style-")) {
        return null;
      }

      const title = extractFirstTagText(directBlock, ["Title"]);
      const abstract = extractFirstTagText(directBlock, ["Abstract"]);

      return {
        name,
        title: title?.includes("<") ? undefined : title,
        abstract: abstract?.includes("<") ? undefined : abstract,
        crs: extractAllTagTexts(directBlock, ["CRS", "SRS"]),
      };
    })
    .filter((item): item is WmsLayerSummary => item !== null);
}
