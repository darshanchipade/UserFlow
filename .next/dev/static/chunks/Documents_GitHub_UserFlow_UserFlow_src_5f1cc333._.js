(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Documents/GitHub/UserFlow/UserFlow/src/lib/extraction-context.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCleansedContext",
    ()=>clearCleansedContext,
    "clearEnrichmentContext",
    ()=>clearEnrichmentContext,
    "clearExtractionContext",
    ()=>clearExtractionContext,
    "loadCleansedContext",
    ()=>loadCleansedContext,
    "loadEnrichmentContext",
    ()=>loadEnrichmentContext,
    "loadExtractionContext",
    ()=>loadExtractionContext,
    "saveCleansedContext",
    ()=>saveCleansedContext,
    "saveEnrichmentContext",
    ()=>saveEnrichmentContext,
    "saveExtractionContext",
    ()=>saveExtractionContext
]);
const STORAGE_KEY = "extraction-context";
const CLEANSED_STORAGE_KEY = "cleansed-context";
const ENRICHMENT_STORAGE_KEY = "enrichment-context";
const MAX_CLEANSED_ITEMS = 150;
const MAX_CLEANSED_RAW_BODY_CHARS = 200_000;
const isQuotaExceededError = (error)=>{
    if (typeof DOMException === "undefined") return false;
    return error instanceof DOMException && (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED" || error.code === 22 || error.code === 1014);
};
const MAX_EXTRACTION_RAW_BODY_CHARS = 500_000;
const persistToSessionStorage = (key, payload)=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        sessionStorage.setItem(key, JSON.stringify(payload));
        return {
            ok: true
        };
    } catch (error) {
        if (isQuotaExceededError(error)) {
            console.warn(`Session storage quota exceeded while saving '${key}'.`);
            return {
                ok: false,
                reason: "quota"
            };
        }
        console.error(`Failed to persist '${key}' to sessionStorage`, error);
        return {
            ok: false,
            reason: "unknown"
        };
    }
};
const safeLoad = (serialized)=>{
    if (!serialized) return null;
    try {
        return JSON.parse(serialized);
    } catch (error) {
        console.error("Failed to parse session storage payload", error);
        return null;
    }
};
const sanitizeExtractionContext = (payload)=>{
    const next = {
        ...payload,
        backendPayload: undefined
    };
    if (typeof next.rawJson === "string" && next.rawJson.length > MAX_EXTRACTION_RAW_BODY_CHARS) {
        next.rawJson = next.rawJson.slice(0, MAX_EXTRACTION_RAW_BODY_CHARS);
    }
    return next;
};
const saveExtractionContext = (payload)=>{
    const sanitized = sanitizeExtractionContext(payload);
    return persistToSessionStorage(STORAGE_KEY, sanitized);
};
const loadExtractionContext = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return safeLoad(stored);
};
const clearExtractionContext = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    sessionStorage.removeItem(STORAGE_KEY);
};
const sanitizeCleansedPayload = (payload)=>{
    const next = {
        ...payload,
        items: Array.isArray(payload.items) ? [
            ...payload.items
        ] : []
    };
    if (next.items.length > MAX_CLEANSED_ITEMS) {
        next.items = next.items.slice(0, MAX_CLEANSED_ITEMS);
        next.itemsTruncated = true;
    }
    if (typeof next.rawBody === "string" && next.rawBody.length > MAX_CLEANSED_RAW_BODY_CHARS) {
        next.rawBody = next.rawBody.slice(0, MAX_CLEANSED_RAW_BODY_CHARS);
        next.rawBodyTruncated = true;
    }
    return next;
};
const saveCleansedContext = (payload)=>{
    const sanitized = sanitizeCleansedPayload(payload);
    const result = persistToSessionStorage(CLEANSED_STORAGE_KEY, sanitized);
    if (!result.ok && result.reason === "quota") {
        const fallbackPayload = {
            metadata: sanitized.metadata,
            status: sanitized.status,
            items: [],
            fallbackReason: "quota"
        };
        const fallbackResult = persistToSessionStorage(CLEANSED_STORAGE_KEY, fallbackPayload);
        if (fallbackResult.ok) {
            return {
                ok: true,
                reason: "quota",
                usedFallback: true
            };
        }
        return fallbackResult;
    }
    return result;
};
const loadCleansedContext = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const stored = sessionStorage.getItem(CLEANSED_STORAGE_KEY);
    return safeLoad(stored);
};
const clearCleansedContext = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    sessionStorage.removeItem(CLEANSED_STORAGE_KEY);
};
const saveEnrichmentContext = (payload)=>{
    return persistToSessionStorage(ENRICHMENT_STORAGE_KEY, payload);
};
const loadEnrichmentContext = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const stored = sessionStorage.getItem(ENRICHMENT_STORAGE_KEY);
    return safeLoad(stored);
};
const clearEnrichmentContext = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    sessionStorage.removeItem(ENRICHMENT_STORAGE_KEY);
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Documents/GitHub/UserFlow/UserFlow/src/components/PipelineTracker.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PipelineTracker",
    ()=>PipelineTracker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
