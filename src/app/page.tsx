"use client";

import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  InboxStackIcon,
  MagnifyingGlassIcon,
  ServerStackIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type UploadTab = "s3" | "local" | "api";

type UploadStatus = "queued" | "uploading" | "success" | "error";

type UploadItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  source: "Local" | "API" | "S3";
  status: UploadStatus;
  createdAt: number;
  cleansedId?: string;
  backendStatus?: string;
  backendMessage?: string;
  checkingStatus?: boolean;
};

type TreeNode = {
  id: string;
  label: string;
  path: string;
  type: "object" | "array" | "value";
  children?: TreeNode[];
  value?: string;
};

type ApiFeedback = {
  state: "idle" | "loading" | "success" | "error";
  message?: string;
};

type Stage = "ingestion" | "extraction";

const workflowSteps = [
  "Ingestion",
  "Extraction",
  "Cleansing",
  "Data Enrichment",
  "Content QA",
] as const;

type WorkflowStep = (typeof workflowSteps)[number];
type StepStatus = "complete" | "current" | "upcoming";

const stageIndexMap: Record<Stage, number> = {
  ingestion: 0,
  extraction: 1,
};

const uploadTabs = [
  {
    id: "s3" as const,
    title: "Amazon S3 / Cloud",
    description: "Ingest directly from s3:// or classpath URIs.",
    icon: CloudArrowUpIcon,
    disabled: false,
  },
  {
    id: "local" as const,
    title: "Local Upload",
    description: "Upload files directly from your device.",
    icon: ArrowUpTrayIcon,
    disabled: false,
  },
  {
    id: "api" as const,
    title: "API Endpoint",
    description: "Send JSON payloads programmatically.",
    icon: ServerStackIcon,
    disabled: false,
  },
];

const MAX_TREE_NODES = 800;
const MAX_ARRAY_CHILDREN = 12;

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(value > 9 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const safeJsonParse = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const summarizeNodeValue = (value: unknown): string => {
  if (value === null) return "null";
  if (typeof value === "string") {
    return value.length > 160 ? `${value.slice(0, 157)}…` : value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return `Array (${value.length})`;
  }
  if (isPlainObject(value)) {
    return "Object";
  }
  return String(value);
};

const buildTreeFromJson = (
  payload: unknown,
  parentPath: string[],
  counter: { value: number },
): TreeNode[] => {
  if (counter.value >= MAX_TREE_NODES) return [];

  if (Array.isArray(payload)) {
    return payload.slice(0, MAX_ARRAY_CHILDREN).flatMap((entry, index) => {
      const label = `[${index}]`;
      const id = [...parentPath, label].join(".");
      counter.value += 1;
      if (counter.value >= MAX_TREE_NODES) return [];

      const childNodes = buildTreeFromJson(entry, [...parentPath, label], counter);
      const type = Array.isArray(entry)
        ? "array"
        : isPlainObject(entry)
          ? "object"
          : "value";
      const isLeaf = type === "value";
      return [
        {
          id,
          label,
          path: id,
          type,
          children: !isLeaf && childNodes.length ? childNodes : undefined,
          value: isLeaf ? summarizeNodeValue(entry) : undefined,
        },
      ];
    });
  }

  if (isPlainObject(payload)) {
    return Object.entries(payload).flatMap(([key, value]) => {
      if (counter.value >= MAX_TREE_NODES) return [];
      const id = [...parentPath, key].join(".");
      counter.value += 1;
      const childNodes = buildTreeFromJson(value, [...parentPath, key], counter);
      const type = Array.isArray(value)
        ? "array"
        : isPlainObject(value)
          ? "object"
          : "value";
      const isLeaf = type === "value";
      return [
        {
          id,
          label: key,
          path: id,
          type,
          children: !isLeaf && childNodes.length ? childNodes : undefined,
          value: isLeaf ? summarizeNodeValue(value) : undefined,
        },
      ];
    });
  }

  return [];
};

const gatherNodeIds = (node: TreeNode): string[] => {
  return [
    node.id,
    ...(node.children?.flatMap((child) => gatherNodeIds(child)) ?? []),
  ];
};

const gatherLeafNodes = (node: TreeNode): TreeNode[] => {
  if (!node.children || node.children.length === 0) {
    return [node];
  }
  return node.children.flatMap((child) => gatherLeafNodes(child));
};

const buildNodeLookup = (nodes: TreeNode[]): Map<string, TreeNode> => {
  const map = new Map<string, TreeNode>();
  const traverse = (node: TreeNode) => {
    map.set(node.id, node);
    node.children?.forEach(traverse);
  };
  nodes.forEach(traverse);
  return map;
};

const isNodeFullySelected = (
  node: TreeNode,
  selected: Set<string>,
): boolean => {
  if (!node.children || node.children.length === 0) {
    return selected.has(node.id);
  }
  return (
    selected.has(node.id) ||
    node.children.every((child) => isNodeFullySelected(child, selected))
  );
};

const isNodePartiallySelected = (
  node: TreeNode,
  selected: Set<string>,
): boolean => {
  if (!node.children || node.children.length === 0) {
    return false;
  }
  const childStates = node.children.map((child) => ({
    full: isNodeFullySelected(child, selected),
    partial: isNodePartiallySelected(child, selected),
  }));
  const hasPartialChild = childStates.some((child) => child.partial);
  const hasCheckedChild = childStates.some((child) => child.full);
  return (!selected.has(node.id) && hasCheckedChild) || hasPartialChild;
};

const filterTree = (nodes: TreeNode[], query: string): TreeNode[] => {
  if (!query) return nodes;
  const normalized = query.toLowerCase();

  const searchNode = (node: TreeNode): TreeNode | null => {
    const matches = node.label.toLowerCase().includes(normalized);
    if (!node.children || node.children.length === 0) {
      return matches ? node : null;
    }
    const filteredChildren = node.children
      .map(searchNode)
      .filter((child): child is TreeNode => Boolean(child));
    if (matches || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren.length ? filteredChildren : undefined,
      };
    }
    return null;
  };

  return nodes
    .map(searchNode)
    .filter((node): node is TreeNode => Boolean(node));
};

