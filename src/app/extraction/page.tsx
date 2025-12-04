"use client";

import {
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  InboxStackIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TreeNode,
  buildTreeFromJson,
  filterTree,
} from "@/lib/tree";
import {
  ExtractionContext,
  clearCleansedContext,
  clearExtractionContext,
  loadExtractionContext,
  saveCleansedContext,
} from "@/lib/extraction-context";

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(value > 9 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const safeJsonParse = (value: string | undefined) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

type Feedback = {
  state: "idle" | "loading" | "success" | "error";
  message?: string;
};

const FeedbackPill = ({ feedback }: { feedback: Feedback }) => {
  if (feedback.state === "idle") return null;
  const className = clsx(
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
    feedback.state === "success"
      ? "bg-emerald-50 text-emerald-700"
      : feedback.state === "error"
        ? "bg-rose-50 text-rose-700"
        : "bg-indigo-50 text-indigo-600",
  );
  const Icon =
    feedback.state === "loading"
      ? ArrowPathIcon
      : feedback.state === "success"
        ? CheckCircleIcon
        : ExclamationCircleIcon;
  const message =
    feedback.message ??
    (feedback.state === "loading"
      ? "Contacting backend..."
      : feedback.state === "success"
        ? "Completed successfully."
        : "Something went wrong.");
  return (
    <div className={className}>
      <Icon className={clsx("size-4", feedback.state === "loading" && "animate-spin")} />
      {message}
    </div>
  );
};

const getValueAtPath = (payload: any, path: string | string[]) => {
  if (!payload) return undefined;
  const segments = Array.isArray(path)
    ? path
    : path
        .split(".")
        .map((segment) => segment.trim())
        .filter(Boolean);
  if (!segments.length) return payload;
  let current: any = payload;
  for (const segment of segments) {
    if (!segment) continue;
    if (segment.startsWith("[")) {
      const index = Number(segment.replace(/[^0-9]/g, ""));
      if (!Array.isArray(current) || Number.isNaN(index)) {
        return undefined;
      }
      current = current[index];
    } else if (current && typeof current === "object") {
      current = current[segment];
    } else {
      return undefined;
    }
  }
  return current;
};

const flattenTree = (nodes: TreeNode[]) => {
  const map = new Map<string, TreeNode>();
  const traverse = (node: TreeNode) => {
    map.set(node.id, node);
    node.children?.forEach(traverse);
  };
  nodes.forEach(traverse);
  return map;
};

const extractCleansedItems = (input: unknown): unknown[] => {
  const visited = new WeakSet<object>();
  const walk = (value: unknown): unknown[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value !== "object") return [];
    if (visited.has(value as object)) return [];
    visited.add(value as object);
    const record = value as Record<string, unknown>;
    const prioritizedKeys = [
      "cleansedItems",
      "items",
      "data",
      "payload",
      "result",
      "body",
    ];
    for (const key of prioritizedKeys) {
      const candidate = record[key];
      if (Array.isArray(candidate)) {
        return candidate;
      }
      if (candidate && typeof candidate === "object") {
        const nested = walk(candidate);
        if (nested.length) return nested;
      }
    }
    for (const candidate of Object.values(record)) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
      if (candidate && typeof candidate === "object") {
        const nested = walk(candidate);
        if (nested.length) return nested;
      }
    }
    return [];
  };
  return walk(input);
};

