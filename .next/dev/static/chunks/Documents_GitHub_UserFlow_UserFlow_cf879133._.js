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
"[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CleansingPage
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
const RULES = [
    {
        title: "Whitespace normalization",
        description: "Collapses redundant spaces, tabs, and line breaks to a single space."
    },
    {
        title: "Markup removal",
        description: "Strips internal tokens (e.g. {%url%}, sosumi, wj markers) from copy blocks."
    },
    {
        title: "Locale-aware punctuation",
        description: "Replaces smart quotes, ellipsis, and em-dashes with locale-specific glyphs."
    },
    {
        title: "Sensitive token scrub",
        description: "Masks e-mail addresses, PII placeholders, and debugging metadata."
    }
];
const mapLocalContext = (local)=>{
    if (!local) return null;
    return {
        metadata: local.metadata,
        status: local.status,
        items: local.items,
        rawBody: local.rawBody,
        fallbackReason: local.fallbackReason
    };
};
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
const deriveItems = (items, rawBody)=>{
    if (Array.isArray(items) && items.length) {
        return items;
    }
    if (typeof rawBody === "string" && rawBody.trim()) {
        try {
            const parsed = JSON.parse(rawBody);
            if (Array.isArray(parsed)) return parsed;
            if (parsed && typeof parsed === "object") {
                const source = parsed;
                const candidateKeys = [
                    "items",
                    "records",
                    "data",
                    "payload",
                    "cleansedItems",
                    "originalItems",
                    "result",
                    "body"
                ];
                const pickArray = (record)=>{
                    for (const key of candidateKeys){
                        const candidate = record[key];
                        if (Array.isArray(candidate)) {
                            return candidate;
                        }
                        if (candidate && typeof candidate === "object") {
                            const nested = candidate;
                            if (Array.isArray(nested.items)) {
                                return nested.items;
                            }
                        }
                    }
                    return [];
                };
                const derived = pickArray(source);
                if (derived.length) {
                    return derived;
                }
            }
        } catch  {
        // ignore parse errors
        }
    }
    return [];
};
const getFirstValue = (payload, keys)=>{
    for (const key of keys){
        const value = payload[key];
        if (value !== undefined && value !== null && !(typeof value === "string" && value.trim().length === 0)) {
            return value;
        }
    }
    return undefined;
};
const formatValue = (value)=>{
    if (value === undefined) return "—";
    if (value === null) return "null";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return JSON.stringify(value, null, 2);
};
const isDisplayable = (value)=>{
    if (value === undefined || value === null) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "number" || typeof value === "boolean") return true;
    return false;
};
const pickValueFromPayload = (payload, preferredKeys, explicitKey)=>{
    const normalizedKey = explicitKey?.split(".").pop()?.replace(/\[[0-9]+\]/g, "")?.trim();
    const searchKeys = [
        normalizedKey,
        ...preferredKeys,
        ...FALLBACK_VALUE_KEYS
    ].filter((key)=>Boolean(key));
    const tryGet = (source)=>{
        for (const key of searchKeys){
            const candidate = source[key];
            if (isDisplayable(candidate) && !(typeof candidate === "string" && candidate.trim() === key.trim())) {
                return candidate;
            }
        }
        return undefined;
    };
    const direct = tryGet(payload);
    if (direct !== undefined) {
        return direct;
    }
    if (payload.context && typeof payload.context === "object") {
        return tryGet(payload.context);
    }
    return undefined;
};
const normalizeLabel = (rawLabel, fallback)=>{
    if (!rawLabel) return fallback;
    const withoutRef = rawLabel.split("::ref::").pop()?.trim() ?? rawLabel;
    const cleaned = withoutRef.replace(/\s+/g, " ").trim();
    const segments = cleaned.split(/[./]/).filter(Boolean);
    const candidate = segments[segments.length - 1] ?? cleaned;
    const withoutIndex = candidate.replace(/\[[0-9]+\]/g, "");
    return withoutIndex || fallback;
};
const VALUE_LABEL_KEYS = [
    "originalFieldName",
    "fieldName",
    "field",
    "label",
    "key",
    "name",
    "itemType"
];
const ORIGINAL_VALUE_KEYS = [
    "originalValue",
    "rawValue",
    "sourceValue",
    "before",
    "input",
    "valueBefore",
    "value",
    "copy",
    "text",
    "content"
];
const CLEANSED_VALUE_KEYS = [
    "cleansedValue",
    "cleanedValue",
    "normalizedValue",
    "after",
    "output",
    "valueAfter",
    "value",
    "cleansedCopy",
    "cleansedContent",
    "text"
];
const FALLBACK_VALUE_KEYS = [
    "copy",
    "text",
    "value",
    "content",
    "body",
    "stringValue"
];
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
        next.status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(metadataRecord.status) ?? next.status;
        next.sourceIdentifier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(metadataRecord.sourceIdentifier) ?? next.sourceIdentifier;
        next.sourceType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(metadataRecord.sourceType) ?? next.sourceType;
        const uploadedAtCandidate = pickNumber(metadataRecord.uploadedAt);
        if (uploadedAtCandidate) {
            next.uploadedAt = uploadedAtCandidate;
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
const FeedbackPill = ({ feedback })=>{
    if (feedback.state === "idle") return null;
    const base = feedback.state === "loading" ? "bg-indigo-50 text-indigo-600" : feedback.state === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${base}`,
        children: feedback.state === "loading" ? "Triggering enrichment…" : feedback.message ?? (feedback.state === "success" ? "Enrichment triggered." : "Something went wrong.")
    }, void 0, false, {
        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
        lineNumber: 326,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = FeedbackPill;
function CleansingPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const queryId = searchParams.get("id");
    const localSnapshot = mapLocalContext((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$extraction$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadCleansedContext"])());
    const [context, setContext] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(localSnapshot);
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(deriveItems(localSnapshot?.items, localSnapshot?.rawBody));
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(!localSnapshot);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [enrichmentFeedback, setEnrichmentFeedback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        state: "idle"
    });
    const [itemsLoading, setItemsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [itemsError, setItemsError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeId, setActiveId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [hydrated, setHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CleansingPage.useEffect": ()=>{
            setHydrated(true);
        }
    }["CleansingPage.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CleansingPage.useEffect": ()=>{
            const fallbackId = localSnapshot?.metadata.cleansedId ?? null;
            setActiveId(queryId ?? fallbackId);
        }
    }["CleansingPage.useEffect"], [
        queryId,
        localSnapshot?.metadata.cleansedId
    ]);
    const fetchItems = async (id, options = {})=>{
        const { showSpinner = true } = options;
        if (showSpinner) {
            setItemsLoading(true);
        }
        setItemsError(null);
        try {
            const response = await fetch(`/api/ingestion/cleansed-items?id=${encodeURIComponent(id)}`);
            const { body, rawBody } = await parseJson(response);
            if (!response.ok) {
                if (response.status === 404) {
                    setItems([]);
                    setItemsError("Cleansed rows are not available yet.");
                    return;
                }
                throw new Error(body?.error ?? rawBody ?? "Backend rejected the items request.");
            }
            const payloadRecord = body ?? {};
            const candidateKeys = [
                "items",
                "records",
                "data",
                "payload",
                "cleansedItems",
                "result",
                "body"
            ];
            const pickArrayFromRecord = (record)=>{
                for (const key of candidateKeys){
                    const candidate = record[key];
                    if (Array.isArray(candidate)) {
                        return candidate;
                    }
                    if (candidate && typeof candidate === "object" && Array.isArray(candidate.items)) {
                        return candidate.items;
                    }
                }
                return [];
            };
            let normalized = pickArrayFromRecord(payloadRecord);
            if (!normalized.length && typeof payloadRecord.body === "object" && payloadRecord.body) {
                normalized = pickArrayFromRecord(payloadRecord.body);
            }
            setItems(normalized);
            setContext((previous)=>previous ? {
                    ...previous,
                    items: normalized,
                    rawBody: typeof body?.rawBody === "string" ? body.rawBody : previous.rawBody
                } : previous);
        } catch (itemsErr) {
            setItemsError(itemsErr instanceof Error ? itemsErr.message : "Unable to fetch cleansed items.");
        } finally{
            if (showSpinner) {
                setItemsLoading(false);
            }
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CleansingPage.useEffect": ()=>{
            const fetchContext = {
                "CleansingPage.useEffect.fetchContext": async (id)=>{
                    if (!id) {
                        setLoading(false);
                        setError("Provide a cleansed ID via the URL or trigger a new run.");
                        setContext(localSnapshot);
                        setItems(deriveItems(localSnapshot?.items, localSnapshot?.rawBody));
                        return;
                    }
                    setLoading(true);
                    setError(null);
                    try {
                        const response = await fetch(`/api/ingestion/cleansed-context?id=${encodeURIComponent(id)}`);
                        const { body, rawBody } = await parseJson(response);
                        if (!response.ok) {
                            throw new Error(body?.error ?? rawBody ?? "Backend rejected the cleansed context request.");
                        }
                        const proxyPayload = body ?? {};
                        let backendRecord = null;
                        if (proxyPayload.body && typeof proxyPayload.body === "object") {
                            backendRecord = proxyPayload.body;
                        } else if (!("body" in proxyPayload) && typeof proxyPayload === "object") {
                            backendRecord = proxyPayload;
                        }
                        const fallbackMetadata = buildDefaultMetadata(id, localSnapshot?.metadata ?? undefined);
                        const remoteMetadata = buildMetadataFromBackend(backendRecord, fallbackMetadata, id);
                        const proxiedRawBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(proxyPayload.rawBody) ?? (typeof rawBody === "string" ? rawBody : undefined);
                        const remoteContext = {
                            metadata: remoteMetadata,
                            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(backendRecord?.status) ?? localSnapshot?.status,
                            items: Array.isArray(backendRecord?.items) ? backendRecord?.items : undefined,
                            rawBody: proxiedRawBody,
                            fallbackReason: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(proxyPayload.fallbackReason) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickString"])(backendRecord?.fallbackReason) ?? localSnapshot?.fallbackReason
                        };
                        setContext(remoteContext);
                        const derived = deriveItems(remoteContext.items, remoteContext.rawBody);
                        setItems(derived);
                        await fetchItems(id, {
                            showSpinner: derived.length === 0
                        });
                    } catch (contextError) {
                        setError(contextError instanceof Error ? contextError.message : "Unable to load cleansed context.");
                        if (localSnapshot) {
                            setContext(localSnapshot);
                            setItems(deriveItems(localSnapshot.items, localSnapshot.rawBody));
                        } else {
                            setContext(null);
                            setItems([]);
                        }
                    } finally{
                        setLoading(false);
                    }
                }
            }["CleansingPage.useEffect.fetchContext"];
            fetchContext(activeId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["CleansingPage.useEffect"], [
        activeId
    ]);
    const previewRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CleansingPage.useMemo[previewRows]": ()=>{
            return items.map({
                "CleansingPage.useMemo[previewRows]": (item, index)=>{
                    if (typeof item === "object" && item !== null) {
                        const payload = item;
                        const rawLabel = payload.originalFieldName ?? payload.fieldName ?? payload.field ?? payload.label ?? payload.itemType;
                        const derivedLabel = normalizeLabel(rawLabel, `Item ${index + 1}`);
                        const originalCandidate = pickValueFromPayload(payload, ORIGINAL_VALUE_KEYS, rawLabel) ?? pickValueFromPayload(payload.context ?? {}, ORIGINAL_VALUE_KEYS, rawLabel);
                        const cleansedCandidate = pickValueFromPayload(payload, CLEANSED_VALUE_KEYS, rawLabel) ?? pickValueFromPayload(payload.context ?? {}, CLEANSED_VALUE_KEYS, rawLabel);
                        return {
                            id: payload.id ?? `${derivedLabel}-${index}`,
                            label: derivedLabel,
                            original: formatValue(originalCandidate),
                            cleansed: formatValue(cleansedCandidate)
                        };
                    }
                    return {
                        id: `item-${index}`,
                        label: `Item ${index + 1}`,
                        original: formatValue(item),
                        cleansed: formatValue(item)
                    };
                }
            }["CleansingPage.useMemo[previewRows]"]);
        }
    }["CleansingPage.useMemo[previewRows]"], [
        items
    ]);
    const handleSendToEnrichment = async ()=>{
        if (!context?.metadata.cleansedId) {
            setEnrichmentFeedback({
                state: "error",
                message: "Cleansed ID is missing. Re-run extraction before enrichment."
            });
            return;
        }
        setEnrichmentFeedback({
            state: "loading",
            message: "Triggering enrichment…"
        });
        try {
            const response = await fetch("/api/ingestion/enrichment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: context.metadata.cleansedId
                })
            });
            const payload = await response.json();
            if (!response.ok) {
                setEnrichmentFeedback({
                    state: "error",
                    message: payload?.error ?? "Backend rejected the request."
                });
                return;
            }
            const now = Date.now();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$extraction$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveEnrichmentContext"])({
                metadata: context.metadata,
                startedAt: now,
                statusHistory: [
                    {
                        status: "ENRICHMENT_TRIGGERED",
                        timestamp: now
                    },
                    {
                        status: typeof payload?.body?.status === "string" ? payload.body.status : "WAITING_FOR_RESULTS",
                        timestamp: now
                    }
                ]
            });
            setEnrichmentFeedback({
                state: "success",
                message: "Enrichment pipeline triggered."
            });
            router.push(`/enrichment?id=${encodeURIComponent(context.metadata.cleansedId)}`);
        } catch (error) {
            setEnrichmentFeedback({
                state: "error",
                message: error instanceof Error ? error.message : "Unable to reach enrichment service."
            });
        }
    };
    if (loading || !hydrated) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs uppercase tracking-wide text-slate-400",
                        children: "Cleansing"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                        lineNumber: 597,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "mt-2 text-2xl font-semibold text-slate-900",
                        children: "Loading context…"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                        lineNumber: 598,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-3 text-sm text-slate-500",
                        children: "Fetching cleansed snapshot from the backend. One moment please."
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                        lineNumber: 599,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                lineNumber: 596,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
            lineNumber: 595,
            columnNumber: 7
        }, this);
    }
    if (!context) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs uppercase tracking-wide text-slate-400",
                        children: "Cleansing"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                        lineNumber: 611,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "mt-2 text-2xl font-semibold text-slate-900",
                        children: error ?? "Cleansed context not found"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                        lineNumber: 612,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-3 text-sm text-slate-500",
                        children: "Provide a valid `id` query parameter or trigger the pipeline again."
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                        lineNumber: 615,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>router.push("/extraction"),
                        className: "mt-6 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white",
                        children: "Back to Extraction"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                        lineNumber: 618,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                lineNumber: 610,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
            lineNumber: 609,
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
                                    children: "Cleansing"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                    lineNumber: 641,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-xl font-semibold text-slate-900",
                                    children: [
                                        "Review cleansed output (",
                                        context.metadata.name,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                    lineNumber: 642,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                            lineNumber: 640,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-1 flex-col items-start gap-3 md:flex-row md:items-center md:justify-end",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$components$2f$PipelineTracker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PipelineTracker"], {
                                    current: "cleansing"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                    lineNumber: 647,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FeedbackPill, {
                                    feedback: enrichmentFeedback
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                    lineNumber: 648,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                            lineNumber: 646,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                    lineNumber: 639,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                lineNumber: 638,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Status"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                lineNumber: 657,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-lg font-semibold text-slate-900",
                                                children: context.status ?? "Pending"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                lineNumber: 658,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                        lineNumber: 656,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-slate-500",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "Uploaded"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                lineNumber: 663,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "font-semibold text-slate-800",
                                                children: new Date(context.metadata.uploadedAt).toLocaleString()
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                lineNumber: 664,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                        lineNumber: 662,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                lineNumber: 655,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Cleansed ID"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                lineNumber: 671,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                className: "text-sm font-semibold text-slate-900",
                                                children: context.metadata.cleansedId ?? "—"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                lineNumber: 674,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                        lineNumber: 670,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Source"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                lineNumber: 679,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                className: "text-sm font-semibold text-slate-900",
                                                children: sourceLabel
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                lineNumber: 680,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                        lineNumber: 678,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Source identifier"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                lineNumber: 683,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                className: "text-sm font-semibold text-slate-900 break-all",
                                                children: sourceIdentifier
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                lineNumber: 684,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                        lineNumber: 682,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Cache status"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                lineNumber: 689,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                className: "text-sm font-semibold text-slate-900",
                                                children: context.fallbackReason === "quota" ? "Partial snapshot" : "Complete snapshot"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                lineNumber: 690,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                        lineNumber: 688,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                lineNumber: 669,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                        lineNumber: 654,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs uppercase tracking-wide text-slate-400",
                                            children: "Items"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                            lineNumber: 700,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-lg font-semibold text-slate-900",
                                            children: "Original vs Cleansed values"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                            lineNumber: 701,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                    lineNumber: 699,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                lineNumber: 698,
                                columnNumber: 11
                            }, this),
                            itemsLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 rounded-2xl border border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-600",
                                children: "Fetching latest cleansed rows…"
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                lineNumber: 708,
                                columnNumber: 13
                            }, this) : itemsError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-semibold",
                                        children: "Unable to load cleansed items."
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                        lineNumber: 713,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1",
                                        children: itemsError
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                        lineNumber: 714,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>context.metadata.cleansedId && fetchItems(context.metadata.cleansedId),
                                        className: "mt-3 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white",
                                        children: "Retry fetch"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                        lineNumber: 715,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                lineNumber: 712,
                                columnNumber: 13
                            }, this) : previewRows.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500",
                                children: "No cleansed items available yet."
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                lineNumber: 724,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 rounded-2xl border border-slate-100",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "max-h-[480px] overflow-y-auto",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                        className: "w-full text-left text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                className: "bg-slate-50 text-xs uppercase tracking-wide text-slate-500",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-4 py-3 font-semibold",
                                                            children: "Field"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                            lineNumber: 733,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-4 py-3 font-semibold",
                                                            children: "Original value"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                            lineNumber: 734,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-4 py-3 font-semibold",
                                                            children: "Cleansed value"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                            lineNumber: 735,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                    lineNumber: 732,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                lineNumber: 731,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                className: "divide-y divide-slate-100 bg-white",
                                                children: previewRows.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "px-4 py-3 align-top font-semibold text-slate-900",
                                                                children: row.label
                                                            }, void 0, false, {
                                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                                lineNumber: 741,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "px-4 py-3 align-top text-slate-700",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                                    className: "whitespace-pre-wrap text-xs",
                                                                    children: row.original
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                                    lineNumber: 745,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                                lineNumber: 744,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "px-4 py-3 align-top text-slate-700",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                                    className: "whitespace-pre-wrap text-xs",
                                                                    children: row.cleansed
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                                    lineNumber: 748,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                                lineNumber: 747,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, row.id, true, {
                                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                        lineNumber: 740,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                lineNumber: 738,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                        lineNumber: 730,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                    lineNumber: 729,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                lineNumber: 728,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                        lineNumber: 697,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs uppercase tracking-wide text-slate-400",
                                            children: "Applied rules"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                            lineNumber: 762,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-lg font-semibold text-slate-900",
                                            children: "Cleansing heuristics snapshot"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                            lineNumber: 763,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                    lineNumber: 761,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid gap-4 md:grid-cols-2",
                                    children: RULES.map((rule)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-inner",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-semibold text-slate-900",
                                                    children: rule.title
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                    lineNumber: 773,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-1 text-xs text-slate-600",
                                                    children: rule.description
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                                    lineNumber: 774,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, rule.title, true, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                            lineNumber: 769,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                    lineNumber: 767,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                            lineNumber: 760,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                        lineNumber: 759,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs uppercase tracking-wide text-slate-400",
                                            children: "Next steps"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                            lineNumber: 784,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-lg font-semibold text-slate-900",
                                            children: "Ready to send for enrichment?"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                            lineNumber: 785,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                    lineNumber: 783,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>router.push("/extraction"),
                                            className: "rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700",
                                            children: "Back to Extraction"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                            lineNumber: 790,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: handleSendToEnrichment,
                                            disabled: enrichmentFeedback.state === "loading",
                                            className: "rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70",
                                            children: enrichmentFeedback.state === "loading" ? "Sending to Enrichment…" : "Send to Enrichment"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                            lineNumber: 797,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>{
                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$extraction$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearCleansedContext"])();
                                                router.push("/ingestion");
                                            },
                                            className: "rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700",
                                            children: "Start Over"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                            lineNumber: 807,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                                    lineNumber: 789,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                            lineNumber: 782,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                        lineNumber: 781,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
                lineNumber: 653,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/cleansing/page.tsx",
        lineNumber: 637,
        columnNumber: 5
    }, this);
}
_s(CleansingPage, "vNKvuH1+89N33HT2LYNF4UGI9+A=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c1 = CleansingPage;
var _c, _c1;
__turbopack_context__.k.register(_c, "FeedbackPill");
__turbopack_context__.k.register(_c1, "CleansingPage");
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

//# sourceMappingURL=Documents_GitHub_UserFlow_UserFlow_cf879133._.js.map