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
const FALLBACK_HISTORY = [
    {
        status: "ENRICHMENT_TRIGGERED",
        timestamp: Date.now()
    },
    {
        status: "WAITING_FOR_RESULTS",
        timestamp: Date.now()
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
        if (!response.ok) {
            throw new Error(body?.error ?? rawBody ?? "Backend rejected the enrichment status request.");
        }
        const proxyPayload = body ?? {};
        let backendRecord = null;
        if (proxyPayload.body && typeof proxyPayload.body === "object") {
            backendRecord = proxyPayload.body;
        } else if (!("body" in proxyPayload) && typeof proxyPayload === "object") {
            backendRecord = proxyPayload;
        }
        const fallbackMetadata = buildDefaultMetadata(id, localSnapshot?.metadata ?? undefined);
        const mergedMetadata = buildMetadataFromBackend(backendRecord, fallbackMetadata, id);
        const backendHistory = Array.isArray(backendRecord?.["statusHistory"]) ? backendRecord?.["statusHistory"] : null;
        return {
            metadata: mergedMetadata,
            startedAt: pickNumber(backendRecord?.startedAt) ?? pickNumber(proxyPayload.startedAt) ?? Date.now(),
            statusHistory: backendHistory && backendHistory.length ? backendHistory : FALLBACK_HISTORY
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
                    setSummaryFeedback({
                        state: "idle"
                    });
                    return;
                }
                throw new Error(body?.error ?? rawBody ?? "Backend rejected the enrichment result request.");
            }
            const proxyPayload = body ?? {};
            const summarySource = proxyPayload.body ?? proxyPayload.rawBody ?? rawBody ?? "Awaiting enrichment results.";
            setSummary(extractSummary(summarySource));
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
                        lineNumber: 378,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "mt-2 text-2xl font-semibold text-slate-900",
                        children: "Loading status…"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 379,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-4 text-sm text-slate-500",
                        children: "Fetching enrichment details from the backend. One moment please."
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 380,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                lineNumber: 377,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
            lineNumber: 376,
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
                        lineNumber: 392,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "mt-2 text-2xl font-semibold text-slate-900",
                        children: error ?? "Enrichment data not found"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 393,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-4 text-sm text-slate-500",
                        children: "Trigger enrichment from the cleansing screen to review progress here."
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 396,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>router.push("/cleansing"),
                        className: "mt-6 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white",
                        children: "Back to Cleansing"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 399,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                lineNumber: 391,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
            lineNumber: 390,
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
                                    lineNumber: 422,
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
                                    lineNumber: 423,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                            lineNumber: 421,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-1 flex-col items-start gap-3 md:flex-row md:items-center md:justify-end",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$components$2f$PipelineTracker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PipelineTracker"], {
                                    current: "enrichment"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 428,
                                    columnNumber: 13
                                }, this),
                                statusFeedback.state !== "idle" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusFeedback.state === "loading" ? "bg-indigo-50 text-indigo-600" : statusFeedback.state === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`,
                                    children: statusFeedback.message ?? (statusFeedback.state === "loading" ? "Refreshing status…" : statusFeedback.state === "success" ? "Status updated." : "Unable to refresh status.")
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 430,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                            lineNumber: 427,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                    lineNumber: 420,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                lineNumber: 419,
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
                                                lineNumber: 455,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusMeta.background} ${statusMeta.className}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `h-2 w-2 rounded-full ${statusMeta.dot}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                        lineNumber: 457,
                                                        columnNumber: 17
                                                    }, this),
                                                    STATUS_LABELS[currentStatus] ?? currentStatus
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 456,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 454,
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
                                                lineNumber: 462,
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
                                                    lineNumber: 466,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 465,
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
                                                lineNumber: 471,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 461,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleRefreshStatus,
                                        className: "rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700",
                                        children: "Refresh Status"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 473,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                lineNumber: 453,
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
                                                lineNumber: 483,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-slate-900",
                                                children: context.metadata.cleansedId ?? "—"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 484,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 482,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Source"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 489,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-slate-900",
                                                children: sourceLabel
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 490,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 488,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Source identifier"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 493,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-slate-900 break-all",
                                                children: sourceIdentifier
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 496,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 492,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Started at"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 499,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-slate-900",
                                                children: new Date(context.startedAt).toLocaleString()
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 500,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 498,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Last update"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 505,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-slate-900",
                                                children: new Date(statusHistory[statusHistory.length - 1]?.timestamp ?? context.startedAt).toLocaleString()
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 506,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 504,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                lineNumber: 481,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 452,
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
                                lineNumber: 516,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg font-semibold text-slate-900",
                                children: "Pipeline events"
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                lineNumber: 517,
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
                                                lineNumber: 526,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: `text-sm font-semibold ${meta.className}`,
                                                children: STATUS_LABELS[entry.status] ?? entry.status
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 529,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-slate-500",
                                                children: new Date(entry.timestamp).toLocaleString()
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 532,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, `${entry.status}-${entry.timestamp}`, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 525,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                lineNumber: 518,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 515,
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
                                                lineNumber: 544,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-lg font-semibold text-slate-900",
                                                children: "AI summary preview"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                                lineNumber: 545,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 543,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-slate-500",
                                        children: "Read-only snapshot of the most recent enrichment output."
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                        lineNumber: 547,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                lineNumber: 542,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700",
                                children: summaryFeedback.state === "loading" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: "Loading enrichment summary…"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 553,
                                    columnNumber: 15
                                }, this) : summaryFeedback.state === "error" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-semibold text-amber-700",
                                            children: "Unable to load enrichment summary."
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                            lineNumber: 556,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-slate-600",
                                            children: summaryFeedback.message
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                            lineNumber: 557,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>context.metadata.cleansedId && fetchSummary(context.metadata.cleansedId, true),
                                            className: "mt-3 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white",
                                            children: "Retry"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                            lineNumber: 558,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 555,
                                    columnNumber: 15
                                }, this) : summary ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                    className: "whitespace-pre-wrap text-sm text-slate-800",
                                    children: summary
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 567,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: "Awaiting enrichment results. Once the backend finishes generating AI insights, they’ll appear here automatically. Use the “Refresh status” button above to check for updates."
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 569,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                lineNumber: 551,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 541,
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
                                            lineNumber: 581,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-lg font-semibold text-slate-900",
                                            children: "Wrap up or keep monitoring"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                            lineNumber: 582,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 580,
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
                                            lineNumber: 587,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: handleRefreshStatus,
                                            className: "rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700",
                                            children: "Refresh Status"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                            lineNumber: 594,
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
                                            lineNumber: 601,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                                    lineNumber: 586,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                            lineNumber: 579,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                        lineNumber: 578,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
                lineNumber: 451,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/enrichment/page.tsx",
        lineNumber: 418,
        columnNumber: 5
    }, this);
}
_s(EnrichmentPage, "1cFBuAC0lfgqtKR7ikIsD3SK2pg=", false, function() {
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
"[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
"[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/next/navigation.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)");
}),
"[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clsx",
    ()=>clsx,
    "default",
    ()=>__TURBOPACK__default__export__
]);
function r(e) {
    var t, f, n = "";
    if ("string" == typeof e || "number" == typeof e) n += e;
    else if ("object" == typeof e) if (Array.isArray(e)) {
        var o = e.length;
        for(t = 0; t < o; t++)e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
    } else for(f in e)e[f] && (n && (n += " "), n += f);
    return n;
}
function clsx() {
    for(var e, t, f = 0, n = "", o = arguments.length; f < o; f++)(e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
    return n;
}
const __TURBOPACK__default__export__ = clsx;
}),
]);

//# sourceMappingURL=Documents_GitHub_UserFlow_UserFlow_185981cd._.js.map