const getFileLabel = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "json":
      return { label: "JSON", style: "bg-violet-100 text-violet-700" };
    case "pdf":
      return { label: "PDF", style: "bg-rose-100 text-rose-700" };
    case "xls":
    case "xlsx":
      return { label: "XLS", style: "bg-emerald-100 text-emerald-700" };
    case "doc":
    case "docx":
      return { label: "DOC", style: "bg-sky-100 text-sky-700" };
    default:
      return { label: "FILE", style: "bg-slate-100 text-slate-600" };
  }
};

const statusStyles: Record<
  UploadStatus,
  { label: string; className: string; dot: string }
> = {
  queued: {
    label: "Queued",
    className: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },
  uploading: {
    label: "Uploading",
    className: "bg-amber-50 text-amber-700",
    dot: "bg-amber-400",
  },
  success: {
    label: "Accepted",
    className: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  error: {
    label: "Error",
    className: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
};

const nodeTypeBadges: Record<
  TreeNode["type"],
  { label: string; className: string }
> = {
  object: { label: "Object", className: "bg-slate-100 text-slate-700" },
  array: { label: "Array", className: "bg-violet-100 text-violet-700" },
  value: { label: "Value", className: "bg-emerald-100 text-emerald-700" },
};

const FeedbackPill = ({ feedback }: { feedback: ApiFeedback }) => {
  if (feedback.state === "idle") {
    return null;
  }

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
      <Icon
        className={clsx("size-4", feedback.state === "loading" && "animate-spin")}
      />
      {message}
    </div>
  );
};

const TreeCheckbox = ({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (next: boolean) => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      onClick={(event) => event.stopPropagation()}
    />
  );
};

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<UploadTab>("local");
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("ingestion");
  const [extractedFileName, setExtractedFileName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [apiPayload, setApiPayload] = useState("");
  const [apiFeedback, setApiFeedback] = useState<ApiFeedback>({
    state: "idle",
  });
  const [s3Uri, setS3Uri] = useState("");
  const [s3Feedback, setS3Feedback] = useState<ApiFeedback>({
    state: "idle",
  });

  const workflowTimeline = useMemo(() => {
    const currentIndex = stageIndexMap[stage];
    return workflowSteps.map((label, index) => ({
      label,
      status:
        index < currentIndex
          ? ("complete" as StepStatus)
          : index === currentIndex
            ? ("current" as StepStatus)
            : ("upcoming" as StepStatus),
    }));
  }, [stage]);

  const filteredTree = useMemo(
    () => filterTree(treeNodes, searchQuery),
    [treeNodes, searchQuery],
  );

  const nodeLookup = useMemo(() => buildNodeLookup(treeNodes), [treeNodes]);
  const focusedNode = useMemo(
    () => (focusedNodeId ? nodeLookup.get(focusedNodeId) ?? null : null),
    [nodeLookup, focusedNodeId],
  );

  useEffect(() => {
    if (!treeNodes.length) {
      setFocusedNodeId(null);
    } else if (focusedNodeId && !nodeLookup.has(focusedNodeId)) {
      setFocusedNodeId(treeNodes[0]?.id ?? null);
    }
  }, [treeNodes, nodeLookup, focusedNodeId]);

  const selectedLeafNodes = useMemo(() => {
    if (!treeNodes.length) return [];
    return treeNodes.flatMap((node) =>
      gatherLeafNodes(node).filter((leaf) => selectedNodes.has(leaf.id)),
    );
  }, [treeNodes, selectedNodes]);

  const filteredUploads = useMemo(() => {
    if (!historySearch) return uploads;
    const normalized = historySearch.toLowerCase();
    return uploads.filter(
      (upload) =>
        upload.name.toLowerCase().includes(normalized) ||
        upload.cleansedId?.toLowerCase().includes(normalized),
    );
  }, [uploads, historySearch]);

  const canExtract = selectedLeafNodes.length > 0;
  const focusedNodeStats = useMemo(() => {
    if (!focusedNode) return null;
    const nodeIds = gatherNodeIds(focusedNode);
    const selectedCount = nodeIds.filter((id) => selectedNodes.has(id)).length;
    return {
      totalNodes: nodeIds.length,
      selectedCount,
      descendantCount: Math.max(nodeIds.length - 1, 0),
    };
  }, [focusedNode, selectedNodes]);

  const focusedNodeSelectionState = useMemo(() => {
    if (!focusedNode) return null;
    return {
      full: isNodeFullySelected(focusedNode, selectedNodes),
      partial: isNodePartiallySelected(focusedNode, selectedNodes),
    };
  }, [focusedNode, selectedNodes]);
  const latestUpload = uploads[0];
  const latestUploadTime = latestUpload
    ? new Date(latestUpload.createdAt).toLocaleString()
    : new Date().toLocaleString();
  const extractionEntries = selectedLeafNodes.map((leaf, index) => ({
    id: leaf.id,
    label: leaf.label,
    path: leaf.path,
    value: leaf.value ?? "—",
    order: index + 1,
  }));
  const extractionTimelineEntries = [
    {
      title: "Upload received",
      detail: latestUploadTime,
      state: "complete" as StepStatus,
    },
    {
      title: "Fields selected",
      detail: `${selectedLeafNodes.length} data points mapped`,
      state: "complete" as StepStatus,
    },
    {
      title: "Ready for cleansing",
      detail: "Awaiting enrichment trigger",
      state: "current" as StepStatus,
    },
  ];
  const extractionSummary = [
    {
      label: "Source file",
      value: extractedFileName ?? latestUpload?.name ?? "—",
    },
    {
      label: "Selected fields",
      value: `${selectedLeafNodes.length}`,
    },
    {
      label: "Captured on",
      value: latestUploadTime,
    },
    {
      label: "Readiness",
      value: canExtract ? "Ready for cleansing" : "Awaiting selection",
    },
  ];

  const handleFileSelection = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setStage("ingestion");

    Array.from(files).forEach(async (file) => {
      const uploadId = crypto.randomUUID();
      const newUpload: UploadItem = {
        id: uploadId,
        name: file.name,
        size: file.size,
        type: file.type || file.name.split(".").pop() || "file",
        source: "Local",
        status: "uploading",
        createdAt: Date.now(),
      };
      setUploads((previous) => [newUpload, ...previous]);

      if (file.name.toLowerCase().endsWith(".json")) {
        const text = await file.text();
        const parsed = safeJsonParse(text);
        if (!parsed) {
          setUploads((previous) =>
            previous.map((item) =>
              item.id === uploadId
                ? {
                    ...item,
                    status: "error",
                    backendMessage:
                      "Unable to parse JSON. Please upload a valid JSON file.",
                  }
                : item,
            ),
          );
          return;
        }

        const counter = { value: 0 };
        const children = buildTreeFromJson(parsed, [], counter);
        const rootType = Array.isArray(parsed)
          ? "array"
          : isPlainObject(parsed)
            ? "object"
            : "value";
        const rootIsLeaf = rootType === "value";
        const rootNode: TreeNode = {
          id: file.name,
          label: file.name,
          path: file.name,
          type: rootType,
          children: !rootIsLeaf && children.length ? children : undefined,
          value: rootIsLeaf ? summarizeNodeValue(parsed) : undefined,
        };

        setTreeNodes([rootNode]);
        const allNodeIds = new Set(gatherNodeIds(rootNode));
        setExpandedNodes(allNodeIds);
        const defaultSelection = new Set(allNodeIds);
        setSelectedNodes(defaultSelection);
        setExtractedFileName(file.name);
        setFocusedNodeId(rootNode.id);

        setUploads((previous) =>
          previous.map((item) =>
            item.id === uploadId
              ? {
                  ...item,
                  status: "success",
                  backendStatus: "EXTRACTED",
                  backendMessage: "JSON parsed locally. Ready for cleansing.",
                }
              : item,
          ),
        );
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/ingestion/upload", {
          method: "POST",
          body: formData,
        });
        const payload = await response.json();
        const body = payload.body as Record<string, unknown> | string | null;
        const cleansedId =
          typeof body === "object" && body !== null
            ? (body["cleansedDataStoreId"] as string | undefined)
            : undefined;
        const backendStatus =
          typeof body === "object" && body !== null
            ? (body["status"] as string | undefined)
            : undefined;
        const backendMessage =
          typeof body === "string"
            ? body
            : typeof payload.rawBody === "string"
              ? payload.rawBody
              : undefined;

        setUploads((previous) =>
          previous.map((item) =>
            item.id === uploadId
              ? {
                  ...item,
                  status: response.ok ? "success" : "error",
                  cleansedId: cleansedId ?? item.cleansedId,
                  backendStatus: backendStatus ?? item.backendStatus,
                  backendMessage:
                    backendMessage ??
                    (typeof body === "object"
                      ? JSON.stringify(body)
                      : item.backendMessage),
                }
              : item,
          ),
        );
      } catch (error) {
        setUploads((previous) =>
          previous.map((item) =>
            item.id === uploadId
              ? {
                  ...item,
                  status: "error",
                  backendMessage:
                    error instanceof Error
                      ? error.message
                      : "Upload failed unexpectedly.",
                }
              : item,
          ),
        );
      }
    });
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleFileSelection(event.dataTransfer.files);
  };

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

  const handleNodeSelection = (node: TreeNode, value: boolean) => {
    setSelectedNodes((previous) => {
      const next = new Set(previous);
      gatherNodeIds(node).forEach((id) => {
        if (value) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  };

  const handleExtractData = () => {
    if (!canExtract) return;
    setStage("extraction");
  };

  const handleBackToSelection = () => {
    setStage("ingestion");
  };

  const submitApiPayload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiPayload.trim()) return;

    const parsed = safeJsonParse(apiPayload);
    if (!parsed) {
      setApiFeedback({
        state: "error",
        message: "Payload must be valid JSON before submission.",
      });
      return;
    }

    setApiFeedback({ state: "loading" });
    const uploadId = crypto.randomUUID();
    setUploads((previous) => [
      {
        id: uploadId,
        name: "API payload",
        size: apiPayload.length,
        type: "application/json",
        source: "API",
        status: "uploading",
        createdAt: Date.now(),
      },
      ...previous,
    ]);

    try {
      const response = await fetch("/api/ingestion/payload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: parsed }),
      });
      const payload = await response.json();
      const body = payload.body as Record<string, unknown> | string | null;
      const cleansedId =
        typeof body === "object" && body !== null
          ? (body["cleansedDataStoreId"] as string | undefined)
          : undefined;
      const backendStatus =
        typeof body === "object" && body !== null
          ? (body["status"] as string | undefined)
          : undefined;

      setUploads((previous) =>
        previous.map((upload) =>
          upload.id === uploadId
            ? {
                ...upload,
                status: response.ok ? "success" : "error",
                cleansedId: cleansedId ?? upload.cleansedId,
                backendStatus: backendStatus ?? upload.backendStatus,
                backendMessage:
                  typeof body === "string"
                    ? body
                    : JSON.stringify(body ?? {}),
              }
            : upload,
        ),
      );

      setApiFeedback({
        state: response.ok ? "success" : "error",
        message: response.ok
          ? "Payload accepted. Enrichment pipeline triggered."
          : "Backend rejected the payload.",
      });
      if (response.ok) {
        setApiPayload("");
      }
    } catch (error) {
      setUploads((previous) =>
        previous.map((upload) =>
          upload.id === uploadId
            ? {
                ...upload,
                status: "error",
                backendMessage:
                  error instanceof Error ? error.message : "Unknown error",
              }
            : upload,
        ),
      );
      setApiFeedback({
        state: "error",
        message: "Failed to reach the Spring Boot API.",
      });
    }
  };

  const submitS3Ingestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = s3Uri.trim();
    if (!normalized) {
      setS3Feedback({
        state: "error",
        message: "Provide an s3://bucket/key (or classpath:) URI first.",
      });
      return;
    }

    setS3Feedback({ state: "loading" });
    const uploadId = crypto.randomUUID();
    setUploads((previous) => [
      {
        id: uploadId,
        name: normalized,
        size: 0,
        type: "text/uri-list",
        source: "S3",
        status: "uploading",
        createdAt: Date.now(),
      },
      ...previous,
    ]);

    try {
      const response = await fetch("/api/ingestion/s3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUri: normalized }),
      });
      const payload = await response.json();
      const body = payload.body as Record<string, unknown> | string | null;
      const cleansedId =
        typeof body === "object" && body !== null
          ? (body["cleansedDataStoreId"] as string | undefined)
          : undefined;
      const backendStatus =
        typeof body === "object" && body !== null
          ? (body["status"] as string | undefined)
          : undefined;

      setUploads((previous) =>
        previous.map((upload) =>
          upload.id === uploadId
            ? {
                ...upload,
                status: response.ok ? "success" : "error",
                cleansedId: cleansedId ?? upload.cleansedId,
                backendStatus:
                  backendStatus ?? (response.ok ? "ACCEPTED" : upload.backendStatus),
                backendMessage:
                  typeof body === "string"
                    ? body
                    : typeof payload.rawBody === "string"
                      ? payload.rawBody
                      : upload.backendMessage,
              }
            : upload,
        ),
      );

      setS3Feedback({
        state: response.ok ? "success" : "error",
        message: response.ok
          ? "Source accepted. Enrichment pipeline triggered."
          : "Backend rejected the S3/classpath request.",
      });

      if (response.ok) {
        setS3Uri("");
      }
    } catch (error) {
      setUploads((previous) =>
        previous.map((upload) =>
          upload.id === uploadId
            ? {
                ...upload,
                status: "error",
                backendMessage:
                  error instanceof Error ? error.message : "S3 ingestion failed",
              }
            : upload,
        ),
      );
      setS3Feedback({
        state: "error",
        message: "Failed to reach the Spring Boot API.",
      });
    }
  };

  const checkStatus = async (upload: UploadItem) => {
    if (!upload.cleansedId) return;
    setUploads((previous) =>
      previous.map((item) =>
        item.id === upload.id
          ? { ...item, checkingStatus: true }
          : item,
      ),
    );
    try {
      const response = await fetch(
        `/api/ingestion/status?id=${encodeURIComponent(upload.cleansedId)}`,
      );
      const payload = await response.json();
      setUploads((previous) =>
        previous.map((item) =>
          item.id === upload.id
            ? {
                ...item,
                backendStatus: payload.status ?? payload.message,
                checkingStatus: false,
              }
            : item,
        ),
      );
    } catch (error) {
      setUploads((previous) =>
        previous.map((item) =>
          item.id === upload.id
            ? {
                ...item,
                backendStatus:
                  error instanceof Error ? error.message : "Status check failed",
                checkingStatus: false,
              }
            : item,
        ),
      );
    }
  };

  const renderTree = (nodes: TreeNode[]) =>
    nodes.map((node) => {
      const hasChildren = Boolean(node.children?.length);
      const expanded = expandedNodes.has(node.id);
      const fullySelected = isNodeFullySelected(node, selectedNodes);
      const partiallySelected = isNodePartiallySelected(node, selectedNodes);
      const matchesSearch =
        searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
      const isFocused = node.id === focusedNodeId;

      return (
        <div key={node.id} className="space-y-2">
          <div
            className={clsx(
              "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition",
              isFocused
                ? "border border-indigo-200 bg-indigo-50 shadow-sm"
                : matchesSearch
                  ? "bg-indigo-50"
                  : "bg-transparent hover:bg-slate-50",
            )}
            onClick={() => setFocusedNodeId(node.id)}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleNode(node.id);
                }}
                className="text-slate-500 transition hover:text-slate-800"
                aria-label={expanded ? "Collapse section" : "Expand section"}
              >
                {expanded ? (
                  <ChevronDownIcon className="size-4" />
                ) : (
                  <ChevronRightIcon className="size-4" />
                )}
              </button>
            ) : (
              <span className="size-4" />
            )}
            <TreeCheckbox
              checked={fullySelected}
              indeterminate={partiallySelected}
              onChange={(next) => handleNodeSelection(node, next)}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900">
                {node.label}
              </span>
              {!hasChildren && (
                <>
                  <span className="text-[11px] text-slate-500">{node.path}</span>
                  {node.value !== undefined && (
                    <span className="text-xs font-mono text-slate-600 truncate">
                      {node.value}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          {hasChildren && expanded && (
            <div className="border-l border-slate-100 pl-4">
              {renderTree(node.children!)}
            </div>
          )}
        </div>
      );
    });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-lg font-semibold text-white">
              
            </div>
            <div>
              <p className="text-sm text-slate-500">Context</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  EN-US
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  US
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  product-detail
                </span>
              </div>
            </div>
          </div>
          <nav className="flex flex-1 justify-end gap-2 text-sm font-medium text-slate-500">
            {workflowTimeline.map((step, index) => (
              <div key={step.label} className="flex items-center gap-2">
                <span
                  className={clsx(
                    "rounded-full px-3 py-1",
                    step.status === "current"
                      ? "bg-indigo-50 text-indigo-600"
                      : step.status === "complete"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-50",
                  )}
                >
                  {step.label}
                </span>
                {index < workflowTimeline.length - 1 && (
                  <span className="text-slate-300">—</span>
                )}
              </div>
            ))}
          </nav>
        </div>
      </header>

      {stage === "ingestion" ? (
        <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Ingestion
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  Upload Files
                </h2>
                <p className="text-sm text-slate-500">
                  Drag and drop JSON, PDF, DOCX or XLS (max 50 MB) to kick off
                  extraction.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="size-2 rounded-full bg-emerald-500" />
                Ready
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {uploadTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  disabled={tab.disabled}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  className={clsx(
                    "rounded-2xl border px-4 py-3 text-left transition",
                    tab.disabled
                      ? "border-dashed border-slate-200 text-slate-400"
                      : activeTab === tab.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 hover:border-indigo-200",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="size-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {tab.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {tab.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {activeTab === "local" && (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <label
                  htmlFor="file-upload"
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onDrop={handleDrop}
                  className="flex cursor-pointer flex-col items-center gap-4"
                >
                  <ArrowUpTrayIcon className="size-10 text-indigo-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Drag files here or{" "}
                      <span className="text-indigo-600 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      JSON, PDF, DOCX or XLS (max 50 MB)
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    ref={fileInputRef}
                    type="file"
                    className="sr-only"
                    multiple
                    accept=".json,.pdf,.doc,.docx,.xls,.xlsx,application/json"
                    onChange={(event) => handleFileSelection(event.target.files)}
                  />
                </label>
              </div>
            )}

            {activeTab === "api" && (
              <form
                className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                onSubmit={submitApiPayload}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ServerStackIcon className="size-5 text-indigo-500" />
                  POST /api/ingest-json-payload
                </div>
                <textarea
                  value={apiPayload}
                  onChange={(event) => setApiPayload(event.target.value)}
                  rows={6}
                  placeholder='Paste JSON payload. Example: { "product": { "name": "Vision Pro" } }'
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <FeedbackPill feedback={apiFeedback} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    Dispatch Payload
                  </button>
                </div>
              </form>
            )}
            {activeTab === "s3" && (
              <form
                className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                onSubmit={submitS3Ingestion}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <CloudArrowUpIcon className="size-5 text-indigo-500" />
                  GET /api/extract-cleanse-enrich-and-store
                </div>
                <input
                  value={s3Uri}
                  onChange={(event) => setS3Uri(event.target.value)}
                  placeholder="s3://my-bucket/path/to/file.json"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none"
                />
                <p className="text-xs text-slate-500">
                  Accepts s3://bucket/key or classpath:relative/path references that
                  the Spring Boot service can access.
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <FeedbackPill feedback={s3Feedback} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    Trigger Ingestion
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {uploads.slice(0, 2).map((upload) => {
                const badge = getFileLabel(upload.name);
                const status = statusStyles[upload.status];
                return (
                  <div
                    key={upload.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={clsx(
                            "rounded-xl px-3 py-1 text-xs font-semibold",
                            badge.style,
                          )}
                        >
                          {badge.label}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {upload.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatBytes(upload.size)} • {upload.source}
                          </p>
                        </div>
                      </div>
                      <span
                        className={clsx(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                          status.className,
                        )}
                      >
                        <span
                          className={clsx("size-2 rounded-full", status.dot)}
                        />
                        {status.label}
                      </span>
                    </div>
                    {upload.backendStatus && (
                      <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        Status: {upload.backendStatus}
                      </p>
                    )}
                    {upload.cleansedId && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          Cleansed ID:
                        </span>
                        <code className="rounded-full bg-slate-100 px-2 py-1">
                          {upload.cleansedId}
                        </code>
                        <button
                          type="button"
                          onClick={() => checkStatus(upload)}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                        >
                          {upload.checkingStatus ? (
                            <ArrowPathIcon className="size-3 animate-spin" />
                          ) : (
                            <MagnifyingGlassIcon className="size-3" />
                          )}
                          Check status
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Upload History
              </h3>
              <div className="relative w-full max-w-xs">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search by file or Cleansed ID"
                  value={historySearch}
                  onChange={(event) => setHistorySearch(event.target.value)}
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {filteredUploads.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                  No uploads yet. Drop a JSON file to start the pipeline.
                </div>
              )}
              {filteredUploads.map((upload) => {
                const status = statusStyles[upload.status];
                return (
                  <div
                    key={upload.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white p-2 shadow-sm">
                        <DocumentTextIcon className="size-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {upload.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(upload.createdAt).toLocaleString()} •{" "}
                          {upload.source}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {upload.cleansedId && (
                        <code className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-inner">
                          {upload.cleansedId}
                        </code>
                      )}
                      <span
                        className={clsx(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                          status.className,
                        )}
                      >
                        <span
                          className={clsx("size-2 rounded-full", status.dot)}
                        />
                        {status.label}
                      </span>
                      {upload.cleansedId && (
                        <button
                          type="button"
                          onClick={() => checkStatus(upload)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                        >
                          {upload.checkingStatus ? "Checking…" : "Refresh"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Selection
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                Select Items
              </h3>
            </div>
            <span className="text-sm font-semibold text-slate-600">
              {selectedLeafNodes.length} items
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <InboxStackIcon className="size-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-600">
              {extractedFileName ?? "Waiting for JSON upload"}
            </span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <div>
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
              <div className="mt-4 max-h-[420px] overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/60 p-3 pr-4">
                {filteredTree.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                    Upload a JSON file to view its structure.
                  </div>
                ) : (
                  <div className="space-y-3">{renderTree(filteredTree)}</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              {!focusedNode ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-500">
                  <DocumentTextIcon className="size-6 text-slate-400" />
                  Select a field on the left to preview its details.
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Field
                      </p>
                      <h4 className="text-lg font-semibold text-slate-900">
                        {focusedNode.label}
                      </h4>
                      <p className="text-xs text-slate-500 break-all">
                        {focusedNode.path}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={clsx(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          nodeTypeBadges[focusedNode.type].className,
                        )}
                      >
                        {nodeTypeBadges[focusedNode.type].label}
                      </span>
                      {focusedNodeSelectionState && (
                        <span
                          className={clsx(
                            "rounded-full px-3 py-1 text-[11px] font-semibold",
                            focusedNodeSelectionState.full
                              ? "bg-emerald-50 text-emerald-700"
                              : focusedNodeSelectionState.partial
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600",
                          )}
                        >
                          {focusedNodeSelectionState.full
                            ? "Selected"
                            : focusedNodeSelectionState.partial
                              ? "Partially selected"
                              : "Not selected"}
                        </span>
                      )}
                    </div>
                  </div>

                  {focusedNode.value !== undefined && (
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Sample value
                      </p>
                      <pre className="mt-2 max-h-40 overflow-y-auto rounded-xl bg-slate-900/90 p-3 text-[11px] leading-relaxed text-slate-100">
                        {focusedNode.value}
                      </pre>
                    </div>
                  )}

                  {focusedNodeStats && (
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs uppercase text-slate-400">
                          Descendants
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                          {focusedNodeStats.descendantCount}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs uppercase text-slate-400">
                          Selected
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                          {focusedNodeStats.selectedCount}
                        </p>
                      </div>
                    </div>
                  )}

                  {!!focusedNode.children?.length && (
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Child fields
                      </p>
                      <div className="mt-2 space-y-1 text-sm text-slate-600">
                        {focusedNode.children.slice(0, 4).map((child) => (
                          <div
                            key={child.id}
                            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium"
                          >
                            <span className="truncate">{child.label}</span>
                            <span className="text-slate-400">›</span>
                          </div>
                        ))}
                        {focusedNode.children.length > 4 && (
                          <p className="text-xs text-slate-400">
                            +{focusedNode.children.length - 4} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleNodeSelection(focusedNode, true)}
                      className={clsx(
                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition",
                        focusedNodeSelectionState?.full
                          ? "bg-slate-200 text-slate-500"
                          : "bg-slate-900 text-white hover:bg-black",
                      )}
                      disabled={focusedNodeSelectionState?.full}
                    >
                      Select branch
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNodeSelection(focusedNode, false)}
                      className={clsx(
                        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                        focusedNodeSelectionState &&
                          (focusedNodeSelectionState.full ||
                            focusedNodeSelectionState.partial)
                          ? "border-rose-200 text-rose-600 hover:border-rose-300 hover:text-rose-700"
                          : "border-slate-200 text-slate-400",
                      )}
                      disabled={
                        !focusedNodeSelectionState ||
                        (!focusedNodeSelectionState.full &&
                          !focusedNodeSelectionState.partial)
                      }
                    >
                      Clear branch
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Selected:</span>
              {selectedLeafNodes.slice(0, 6).map((leaf) => (
                <span
                  key={leaf.id}
                  className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm"
                >
                  {leaf.label}
                </span>
              ))}
              {selectedLeafNodes.length > 6 && (
                <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">
                  +{selectedLeafNodes.length - 6} more
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleExtractData}
              disabled={!canExtract}
              className={clsx(
                "mt-4 w-full rounded-full py-2.5 text-sm font-semibold shadow-sm transition",
                canExtract
                  ? "bg-slate-900 text-white hover:bg-black"
                  : "cursor-not-allowed bg-slate-200 text-slate-500",
              )}
            >
              Continue to Extraction
            </button>
          </div>
        </section>
      </main>
    ) : (
      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Extraction
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  Data ready for cleansing
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedLeafNodes.length} fields selected from{" "}
                  {extractedFileName ?? "the uploaded file"}. Review the mapped values
                  before triggering the cleansing pipeline.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackToSelection}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
                >
                  Refine selection
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Send to Cleansing
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {extractionSummary.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Field breakdown
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  Extracted attributes
                </h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {selectedLeafNodes.length} mapped fields
              </span>
            </div>
            <div className="mt-4 max-h-[520px] overflow-y-auto rounded-2xl border border-slate-100">
              {extractionEntries.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-slate-500">
                  No fields selected. Return to the previous step to choose fields.
                </div>
              ) : (
                extractionEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-0"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                      {entry.order.toString().padStart(2, "0")}
                    </div>
                    <div className="min-w-[180px] flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {entry.label}
                      </p>
                      <p className="text-xs text-slate-500">{entry.path}</p>
                    </div>
                    <div className="min-w-[200px] flex-1">
                      <p className="truncate text-sm font-mono text-slate-700">
                        {entry.value}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Ready
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Timeline
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                Extraction status
              </h3>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              In progress
            </span>
          </div>
          <div className="space-y-4">
            {extractionTimelineEntries.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div
                  className={clsx(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                    item.state === "complete"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-indigo-100 text-indigo-700",
                  )}
                >
                  {item.state === "complete" ? "✓" : "•"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">
            Cleansing and enrichment can be triggered at any time. Use{" "}
            <span className="font-semibold text-slate-900">Send to Cleansing</span>{" "}
            to push this snapshot into the downstream workflow.
          </div>
        </section>
      </main>
    )}
    </div>
  );
}
