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
import { FormEvent, useMemo, useRef, useState } from "react";

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
  value?: unknown;
  children?: TreeNode[];
};

type Stage = "ingestion" | "extraction" | "cleansing";

type FileMetadata = {
  name: string;
  sizeLabel: string;
  source: string;
  uploadedAt: string;
  type: string;
};

type ApiFeedback = {
  state: "idle" | "loading" | "success" | "error";
  message?: string;
};

type CleansingJob = {
  id?: string;
  status?: string;
  message?: string;
  lastChecked?: string;
  checking?: boolean;
};

const stageOrder = [
  "Ingestion",
  "Extraction",
  "Cleansing",
  "Data Enrichment",
  "Content QA",
] as const;

const stageIndexByStage: Record<Stage, number> = {
  ingestion: 0,
  extraction: 1,
  cleansing: 2,
};

const getStepStatus = (label: (typeof stageOrder)[number], stage: Stage) => {
  const currentIndex = stageIndexByStage[stage];
  const stepIndex = stageOrder.indexOf(label);
  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "upcoming";
};

const cleansingRules = [
  {
    title: "Strip HTML Tags",
    description: "Remove any inline markup or unsupported HTML.",
  },
  {
    title: "Normalize NBSP",
    description: "Convert non-breaking spaces to standard spaces.",
  },
  {
    title: "Collapse Whitespace",
    description: "Trim and consolidate duplicate whitespace characters.",
  },
  {
    title: "Validate Field Types",
    description: "Ensure values adhere to the content model expectations.",
  },
];

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

const describeFileKind = (name: string, mime?: string) => {
  if (mime && mime !== "application/octet-stream") {
    if (mime === "application/json") return "JSON";
    if (mime.includes("pdf")) return "PDF";
  }
  const extension = name.split(".").pop()?.toUpperCase();
  return extension ?? "FILE";
};

const toByteLength = (value: string) => new TextEncoder().encode(value).length;

const buildMetadataFromFile = (file: File): FileMetadata => ({
  name: file.name,
  sizeLabel: formatBytes(file.size),
  source: "Local Upload",
  uploadedAt: new Date().toLocaleString(),
  type: describeFileKind(file.name, file.type),
});

const buildMetadataFromPayload = (
  name: string,
  byteLength: number,
  source: string,
): FileMetadata => ({
  name,
  sizeLabel: formatBytes(byteLength),
  source,
  uploadedAt: new Date().toLocaleString(),
  type: "JSON",
});

const safeJsonParse = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

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
      const nodeType = Array.isArray(entry)
        ? "array"
        : isPlainObject(entry)
          ? "object"
          : "value";
      return [
        {
          id,
          label,
          path: id,
          type: nodeType,
          value: nodeType === "value" ? entry : undefined,
          children: childNodes.length ? childNodes : undefined,
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
      const nodeType = Array.isArray(value)
        ? "array"
        : isPlainObject(value)
          ? "object"
          : "value";
      return [
        {
          id,
          label: key,
          path: id,
          type: nodeType,
          value: nodeType === "value" ? value : undefined,
          children: childNodes.length ? childNodes : undefined,
        },
      ];
    });
  }

  return [];
};

const gatherLeafNodes = (node: TreeNode): TreeNode[] => {
  if (!node.children || node.children.length === 0) {
    return [node];
  }
  return node.children.flatMap((child) => gatherLeafNodes(child));
};

const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
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

