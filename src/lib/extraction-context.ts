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