"use client";
;
;
const STEPS = [
    {
        id: "ingestion",
        label: "Ingestion"
    },
    {
        id: "extraction",
        label: "Extraction"
    },
    {
        id: "cleansing",
        label: "Cleansing"
    },
    {
        id: "enrichment",
        label: "Data Enrichment"
    },
    {
        id: "qa",
        label: "Content QA"
    }
];
function PipelineTracker({ current }) {
    const currentIndex = STEPS.findIndex((step)=>step.id === current);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "hidden flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 md:flex",
        children: STEPS.map((step, index)=>{
            const status = index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("rounded-full px-3 py-1 transition", status === "current" ? "bg-indigo-50 text-indigo-600" : status === "done" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"),
                        children: step.label
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/components/PipelineTracker.tsx",
                        lineNumber: 25,
                        columnNumber: 13
                    }, this),
                    index < STEPS.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-slate-300",
                        children: "—"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/components/PipelineTracker.tsx",
                        lineNumber: 37,
                        columnNumber: 42
                    }, this)
                ]
            }, step.id, true, {
                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/components/PipelineTracker.tsx",
                lineNumber: 24,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/components/PipelineTracker.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_c = PipelineTracker;
var _c;
__turbopack_context__.k.register(_c, "PipelineTracker");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Documents/GitHub/UserFlow/UserFlow/src/lib/source.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "describeSourceLabel",
    ()=>describeSourceLabel,
    "inferSourceType",
    ()=>inferSourceType,
    "pickString",
    ()=>pickString
]);
const pickString = (value)=>{
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
};
const inferSourceType = (explicitType, identifier, fallback)=>{
    const normalized = explicitType?.toLowerCase();
    if (normalized) {
        return normalized;
    }
    if (!identifier) {
        return fallback;
    }
    const token = identifier.toLowerCase();
    if (token.startsWith("file-upload") || token.startsWith("local:")) {
        return "file";
    }
    if (token.startsWith("api-payload") || token.includes("api")) {
        return "api";
    }
    if (token.startsWith("s3://") || token.includes("s3")) {
        return "s3";
    }
    if (token.startsWith("classpath:")) {
        return "classpath";
    }
    return fallback;
};
const describeSourceLabel = (type, fallback = "Unknown source")=>{
    if (!type) return fallback;
    const normalized = type.toLowerCase();
    if (normalized.includes("api")) return "API payload";
    if (normalized.includes("s3") || normalized.includes("cloud")) return "S3 / Cloud";
    if (normalized.includes("class")) return "Classpath resource";
    if (normalized.includes("local")) return "Local upload";
    if (normalized.includes("file")) return "File upload";
    return type;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EnrichmentPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$extraction$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/src/lib/extraction-context.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$components$2f$PipelineTracker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/src/components/PipelineTracker.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/src/lib/source.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const STATUS_LABELS = {
    ENRICHMENT_TRIGGERED: "Queued for enrichment",
    WAITING_FOR_RESULTS: "Awaiting AI output",
    ENRICHMENT_RUNNING: "Enrichment running",
    PARTIALLY_ENRICHED: "Partially enriched",
    ENRICHMENT_COMPLETE: "Enrichment complete",
    ENRICHED_COMPLETE: "Enrichment complete",
    ERROR: "Failed"
};
const STATUS_COLORS = {
    ENRICHMENT_TRIGGERED: {
        className: "text-indigo-700",
        dot: "bg-indigo-400",
        background: "bg-indigo-50"
    },
    WAITING_FOR_RESULTS: {
        className: "text-amber-700",
        dot: "bg-amber-400",
        background: "bg-amber-50"
    },
    ENRICHMENT_RUNNING: {
        className: "text-sky-700",
        dot: "bg-sky-400",
        background: "bg-sky-50"
    },
    ENRICHMENT_COMPLETE: {
        className: "text-emerald-700",
        dot: "bg-emerald-500",
        background: "bg-emerald-50"
    },
    PARTIALLY_ENRICHED: {
        className: "text-sky-700",
        dot: "bg-sky-400",
        background: "bg-sky-50"
    },
    ERROR: {
        className: "text-rose-700",
        dot: "bg-rose-400",
        background: "bg-rose-50"
    }
};
const STATUS_SEQUENCE = [
    "ENRICHMENT_TRIGGERED",
    "WAITING_FOR_RESULTS",
    "ENRICHMENT_RUNNING",
    "PARTIALLY_ENRICHED",
    "ENRICHMENT_COMPLETE"
];
const FALLBACK_HISTORY = [
    {
        status: "ENRICHMENT_TRIGGERED",
        timestamp: 0
    },
    {
        status: "WAITING_FOR_RESULTS",
        timestamp: 0
    }
];
const parseJson = async (response)=>{
    const rawBody = await response.text();
    const trimmed = rawBody.trim();
    let body = null;
    if (trimmed.length) {
        try {
            body = JSON.parse(trimmed);
        } catch  {
            body = null;
        }
    }
    const looksLikeHtml = trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html");
    const friendlyRaw = looksLikeHtml && response.status ? `${response.status} ${response.statusText || ""}`.trim() || "HTML response returned." : rawBody;
    return {
        body,
        rawBody: friendlyRaw
    };
};
const pickNumber = (value)=>{
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    return undefined;
};
const formatTimestamp = (value)=>{
    if (!value) {
        return "—";
    }
    return new Date(value).toLocaleString();
};
const toStringArray = (value)=>{
    if (!value) return [];
    if (Array.isArray(value)) {
        return value.map((entry)=>typeof entry === "string" ? entry.trim() : undefined).filter((entry)=>Boolean(entry && entry.length));
    }
    if (typeof value === "string" && value.trim().length) {
        return value.split(",").map((token)=>token.trim()).filter(Boolean);
    }
    return [];
};
const normalizeProxyDetails = (payload)=>{
    if (!Array.isArray(payload)) return [];
    return payload.map((entry, index)=>{
        if (!entry || typeof entry !== "object") return null;
        const record = entry;
        const cleansedItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(record.cleansedItem) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(record.cleansedContent) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(record.item) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(record.field) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(record.label) ?? `Item ${index + 1}`;
        const summary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(record.summary) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(record.aiSummary) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(record.description) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(record.content);
        const tags = toStringArray(record.tags);
        const sentiments = toStringArray(record.sentiments);
        return {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(record.id) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(record.cleansedId) ?? `enrichment-${index}`,
            cleansedItem,
            summary: summary ?? undefined,
            tags,
            sentiments
        };
    }).filter((row)=>Boolean(row));
};
const buildSummaryFromDetails = (details)=>{
    if (!details.length) {
        return undefined;
    }
    return details.map((detail)=>{
        const summaryLine = detail.summary ?? "Awaiting summary.";
        const tagsLine = detail.tags.length ? `Tags: ${detail.tags.join(", ")}` : null;
        const sentimentsLine = detail.sentiments.length ? `Sentiments: ${detail.sentiments.join(", ")}` : null;
        return [
            `${detail.cleansedItem}: ${summaryLine}`,
            tagsLine,
            sentimentsLine
        ].filter(Boolean).join("\n");
    }).join("\n\n");
};
const normalizePipelineStatus = (value)=>{
    if (!value || typeof value !== "string") return undefined;
    const normalized = value.trim().replace(/[\s-]+/g, "_").toUpperCase();
    if (normalized === "ENRICHED_COMPLETE") {
        return "ENRICHMENT_COMPLETE";
    }
    return normalized;
};
const buildHistoryForStatus = (status, baseTimestamp)=>{
    const normalized = normalizePipelineStatus(status);
    if (!normalized) return null;
    const index = STATUS_SEQUENCE.indexOf(normalized);
    const steps = index >= 0 ? STATUS_SEQUENCE.slice(0, index + 1) : [
        normalized
    ];
    return steps.map((step, idx)=>({
            status: step,
            timestamp: baseTimestamp + idx
        }));
};
const extractHistoryFromRecord = (payload, defaultTimestamp)=>{
    if (!payload || typeof payload !== "object") {
        if (typeof payload === "string") {
            return buildHistoryForStatus(payload, defaultTimestamp);
        }
        return null;
    }
    const record = payload;
    const directHistory = record.statusHistory;
    if (Array.isArray(directHistory)) {
        return directHistory.filter((entry)=>{
            return !!entry && typeof entry === "object" && typeof entry.status === "string" && typeof entry.timestamp === "number";
        });
    }
    const nested = record.body;
    if (nested && typeof nested === "object") {
        const nestedHistory = nested.statusHistory;
        if (Array.isArray(nestedHistory)) {
            return nestedHistory.filter((entry)=>{
                return !!entry && typeof entry === "object" && typeof entry.status === "string" && typeof entry.timestamp === "number";
            });
        }
    }
    const fallbackStatus = normalizePipelineStatus((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(record.status)) ?? normalizePipelineStatus((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(record.pipelineStatus)) ?? normalizePipelineStatus((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(record.state)) ?? normalizePipelineStatus((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(record.currentStatus)) ?? normalizePipelineStatus(typeof payload === "string" ? payload : undefined);
    if (fallbackStatus) {
        return buildHistoryForStatus(fallbackStatus, defaultTimestamp);
    }
    return null;
};
const buildDefaultMetadata = (id, fallback)=>{
    return fallback ?? {
        name: "Unknown dataset",
        size: 0,
        source: "Unknown source",
        uploadedAt: Date.now(),
        cleansedId: id
    };
};
const buildMetadataFromBackend = (backend, fallback, id)=>{
    if (!backend) return fallback;
    const metadataRecord = backend.metadata && typeof backend.metadata === "object" ? backend.metadata : null;
    const next = {
        ...fallback
    };
    if (metadataRecord) {
        next.name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(metadataRecord.name) ?? next.name;
        next.source = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(metadataRecord.source) ?? next.source;
        next.cleansedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(metadataRecord.cleansedId) ?? next.cleansedId;
        next.sourceIdentifier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(metadataRecord.sourceIdentifier) ?? next.sourceIdentifier;
        next.sourceType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(metadataRecord.sourceType) ?? next.sourceType;
        const uploadedCandidate = pickNumber(metadataRecord.uploadedAt);
        if (uploadedCandidate) {
            next.uploadedAt = uploadedCandidate;
        }
        const sizeCandidate = pickNumber(metadataRecord.size);
        if (sizeCandidate !== undefined) {
            next.size = sizeCandidate;
        }
    }
    const derivedIdentifier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(backend.sourceIdentifier) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(backend.sourceUri) ?? next.sourceIdentifier;
    const derivedType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["inferSourceType"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(backend.sourceType), derivedIdentifier ?? next.sourceIdentifier, next.sourceType) ?? next.sourceType;
    next.sourceIdentifier = derivedIdentifier ?? next.sourceIdentifier;
    next.sourceType = derivedType;
    next.source = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["describeSourceLabel"])(derivedType, next.source);
    next.cleansedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(backend.cleansedId) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(backend.cleansedDataStoreId) ?? next.cleansedId ?? id;
    return next;
};
const mapLocalContext = (local)=>{
    if (!local) return null;
    return {
        metadata: local.metadata,
        startedAt: local.startedAt,
        statusHistory: local.statusHistory
    };
};
const extractSummary = (body)=>{
    if (typeof body === "string") return body;
    if (body && typeof body === "object") {
        const source = body;
        const summaryKeys = [
            "summary",
            "aiSummary",
            "insights",
            "result",
            "text",
            "content"
        ];
        for (const key of summaryKeys){
            const candidate = source[key];
            if (typeof candidate === "string" && candidate.trim()) {
                return candidate;
            }
        }
        return JSON.stringify(source, null, 2);
    }
    return "Awaiting enrichment results.";
};
function EnrichmentPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const queryId = searchParams.get("id");
    const localSnapshot = mapLocalContext((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$extraction$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadEnrichmentContext"])());
    const [context, setContext] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(localSnapshot);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(!localSnapshot);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [statusFeedback, setStatusFeedback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        state: "idle"
    });
    const [summaryFeedback, setSummaryFeedback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        state: "idle"
    });
    const [summary, setSummary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [enrichmentDetails, setEnrichmentDetails] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activeId, setActiveId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(queryId ?? localSnapshot?.metadata.cleansedId ?? null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EnrichmentPage.useEffect": ()=>{
            const fallbackId = localSnapshot?.metadata.cleansedId ?? null;
            setActiveId(queryId ?? fallbackId);
        }
    }["EnrichmentPage.useEffect"], [
        queryId,
        localSnapshot?.metadata.cleansedId
    ]);
    const fetchRemoteStatus = async (id)=>{
        const response = await fetch(`/api/ingestion/enrichment/status?id=${encodeURIComponent(id)}`);
        const { body, rawBody } = await parseJson(response);
        const proxyPayload = body ?? {};
        const upstreamOk = typeof proxyPayload.upstreamOk === "boolean" ? proxyPayload.upstreamOk : response.ok;
        if (!upstreamOk) {
            const fallbackMetadata = buildDefaultMetadata(id, localSnapshot?.metadata ?? undefined);
            const fallbackHistory = localSnapshot?.statusHistory && localSnapshot.statusHistory.length ? localSnapshot.statusHistory : FALLBACK_HISTORY;
            return {
                metadata: fallbackMetadata,
                startedAt: localSnapshot?.startedAt ?? Date.now(),
                statusHistory: fallbackHistory
            };
        }
        if (!response.ok) {
            throw new Error(body?.error ?? rawBody ?? "Backend rejected the enrichment status request.");
        }
        const backendPayload = "body" in proxyPayload ? proxyPayload.body : proxyPayload;
        const backendRecord = backendPayload && typeof backendPayload === "object" ? backendPayload : null;
        const fallbackMetadata = buildDefaultMetadata(id, localSnapshot?.metadata ?? undefined);
        const mergedMetadata = buildMetadataFromBackend(backendRecord, fallbackMetadata, id);
        const now = Date.now();
        let history = null;
        if (Array.isArray(backendRecord?.["statusHistory"])) {
            history = backendRecord?.["statusHistory"];
        } else {
            history = extractHistoryFromRecord(backendPayload, now) ?? extractHistoryFromRecord(proxyPayload, now);
        }
        const inferredHistory = history && history.length ? history : (()=>{
            const fallbackStatus = normalizePipelineStatus((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(backendRecord?.status ?? backendRecord?.pipelineStatus ?? backendRecord?.state ?? backendRecord?.currentStatus)) ?? normalizePipelineStatus((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(proxyPayload.status)) ?? normalizePipelineStatus((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(proxyPayload.pipelineStatus)) ?? normalizePipelineStatus((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(proxyPayload.state)) ?? normalizePipelineStatus((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(proxyPayload.currentStatus)) ?? normalizePipelineStatus(typeof backendPayload === "string" ? backendPayload : undefined);
            if (!fallbackStatus) {
                return null;
            }
            return buildHistoryForStatus(fallbackStatus, now);
        })();
        return {
            metadata: mergedMetadata,
            startedAt: pickNumber(backendRecord?.startedAt) ?? pickNumber(proxyPayload.startedAt) ?? Date.now(),
            statusHistory: inferredHistory && inferredHistory.length ? inferredHistory : FALLBACK_HISTORY
        };
    };
    const loadContext = async (id, options = {})=>{
        const { showSpinner = true, rethrowOnError = false } = options;
        if (!id) {
            setLoading(false);
            setError("Provide a cleansed ID via the URL or trigger a new run.");
            setContext(localSnapshot);
            return null;
        }
        if (showSpinner) {
            setLoading(true);
        }
        setError(null);
        try {
            const remote = await fetchRemoteStatus(id);
            setContext(remote);
            return remote;
        } catch (statusError) {
            setError(statusError instanceof Error ? statusError.message : "Unable to load enrichment status.");
            if (!showSpinner && localSnapshot) {
                setContext(localSnapshot);
            } else if (!localSnapshot) {
                setContext(null);
            }
            if (rethrowOnError) {
                throw statusError;
            }
            return null;
        } finally{
            if (showSpinner) {
                setLoading(false);
            }
        }
    };
    const fetchSummary = async (id, showLoading = true)=>{
        if (showLoading) {
            setSummaryFeedback({
                state: "loading"
            });
        }
        try {
            const response = await fetch(`/api/ingestion/enrichment/result?id=${encodeURIComponent(id)}`);
            const { body, rawBody } = await parseJson(response);
            if (!response.ok) {
                if (response.status === 404) {
                    setSummary(null);
                    setEnrichmentDetails([]);
                    setSummaryFeedback({
                        state: "idle"
                    });
                    return;
                }
                throw new Error(body?.error ?? rawBody ?? "Backend rejected the enrichment result request.");
            }
            const proxyPayload = body ?? {};
            const normalizedDetails = normalizeProxyDetails(proxyPayload.details);
            setEnrichmentDetails(normalizedDetails);
            const combinedDetailSummary = buildSummaryFromDetails(normalizedDetails);
            const summarySource = typeof proxyPayload.summary === "string" && proxyPayload.summary.trim().length ? proxyPayload.summary : combinedDetailSummary ?? proxyPayload.body ?? proxyPayload.rawBody ?? rawBody ?? "Awaiting enrichment results.";
            const derivedSummary = typeof summarySource === "string" ? summarySource : extractSummary(summarySource);
            setSummary(derivedSummary ?? combinedDetailSummary ?? null);
            setSummaryFeedback({
                state: "idle"
            });
        } catch (summaryError) {
            setSummaryFeedback({
                state: "error",
                message: summaryError instanceof Error ? summaryError.message : "Unable to load enrichment results."
            });
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EnrichmentPage.useEffect": ()=>{
            loadContext(activeId).catch({
                "EnrichmentPage.useEffect": ()=>undefined
            }["EnrichmentPage.useEffect"]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["EnrichmentPage.useEffect"], [
        activeId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EnrichmentPage.useEffect": ()=>{
            if (context?.metadata.cleansedId) {
                fetchSummary(context.metadata.cleansedId, true);
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["EnrichmentPage.useEffect"], [
        context?.metadata.cleansedId
    ]);
    const statusHistory = context?.statusHistory?.length ? context.statusHistory : FALLBACK_HISTORY;
    const currentStatus = statusHistory[statusHistory.length - 1]?.status ?? "WAITING_FOR_RESULTS";
    const statusMeta = STATUS_COLORS[currentStatus] ?? {
        className: "text-slate-700",
        dot: "bg-slate-300",
        background: "bg-slate-100"
    };
    const progress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "EnrichmentPage.useMemo[progress]": ()=>{
            const statuses = [
                "ENRICHMENT_TRIGGERED",
                "WAITING_FOR_RESULTS",
                "ENRICHMENT_RUNNING",
                "PARTIALLY_ENRICHED",
                "ENRICHMENT_COMPLETE"
            ];
            const index = statuses.findIndex({
                "EnrichmentPage.useMemo[progress].index": (status)=>status === currentStatus
            }["EnrichmentPage.useMemo[progress].index"]);
            if (index >= 0) {
                return (index + 1) / statuses.length * 100;
            }
            const derivedIndex = Math.min(statusHistory.length, statuses.length);
            return derivedIndex / statuses.length * 100;
        }
    }["EnrichmentPage.useMemo[progress]"], [
        currentStatus,
        statusHistory.length
    ]);
    const handleRefreshStatus = async ()=>{
        if (!activeId) {
            setStatusFeedback({
                state: "error",
                message: "Cleansed ID missing; re-run cleansing before enrichment."
            });
            return;
        }
        setStatusFeedback({
            state: "loading"
        });
        try {
            await loadContext(activeId, {
                showSpinner: false,
                rethrowOnError: true
            });
            setStatusFeedback({
                state: "success",
                message: "Status refreshed."
            });
            await fetchSummary(activeId, false);
        } catch (refreshError) {
            setStatusFeedback({
                state: "error",
                message: refreshError instanceof Error ? refreshError.message : "Unable to refresh status."
            });
        }
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen items-center justify-center bg-slate-50 px-6 py-20",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs uppercase tracking-wide text-slate-400",
                        children: "Enrichment"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 601,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "mt-2 text-2xl font-semibold text-slate-900",
                        children: "Loading status…"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 602,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-4 text-sm text-slate-500",
                        children: "Fetching enrichment details from the backend. One moment please."
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 603,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                lineNumber: 600,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
            lineNumber: 599,
            columnNumber: 7
        }, this);
    }
    if (!context) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen items-center justify-center bg-slate-50 px-6 py-20",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs uppercase tracking-wide text-slate-400",
                        children: "Enrichment"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 615,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "mt-2 text-2xl font-semibold text-slate-900",
                        children: error ?? "Enrichment data not found"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 616,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-4 text-sm text-slate-500",
                        children: "Trigger enrichment from the cleansing screen to review progress here."
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 619,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>router.push("/cleansing"),
                        className: "mt-6 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white",
                        children: "Back to Cleansing"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 622,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                lineNumber: 614,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
            lineNumber: 613,
            columnNumber: 7
        }, this);
    }
    const sourceLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["describeSourceLabel"])(context.metadata.sourceType ?? context.metadata.source, context.metadata.source);
    const sourceIdentifier = context.metadata.sourceIdentifier ?? "—";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-slate-50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "border-b border-slate-200 bg-white",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs uppercase tracking-wide text-slate-400",
                                    children: "Enrichment"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 645,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-xl font-semibold text-slate-900",
                                    children: [
                                        "Monitor enrichment for ",
                                        context.metadata.name
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 646,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                            lineNumber: 644,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-1 flex-col items-start gap-3 md:flex-row md:items-center md:justify-end",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$components$2f$PipelineTracker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PipelineTracker"], {
                                    current: "enrichment"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 651,
                                    columnNumber: 13
                                }, this),
                                statusFeedback.state !== "idle" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusFeedback.state === "loading" ? "bg-indigo-50 text-indigo-600" : statusFeedback.state === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`,
                                    children: statusFeedback.message ?? (statusFeedback.state === "loading" ? "Refreshing status…" : statusFeedback.state === "success" ? "Status updated." : "Unable to refresh status.")
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 653,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                            lineNumber: 650,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                    lineNumber: 643,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                lineNumber: 642,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Current status"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 678,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusMeta.background} ${statusMeta.className}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `h-2 w-2 rounded-full ${statusMeta.dot}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                        lineNumber: 680,
                                                        columnNumber: 17
                                                    }, this),
                                                    STATUS_LABELS[currentStatus] ?? currentStatus
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 679,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 677,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-full max-w-md",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Pipeline progress"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 685,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-2 h-2 rounded-full bg-slate-100",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-full rounded-full bg-indigo-500 transition-all",
                                                    style: {
                                                        width: `${progress}%`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                    lineNumber: 689,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 688,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 text-xs text-slate-500",
                                                children: [
                                                    Math.round(progress),
                                                    "% complete"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 694,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 684,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleRefreshStatus,
                                        className: "rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700",
                                        children: "Refresh Status"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 696,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                lineNumber: 676,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Cleansed ID"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 706,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-slate-900",
                                                children: context.metadata.cleansedId ?? "—"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 707,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 705,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Source"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 712,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-slate-900",
                                                children: sourceLabel
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 713,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 711,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Source identifier"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 716,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-slate-900 break-all",
                                                children: sourceIdentifier
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 719,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 715,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Started at"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 722,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-slate-900",
                                                children: formatTimestamp(context.startedAt)
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 723,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 721,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Last update"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 728,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-slate-900",
                                                children: formatTimestamp(statusHistory[statusHistory.length - 1]?.timestamp ?? context.startedAt)
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 729,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 727,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                lineNumber: 704,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 675,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs uppercase tracking-wide text-slate-400",
                                children: "Status timeline"
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                lineNumber: 739,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg font-semibold text-slate-900",
                                children: "Pipeline events"
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                lineNumber: 740,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 space-y-4 border-l border-slate-200 pl-6",
                                children: statusHistory.map((entry)=>{
                                    const meta = STATUS_COLORS[entry.status] ?? {
                                        className: "text-slate-700",
                                        dot: "bg-slate-300"
                                    };
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `absolute -left-[33px] mt-1 inline-flex h-3 w-3 rounded-full ${meta.dot}`
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 749,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: `text-sm font-semibold ${meta.className}`,
                                                children: STATUS_LABELS[entry.status] ?? entry.status
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 752,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-slate-500",
                                                children: formatTimestamp(entry.timestamp)
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 755,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, `${entry.status}-${entry.timestamp}`, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 748,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                lineNumber: 741,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 738,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Insights"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 765,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-lg font-semibold text-slate-900",
                                                children: "AI summary preview"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 766,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 764,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-slate-500",
                                        children: "Read-only snapshot of the most recent enrichment output."
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 768,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                lineNumber: 763,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700",
                                children: summaryFeedback.state === "loading" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: "Loading enrichment summary…"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 774,
                                    columnNumber: 15
                                }, this) : summaryFeedback.state === "error" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-semibold text-amber-700",
                                            children: "Unable to load enrichment summary."
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                            lineNumber: 777,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-slate-600",
                                            children: summaryFeedback.message
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                            lineNumber: 778,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>context.metadata.cleansedId && fetchSummary(context.metadata.cleansedId, true),
                                            className: "mt-3 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white",
                                            children: "Retry"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                            lineNumber: 779,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 776,
                                    columnNumber: 15
                                }, this) : summary ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                    className: "whitespace-pre-wrap text-sm text-slate-800",
                                    children: summary
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 788,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: "Awaiting enrichment results. Once the backend finishes generating AI insights, they’ll appear here automatically. Use the “Refresh status” button above to check for updates."
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 790,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                lineNumber: 772,
                                columnNumber: 11
                            }, this),
                            enrichmentDetails.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 max-h-[420px] space-y-4 overflow-y-auto pr-1",
                                children: enrichmentDetails.map((detail)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-2xl border border-slate-100 bg-white p-4 shadow-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm font-semibold text-slate-900",
                                                                children: detail.cleansedItem
                                                            }, void 0, false, {
                                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                                lineNumber: 806,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-slate-500",
                                                                children: "AI-derived insight"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                                lineNumber: 807,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                        lineNumber: 805,
                                                        columnNumber: 21
                                                    }, this),
                                                    detail.tags.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-wrap gap-1",
                                                        children: detail.tags.map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700",
                                                                children: tag
                                                            }, `${detail.id}-header-tag-${tag}`, false, {
                                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                                lineNumber: 812,
                                                                columnNumber: 27
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                        lineNumber: 810,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 804,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-800",
                                                children: detail.summary ?? "Summary pending from enrichment pipeline."
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 822,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-3 flex flex-wrap gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs font-semibold uppercase tracking-wide text-slate-400",
                                                                children: "Tags"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                                lineNumber: 827,
                                                                columnNumber: 23
                                                            }, this),
                                                            detail.tags.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex flex-wrap gap-1",
                                                                children: detail.tags.map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700",
                                                                        children: tag
                                                                    }, `${detail.id}-tag-${tag}`, false, {
                                                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                                        lineNumber: 833,
                                                                        columnNumber: 29
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                                lineNumber: 831,
                                                                columnNumber: 25
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-slate-400",
                                                                children: "—"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                                lineNumber: 842,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                        lineNumber: 826,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs font-semibold uppercase tracking-wide text-slate-400",
                                                                children: "Sentiments"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                                lineNumber: 846,
                                                                columnNumber: 23
                                                            }, this),
                                                            detail.sentiments.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex flex-wrap gap-1",
                                                                children: detail.sentiments.map((sentiment)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700",
                                                                        children: sentiment
                                                                    }, `${detail.id}-sentiment-${sentiment}`, false, {
                                                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                                        lineNumber: 852,
                                                                        columnNumber: 29
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                                lineNumber: 850,
                                                                columnNumber: 25
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-slate-400",
                                                                children: "—"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                                lineNumber: 861,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                        lineNumber: 845,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 825,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, detail.id, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 800,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                lineNumber: 798,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 762,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs uppercase tracking-wide text-slate-400",
                                            children: "Next steps"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                            lineNumber: 874,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-lg font-semibold text-slate-900",
                                            children: "Wrap up or keep monitoring"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                            lineNumber: 875,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 873,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>router.push("/cleansing"),
                                            className: "rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700",
                                            children: "Back to Cleansing"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                            lineNumber: 880,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: handleRefreshStatus,
                                            className: "rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700",
                                            children: "Refresh Status"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                            lineNumber: 887,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>{
                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$extraction$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearEnrichmentContext"])();
                                                router.push("/ingestion");
                                            },
                                            className: "rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white",
                                            children: "Finish Session"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                            lineNumber: 894,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 879,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                            lineNumber: 872,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 871,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                lineNumber: 674,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
        lineNumber: 641,
        columnNumber: 5
    }, this);
}
_s(EnrichmentPage, "JLeC82NyeRBZ0sBDxzAV69ii8TM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = EnrichmentPage;
var _c;
__turbopack_context__.k.register(_c, "EnrichmentPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Documents_GitHub_UserFlow_UserFlow_src_5f1cc333._.js.map