const formatNodeValue = (value: unknown): string => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
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

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStage, setCurrentStage] = useState<Stage>("ingestion");
  const [activeTab, setActiveTab] = useState<UploadTab>("local");
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [activeNodePath, setActiveNodePath] = useState<string | null>(null);
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
  const [cleansingFeedback, setCleansingFeedback] = useState<ApiFeedback>({
    state: "idle",
  });
  const [activeFileName, setActiveFileName] = useState<string>("Content.JSON");
  const [uploadedJsonPayload, setUploadedJsonPayload] = useState<unknown>(null);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [cleansingJob, setCleansingJob] = useState<CleansingJob | null>(null);

  const filteredTree = useMemo(
    () => filterTree(treeNodes, searchQuery),
    [treeNodes, searchQuery],
  );

  const allLeafNodes = useMemo(() => {
    if (!treeNodes.length) return [];
    return treeNodes.flatMap((node) => gatherLeafNodes(node));
  }, [treeNodes]);

  const previewSourceNode = useMemo(() => {
    if (!treeNodes.length) return null;
    if (!activeNodePath) return treeNodes[0];
    return findNodeById(treeNodes, activeNodePath) ?? treeNodes[0];
  }, [treeNodes, activeNodePath]);

  const extractionRows = useMemo(() => {
    if (!previewSourceNode) return [];
    const leaves = gatherLeafNodes(previewSourceNode);
    return leaves.map((leaf) => ({
      field: leaf.label,
      originalValue: formatNodeValue(leaf.value),
      path: leaf.path,
    }));
  }, [previewSourceNode]);

  const rootNodeId = treeNodes[0]?.id ?? null;
  const canExtract = allLeafNodes.length > 0;
  const isExtractionView = currentStage === "extraction";
  const isCleansingView = currentStage === "cleansing";
  const extractionStatusPill =
    currentStage === "cleansing"
      ? {
          label: "Cleansing ready",
          className: "bg-emerald-50 text-emerald-700",
          iconClassName: "text-emerald-500",
          Icon: CheckCircleIcon,
        }
      : {
          label: "Extraction in progress",
          className: "bg-amber-50 text-amber-700",
          iconClassName: "animate-spin",
          Icon: ArrowPathIcon,
        };
  const ExtractionStatusIcon = extractionStatusPill.Icon;

  const filteredUploads = useMemo(() => {
    if (!historySearch) return uploads;
    const normalized = historySearch.toLowerCase();
    return uploads.filter(
      (upload) =>
        upload.name.toLowerCase().includes(normalized) ||
        upload.cleansedId?.toLowerCase().includes(normalized),
    );
  }, [uploads, historySearch]);

  const handleFileSelection = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

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
        if (parsed) {
          const counter = { value: 0 };
          const children = buildTreeFromJson(parsed, [], counter);
          const rootNode: TreeNode = {
            id: file.name,
            label: file.name,
            path: file.name,
            type: "object",
            children,
          };
          setTreeNodes([rootNode]);
          setExpandedNodes(new Set([rootNode.id]));
          setUploadedJsonPayload(parsed);
          setActiveFileName(file.name);
          setFileMetadata(buildMetadataFromFile(file));
          setActiveNodePath(rootNode.id);
          setCurrentStage("ingestion");
        }
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

  const handleEnterExtraction = () => {
    if (!canExtract) return;
    setCurrentStage("extraction");
    setCleansingFeedback({ state: "idle" });
  };

  const handleBackToSelection = () => {
    setCurrentStage("ingestion");
    setCleansingFeedback({ state: "idle" });
    setCleansingJob(null);
  };

  const sendToCleansing = async () => {
    if (!uploadedJsonPayload) {
      setCleansingFeedback({
        state: "error",
        message: "Upload or paste a JSON payload to continue.",
      });
      return;
    }

    setCleansingFeedback({ state: "loading" });
    try {
      const response = await fetch("/api/ingestion/payload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload: uploadedJsonPayload }),
      });
      const payload = await response.json();
      const body =
        typeof payload.body === "object" && payload.body !== null
          ? (payload.body as Record<string, unknown>)
          : null;
      setCleansingFeedback({
        state: response.ok ? "success" : "error",
        message: response.ok
          ? "Sent to cleansing pipeline."
          : (payload?.error as string) ?? "Backend rejected the request.",
      });
      if (response.ok) {
        setCleansingJob({
          id: (body?.cleansedDataStoreId as string | undefined) ?? undefined,
          status: (body?.status as string | undefined) ?? "CLEANSED_PENDING_ENRICHMENT",
          message:
            typeof payload.rawBody === "string"
              ? payload.rawBody
              : typeof payload.body === "string"
                ? (payload.body as string)
                : undefined,
        });
        setCurrentStage("cleansing");
      }
    } catch (error) {
      setCleansingFeedback({
        state: "error",
        message:
          error instanceof Error ? error.message : "Failed to reach Spring Boot API.",
      });
      setCleansingJob({
        message:
          error instanceof Error ? error.message : "Failed to reach Spring Boot API.",
      });
    }
  };

  const refreshCleansingStatus = async () => {
    if (!cleansingJob?.id) return;
    setCleansingJob((previous) =>
      previous ? { ...previous, checking: true } : previous,
    );
    try {
      const response = await fetch(
        `/api/ingestion/status?id=${encodeURIComponent(cleansingJob.id)}`,
      );
      const payload = await response.json();
      const statusValue =
        typeof payload.status === "string"
          ? payload.status
          : typeof payload.body === "string"
            ? payload.body
            : undefined;
      setCleansingJob((previous) =>
        previous
          ? {
              ...previous,
              status: statusValue ?? previous.status,
              lastChecked: new Date().toLocaleString(),
              checking: false,
            }
          : previous,
      );
    } catch (error) {
      setCleansingJob((previous) =>
        previous
          ? {
              ...previous,
              message:
                error instanceof Error ? error.message : "Unable to refresh status.",
              checking: false,
            }
          : previous,
      );
    }
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

    const counter = { value: 0 };
    const children = buildTreeFromJson(parsed, [], counter);
    const rootNode: TreeNode = {
      id: "API Payload",
      label: "API Payload",
      path: "API Payload",
      type: "object",
      children,
    };
    setTreeNodes([rootNode]);
    setExpandedNodes(new Set([rootNode.id]));
    setUploadedJsonPayload(parsed);
    setActiveFileName("API Payload");
    const payloadString = JSON.stringify(parsed);
    setFileMetadata(
      buildMetadataFromPayload("API Payload", toByteLength(payloadString), "API Endpoint"),
    );
    setActiveNodePath(rootNode.id);
    setCurrentStage("ingestion");

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
    const isActive = (activeNodePath ?? treeNodes[0]?.id) === node.id;
      const matchesSearch =
        searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
      const badge =
        node.type === "object"
          ? { label: "OBJ", className: "bg-slate-100 text-slate-600" }
          : node.type === "array"
            ? { label: "ARR", className: "bg-indigo-100 text-indigo-600" }
            : { label: "VAL", className: "bg-emerald-100 text-emerald-700" };

      return (
        <div key={node.id} className="space-y-2">
          <div
            className={clsx(
              "flex items-center gap-2 rounded-lg px-2 py-1.5",
              matchesSearch ? "bg-indigo-50" : "bg-transparent",
              isActive && "ring-1 ring-indigo-200 bg-indigo-50/60",
            )}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleNode(node.id)}
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
            <button
              type="button"
              onClick={() => setActiveNodePath(node.id)}
              className="flex flex-1 items-center gap-2 text-left"
            >
              <span
                className={clsx(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  badge.className,
                )}
              >
                {badge.label}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900">{node.label}</span>
                <span className="text-xs text-slate-500">{node.path}</span>
              </div>
            </button>
          </div>
          {hasChildren && expanded && (
            <div className="border-l border-slate-100 pl-4">
              {renderTree(node.children!)}
            </div>
          )}
        </div>
      );
    });