export default function ExtractionPage() {
  const router = useRouter();
  const [context, setContext] = useState<ExtractionContext | null>(null);
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<Feedback>({ state: "idle" });
  const [sending, setSending] = useState(false);
  const [nodeMap, setNodeMap] = useState<Map<string, TreeNode>>(new Map());

  useEffect(() => {
    clearCleansedContext();
    const payload = loadExtractionContext();
    if (!payload) return;
    setContext(payload);
    if (payload.tree && payload.tree.length) {
      setTreeNodes(payload.tree);
      setNodeMap(flattenTree(payload.tree));
      setExpandedNodes(new Set(payload.tree.map((node) => node.id)));
      setActiveNodeId(payload.tree[0].id);
    } else if (payload.rawJson) {
      const parsed = safeJsonParse(payload.rawJson);
      if (parsed) {
        const label = payload.metadata?.name ?? "Payload";
        const counter = { value: 0 };
        const children = buildTreeFromJson(parsed, [label], [], [], counter);
        const rootNode: TreeNode = {
          id: label,
          label,
          path: label,
          dataPath: [],
          type: "object",
          children,
        };
        const nodes = [rootNode];
        setTreeNodes(nodes);
        setNodeMap(flattenTree(nodes));
        setExpandedNodes(new Set([label]));
        setActiveNodeId(label);
      }
    }
    setParsedJson(safeJsonParse(payload.rawJson));
  }, []);

  const filteredTree = useMemo(
    () => filterTree(treeNodes, searchQuery),
    [treeNodes, searchQuery],
  );

  const activeDetails = useMemo(() => {
    if (!activeNodeId) {
      return {
        fieldName: "Select a node",
        fieldPath: "—",
        value: undefined,
      };
    }
    const node = nodeMap.get(activeNodeId);
    if (!node) {
      return {
        fieldName: "Select a node",
        fieldPath: "—",
        value: undefined,
      };
    }
    const dataPath =
      node.dataPath && node.dataPath.length
        ? node.dataPath
        : node.path.split(".").slice(1);
    const fieldPath = dataPath.length ? dataPath.join(".") : "(root)";
    const value = getValueAtPath(parsedJson, dataPath);
    return {
      fieldName: node.label,
      fieldPath,
      value,
    };
  }, [activeNodeId, nodeMap, parsedJson]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((previous) => {
      const next = new Set(previous);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const renderTree = (nodes: TreeNode[]) =>
    nodes.map((node) => {
      const hasChildren = Boolean(node.children?.length);
      const expanded = expandedNodes.has(node.id);
      const selected = activeNodeId === node.id;

      return (
        <div key={node.id} className="space-y-2">
          <button
            type="button"
            onClick={() => {
              setActiveNodeId(node.id);
              if (hasChildren) toggleNode(node.id);
            }}
            className={clsx(
              "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left",
              selected ? "bg-indigo-50 text-indigo-700" : "text-slate-700",
            )}
          >
            {hasChildren ? (
              <span className="text-slate-500">
                {expanded ? (
                  <ChevronDownIcon className="size-4" />
                ) : (
                  <ChevronRightIcon className="size-4" />
                )}
              </span>
            ) : (
              <span className="size-4" />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium">{node.label}</span>
              {!hasChildren && (
                <span className="text-xs text-slate-500">{node.path}</span>
              )}
            </div>
          </button>
          {hasChildren && expanded && (
            <div className="border-l border-slate-100 pl-4">
              {renderTree(node.children!)}
            </div>
          )}
        </div>
      );
    });

  const sendToCleansing = async () => {
    if (!context) return;
    setSending(true);
    setFeedback({ state: "loading" });

    try {
      let response: Response;
      if (context.mode === "s3" && context.sourceUri) {
        response = await fetch("/api/ingestion/s3", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceUri: context.sourceUri }),
        });
      } else if (context.rawJson) {
        const parsed = safeJsonParse(context.rawJson);
        if (!parsed) {
          throw new Error("Original JSON is no longer available.");
        }
        response = await fetch("/api/ingestion/payload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload: parsed }),
        });
      } else {
        throw new Error("No payload available to send to cleansing.");
      }

      const payload = await response.json();
      const rawBody = typeof payload?.rawBody === "string" ? payload.rawBody : undefined;
      const plainBody = payload?.body;
      const normalizedBody =
        typeof plainBody === "string"
          ? safeJsonParse(plainBody) ?? {}
          : plainBody ?? {};
      const parsedRaw = safeJsonParse(rawBody);
      let items = extractCleansedItems(normalizedBody);
      if (!items.length && normalizedBody && typeof normalizedBody === "object") {
        const innerBody = (normalizedBody as Record<string, unknown>)?.body;
        if (innerBody) {
          items = extractCleansedItems(innerBody);
        }
      }
      if (!items.length) {
        items = extractCleansedItems(parsedRaw);
      }
      if (!items.length) {
        items = extractCleansedItems(payload);
      }
      const cleansedId =
        (normalizedBody?.cleansedDataStoreId as string | undefined) ??
        context.metadata.cleansedId;
      const status =
        (normalizedBody?.status as string | undefined) ?? context.metadata.status;
      setFeedback({
        state: response.ok ? "success" : "error",
        message: response.ok
          ? "Cleansing pipeline triggered."
          : normalizedBody?.error ?? payload?.error ?? "Backend rejected the request.",
      });

      if (response.ok) {
        saveCleansedContext({
          metadata: {
            ...context.metadata,
            cleansedId,
            status,
          },
          items,
          rawBody: rawBody ?? (typeof plainBody === "string" ? plainBody : undefined),
          status,
        });
        setSending(false);
        router.push("/cleansed");
        return;
      }
    } catch (error) {
      setFeedback({
        state: "error",
        message:
          error instanceof Error ? error.message : "Failed to send to cleansing.",
      });
    }
    setSending(false);
  };

  if (!context) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">
            Extraction context not found.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Start from the ingestion page to select a file or payload.
          </p>
          <button
            type="button"
            onClick={() => router.push("/ingestion")}
            className="mt-6 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white"
          >
            Back to Ingestion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Extraction
              </p>
              <h1 className="text-xl font-semibold text-slate-900">
                Review structured content
              </h1>
            </div>
            <FeedbackPill feedback={feedback} />
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            {["Ingestion", "Extraction", "Cleansing", "Data Enrichment", "Content QA"].map(
              (label, index) => (
                <div key={label} className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "rounded-full px-3 py-1",
                      index === 1
                        ? "bg-indigo-50 text-indigo-600"
                        : index < 1
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {label}
                  </span>
                  {index < 4 && <span className="text-slate-300">—</span>}
                </div>
              ),
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  File structure
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  {context.metadata.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={sendToCleansing}
                disabled={sending}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white",
                  sending && "cursor-not-allowed opacity-60",
                )}
              >
                {sending ? (
                  <>
                    <ArrowPathIcon className="size-4 animate-spin" /> Sending…
                  </>
                ) : (
                  "Send to Cleansing"
                )}
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
              <InboxStackIcon className="size-4 text-slate-500" />
              <span className="font-semibold text-slate-700">{context.metadata.source}</span>
            </div>
            <div className="mt-4">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search fields..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="mt-4 max-h-[420px] overflow-y-auto pr-2">
                {filteredTree.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                    No structure available. Upload a JSON payload first.
                  </div>
                ) : (
                  <div className="space-y-3">{renderTree(filteredTree)}</div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Data overview
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              Field details
            </h2>
            <div className="mt-4 space-y-4 rounded-2xl bg-slate-50 p-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Field name
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {activeDetails.fieldName}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Field path
                </p>
                <p className="mt-1 text-xs font-mono text-slate-700">
                  {activeDetails.fieldPath}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Original value
                </p>
                <div className="mt-2 max-h-48 overflow-y-auto rounded-xl bg-slate-50 p-3 text-sm text-slate-800">
                  {activeDetails.value === undefined
                    ? "—"
                    : typeof activeDetails.value === "object"
                      ? JSON.stringify(activeDetails.value, null, 2)
                      : String(activeDetails.value)}
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">File metadata</h3>
            <button
              type="button"
              onClick={() => {
                clearExtractionContext();
                router.push("/ingestion");
              }}
              className="text-xs font-semibold text-indigo-600"
            >
              Start over
            </button>
          </div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Name</dt>
              <dd className="text-sm font-semibold text-slate-900">{context.metadata.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Size</dt>
              <dd className="text-sm font-semibold text-slate-900">
                {formatBytes(context.metadata.size)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Cleansed ID</dt>
              <dd className="text-sm font-semibold text-slate-900">
                {context.metadata.cleansedId ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Uploaded</dt>
              <dd className="text-sm font-semibold text-slate-900">
                {new Date(context.metadata.uploadedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}
