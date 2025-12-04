import { TreeNode } from "./tree";

export type ExtractionContext = {
  mode: "local" | "api" | "s3";
  metadata: {
    name: string;
    size: number;
    source: string;
    cleansedId?: string;
    status?: string;
    uploadedAt: number;
  };
  tree?: TreeNode[];
  rawJson?: string;
  sourceUri?: string;
  backendPayload?: unknown;
};

const STORAGE_KEY = "extraction-context";
const CLEANSED_STORAGE_KEY = "cleansed-context";

export const saveExtractionContext = (payload: ExtractionContext) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const loadExtractionContext = (): ExtractionContext | null => {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as ExtractionContext;
  } catch (error) {
    console.error("Failed to parse extraction context", error);
    return null;
  }
};

export const clearExtractionContext = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
};

export type CleansedContext = {
  metadata: ExtractionContext["metadata"];
  items: unknown[];
  rawBody?: string;
  status?: string;
};

export const saveCleansedContext = (payload: CleansedContext) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CLEANSED_STORAGE_KEY, JSON.stringify(payload));
};

export const loadCleansedContext = (): CleansedContext | null => {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem(CLEANSED_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as CleansedContext;
  } catch (error) {
    console.error("Failed to parse cleansed context", error);
    return null;
  }
};

export const clearCleansedContext = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CLEANSED_STORAGE_KEY);
};