const FileMetadataCard = ({ metadata }: { metadata: FileMetadata | null }) => {
  if (!metadata) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600">
      <p className="text-xs uppercase tracking-wide text-slate-400">File metadata</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-slate-400">Name</p>
          <p className="font-semibold text-slate-900">{metadata.name}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Size</p>
          <p className="font-semibold text-slate-900">{metadata.sizeLabel}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Source</p>
          <p className="font-semibold text-slate-900">{metadata.source}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Type</p>
          <p className="font-semibold text-slate-900">{metadata.type}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Uploaded {metadata.uploadedAt}</p>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-slate-50">
      <input
        id="file-upload"
        ref={fileInputRef}
        type="file"
        className="sr-only"
        multiple
        accept=".json,.pdf,.doc,.docx,.xls,.xlsx,application/json"
        onChange={(event) => handleFileSelection(event.target.files)}
      />
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
            {stageOrder.map((label, index) => {
              const status = getStepStatus(label, currentStage);
              return (
                <div key={label} className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-full px-3 py-1",
                      status === "current"
                        ? "bg-indigo-50 text-indigo-600"
                        : status === "completed"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-50",
                    )}
                  >
                    {status === "completed" && (
                      <CheckCircleIcon className="size-4 text-emerald-500" />
                    )}
                    {label}
                  </span>
                  {index < stageOrder.length - 1 && (
                    <span className="text-slate-300">—</span>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </header>

      <main
        className={clsx(
          "mx-auto max-w-6xl px-6 py-8",
          isExtractionView
            ? "space-y-6"
            : "grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]",
        )}
      >
        {currentStage === "ingestion" ? (
          <>
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
                      Accepts s3://bucket/key or classpath:relative/path references that the
                      Spring Boot service can access.
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
                            <span className={clsx("size-2 rounded-full", status.dot)} />
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
                            <span className="font-semibold text-slate-700">Cleansed ID:</span>
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
                  <h3 className="text-lg font-semibold text-slate-900">Upload History</h3>
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
                              {new Date(upload.createdAt).toLocaleString()} • {upload.source}
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
                            <span className={clsx("size-2 rounded-full", status.dot)} />
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
                    Field Inventory
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    JSON Structure
                  </h3>
                </div>
                <span className="text-sm font-semibold text-slate-600">
                  {allLeafNodes.length} fields
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                <InboxStackIcon className="size-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">
                  {activeFileName}
                </span>
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
                      Upload a JSON file to view its structure.
                    </div>
                  ) : (
                    <div className="space-y-3">{renderTree(filteredTree)}</div>
                  )}
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Preview:</span>
                  {allLeafNodes.slice(0, 6).map((leaf) => (
                    <span
                      key={leaf.id}
                      className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm"
                    >
                      {leaf.label}
                    </span>
                  ))}
                  {allLeafNodes.length > 6 && (
                    <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">
                      +{allLeafNodes.length - 6} more
                    </span>
                  )}
                  {allLeafNodes.length === 0 && (
                    <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-500 shadow-sm">
                      Upload a JSON to view fields
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleEnterExtraction}
                  disabled={!canExtract}
                  className={clsx(
                    "mt-4 w-full rounded-full py-2.5 text-sm font-semibold text-white transition",
                    canExtract
                      ? "bg-slate-900 hover:bg-black"
                      : "cursor-not-allowed bg-slate-400",
                  )}
                >
                  Extract Data
                </button>
              </div>
            </section>
          </>
        ) : isCleansingView ? (
          <section className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Cleansing
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                      Spring Boot job in progress
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      We triggered cleanse-and-store on the selected payload. Track the
                      backend status below.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                    <ExtractionStatusIcon className="size-3.5 animate-spin" />
                    Awaiting completion
                  </span>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Cleansed ID
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {cleansingJob?.id ?? "Pending"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {cleansingJob?.status ?? "Processing"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Last checked
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {cleansingJob?.lastChecked ?? "—"}
                    </p>
                  </div>
                </div>
                {cleansingJob?.message && (
                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                    {cleansingJob.message}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={refreshCleansingStatus}
                    disabled={!cleansingJob?.id || cleansingJob.checking}
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition",
                      !cleansingJob?.id
                        ? "cursor-not-allowed opacity-60"
                        : "hover:border-indigo-200 hover:text-indigo-600",
                    )}
                  >
                    {cleansingJob?.checking ? (
                      <>
                        <ArrowPathIcon className="size-4 animate-spin" />
                        Checking status…
                      </>
                    ) : (
                      <>
                        <MagnifyingGlassIcon className="size-4" />
                        Refresh status
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStage("ingestion");
                      setCleansingJob(null);
                      setCleansingFeedback({ state: "idle" });
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-black"
                  >
                    Back to uploads
                  </button>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Cleansing checklist
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">
                  Rules applied to the payload
                </h3>
                <div className="mt-4 space-y-3">
                  {cleansingRules.map((rule) => (
                    <div
                      key={rule.title}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <CheckCircleIcon className="size-5 text-emerald-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {rule.title}
                        </p>
                        <p className="text-xs text-slate-500">{rule.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify_between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Data Overview
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">
                    Original content snapshot
                  </h3>
                </div>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                  Read-only
                </span>
              </div>
              <div className="mt-6 rounded-2xl border border-slate-100">
                <div className="grid grid-cols-[220px_minmax(0,1fr)] bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <div className="px-4 py-3">Field</div>
                  <div className="px-4 py-3">Original Value</div>
                </div>
                <div className="max-h-[420px] overflow-y-auto">
                  {extractionRows.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">
                      Upload a JSON file to preview its fields.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {extractionRows.map((row) => (
                        <div
                          key={row.path}
                          className="grid grid-cols-[220px_minmax(0,1fr)]"
                        >
                          <div className="bg-slate-50/40 px-4 py-3">
                            <p className="text-sm font-semibold text-slate-900">
                              {row.field}
                            </p>
                            <p className="text-xs text-slate-500">{row.path}</p>
                          </div>
                          <div className="px-4 py-3">
                            <p className="text-sm text-slate-700">{row.originalValue}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <FileMetadataCard metadata={fileMetadata} />
          </section>
        ) : (
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Active File
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">
                    {activeFileName}
                  </h2>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ArrowUpTrayIcon className="size-4" />
                  Replace file
                </button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      File Structure
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">
                      JSON Fields
                    </h2>
                  </div>
                  <span
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                      extractionStatusPill.className,
                    )}
                  >
                    <ExtractionStatusIcon
                      className={clsx("size-3.5", extractionStatusPill.iconClassName)}
                    />
                    {extractionStatusPill.label}
                  </span>
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
                </div>
                <div className="mt-4 h-[520px] overflow-y-auto pr-2">
                  {filteredTree.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                      Upload a JSON file to view its structure.
                    </div>
                  ) : (
                    <div className="space-y-3">{renderTree(filteredTree)}</div>
                  )}
                </div>
                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
                  Click any field to preview its raw value on the right. Selecting a
                  parent node previews the entire branch.
                </div>
                {/* <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                  Version history (temporarily disabled)
                </div> */}
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Data Preview
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">
                      Data Overview
                    </h2>
                  </div>
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                    Structured
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>
                    Showing{" "}
                    {previewSourceNode?.id === rootNodeId ? "entire JSON" : "selection"}:
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
                    {previewSourceNode?.path ?? "—"}
                  </span>
                  {rootNodeId && previewSourceNode?.id !== rootNodeId && (
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                      onClick={() => setActiveNodePath(rootNodeId)}
                    >
                      Show entire JSON
                    </button>
                  )}
                </div>
                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-2 text-sm">
                    <p className="font-semibold text-slate-900">Actions</p>
                    <FeedbackPill feedback={cleansingFeedback} />
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleBackToSelection}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                    >
                      Back to Selection
                    </button>
                    <button
                      type="button"
                      onClick={sendToCleansing}
                      className={clsx(
                        "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition",
                        uploadedJsonPayload
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "cursor-not-allowed bg-slate-400",
                      )}
                      disabled={!uploadedJsonPayload || cleansingFeedback.state === "loading"}
                    >
                      {cleansingFeedback.state === "loading"
                        ? "Sending..."
                        : "Send to Cleansing"}
                    </button>
                  </div>
                </div>
                <div className="mt-6 rounded-2xl border border-slate-100">
                  <div className="grid grid-cols-[220px_minmax(0,1fr)] bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <div className="px-4 py-3">Field</div>
                    <div className="px-4 py-3">Original Value</div>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto">
                    {extractionRows.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">
                        Upload a JSON file and choose a field to preview its value.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {extractionRows.map((row) => (
                          <div
                            key={row.path}
                            className="grid grid-cols-[220px_minmax(0,1fr)]"
                          >
                            <div className="bg-slate-50/40 px-4 py-3">
                              <p className="text-sm font-semibold text-slate-900">
                                {row.field}
                              </p>
                              <p className="text-xs text-slate-500">{row.path}</p>
                            </div>
                            <div className="px-4 py-3">
                              <p className="text-sm text-slate-700">
                                {row.originalValue}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </section>
        )}
      </main>
    </div>
  );
}
