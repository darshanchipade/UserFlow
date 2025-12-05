module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/Documents/GitHub/UserFlow/UserFlow/src/lib/tree.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildTreeFromJson",
    ()=>buildTreeFromJson,
    "filterTree",
    ()=>filterTree,
    "gatherLeafNodes",
    ()=>gatherLeafNodes,
    "gatherNodeIds",
    ()=>gatherNodeIds
]);
const MAX_TREE_NODES = 5000;
const MAX_ARRAY_CHILDREN = 100;
const isPlainObject = (value)=>typeof value === "object" && value !== null && !Array.isArray(value);
const buildTreeFromJson = (payload, parentPath = [], counter = {
    value: 0
})=>{
    if (counter.value >= MAX_TREE_NODES) return [];
    if (Array.isArray(payload)) {
        return payload.slice(0, MAX_ARRAY_CHILDREN).flatMap((entry, index)=>{
            const label = `[${index}]`;
            const id = [
                ...parentPath,
                label
            ].join(".");
            counter.value += 1;
            if (counter.value >= MAX_TREE_NODES) return [];
            const childNodes = buildTreeFromJson(entry, [
                ...parentPath,
                label
            ], counter);
            return [
                {
                    id,
                    label,
                    path: id,
                    type: Array.isArray(entry) ? "array" : isPlainObject(entry) ? "object" : "value",
                    children: childNodes.length ? childNodes : undefined,
                    value: !Array.isArray(entry) && !isPlainObject(entry) ? entry : childNodes.length === 0 ? entry : undefined
                }
            ];
        });
    }
    if (isPlainObject(payload)) {
        return Object.entries(payload).flatMap(([key, value])=>{
            if (counter.value >= MAX_TREE_NODES) return [];
            const id = [
                ...parentPath,
                key
            ].join(".");
            counter.value += 1;
            const childNodes = buildTreeFromJson(value, [
                ...parentPath,
                key
            ], counter);
            return [
                {
                    id,
                    label: key,
                    path: id,
                    type: Array.isArray(value) ? "array" : isPlainObject(value) ? "object" : "value",
                    children: childNodes.length ? childNodes : undefined,
                    value: !Array.isArray(value) && !isPlainObject(value) ? value : childNodes.length === 0 ? value : undefined
                }
            ];
        });
    }
    return [];
};
const gatherLeafNodes = (node)=>{
    if (!node.children || node.children.length === 0) {
        return [
            node
        ];
    }
    return node.children.flatMap((child)=>gatherLeafNodes(child));
};
const gatherNodeIds = (node)=>{
    return [
        node.id,
        ...node.children?.flatMap((child)=>gatherNodeIds(child)) ?? []
    ];
};
const filterTree = (nodes, query)=>{
    if (!query) return nodes;
    const normalized = query.toLowerCase();
    const searchNode = (node)=>{
        const matches = node.label.toLowerCase().includes(normalized);
        if (!node.children || node.children.length === 0) {
            return matches ? node : null;
        }
        const filteredChildren = node.children.map(searchNode).filter((child)=>Boolean(child));
        if (matches || filteredChildren.length > 0) {
            return {
                ...node,
                children: filteredChildren.length ? filteredChildren : undefined
            };
        }
        return null;
    };
    return nodes.map(searchNode).filter((node)=>Boolean(node));
};
}),
"[project]/Documents/GitHub/UserFlow/UserFlow/src/lib/extraction-context.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    if ("TURBOPACK compile-time truthy", 1) {
        return {
            ok: false,
            reason: "ssr"
        };
    }
    //TURBOPACK unreachable
    ;
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
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
    const stored = undefined;
};
const clearExtractionContext = ()=>{
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
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
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
    const stored = undefined;
};
const clearCleansedContext = ()=>{
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
};
const saveEnrichmentContext = (payload)=>{
    return persistToSessionStorage(ENRICHMENT_STORAGE_KEY, payload);
};
const loadEnrichmentContext = ()=>{
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
    const stored = undefined;
};
const clearEnrichmentContext = ()=>{
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
};
}),
"[project]/Documents/GitHub/UserFlow/UserFlow/src/lib/client/snapshot-store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readClientSnapshot",
    ()=>readClientSnapshot,
    "storeClientSnapshot",
    ()=>storeClientSnapshot
]);
"use client";
const DB_NAME = "ExtractionSnapshots";
const STORE_NAME = "snapshots";
const openDatabase = ()=>{
    return new Promise((resolve, reject)=>{
        if ("TURBOPACK compile-time truthy", 1) {
            reject(new Error("IndexedDB is not available in this environment."));
            return;
        }
        //TURBOPACK unreachable
        ;
        const request = undefined;
    });
};
const storeClientSnapshot = async (id, payload)=>{
    try {
        const db = await openDatabase();
        await new Promise((resolve, reject)=>{
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(payload, id);
            request.onsuccess = ()=>resolve();
            request.onerror = ()=>reject(request.error ?? new Error("Failed to store snapshot."));
        });
        return {
            ok: true
        };
    } catch (error) {
        return {
            ok: false,
            message: error instanceof Error ? error.message : "Failed to store snapshot in IndexedDB."
        };
    }
};
const readClientSnapshot = async (id)=>{
    try {
        const db = await openDatabase();
        return await new Promise((resolve, reject)=>{
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);
            request.onsuccess = ()=>resolve(request.result ?? null);
            request.onerror = ()=>reject(request.error ?? new Error("Failed to read snapshot."));
        });
    } catch  {
        return null;
    }
};
}),
"[project]/Documents/GitHub/UserFlow/UserFlow/src/lib/source.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>IngestionPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowPathIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowPathIcon$3e$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/@heroicons/react/24/outline/esm/ArrowPathIcon.js [app-ssr] (ecmascript) <export default as ArrowPathIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowUpTrayIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpTrayIcon$3e$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/@heroicons/react/24/outline/esm/ArrowUpTrayIcon.js [app-ssr] (ecmascript) <export default as ArrowUpTrayIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CheckCircleIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircleIcon$3e$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/@heroicons/react/24/outline/esm/CheckCircleIcon.js [app-ssr] (ecmascript) <export default as CheckCircleIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/@heroicons/react/24/outline/esm/ChevronDownIcon.js [app-ssr] (ecmascript) <export default as ChevronDownIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronRightIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRightIcon$3e$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/@heroicons/react/24/outline/esm/ChevronRightIcon.js [app-ssr] (ecmascript) <export default as ChevronRightIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CloudArrowUpIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudArrowUpIcon$3e$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/@heroicons/react/24/outline/esm/CloudArrowUpIcon.js [app-ssr] (ecmascript) <export default as CloudArrowUpIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$DocumentTextIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__DocumentTextIcon$3e$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/@heroicons/react/24/outline/esm/DocumentTextIcon.js [app-ssr] (ecmascript) <export default as DocumentTextIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ExclamationCircleIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExclamationCircleIcon$3e$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/@heroicons/react/24/outline/esm/ExclamationCircleIcon.js [app-ssr] (ecmascript) <export default as ExclamationCircleIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$InboxStackIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__InboxStackIcon$3e$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/@heroicons/react/24/outline/esm/InboxStackIcon.js [app-ssr] (ecmascript) <export default as InboxStackIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$MagnifyingGlassIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MagnifyingGlassIcon$3e$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/@heroicons/react/24/outline/esm/MagnifyingGlassIcon.js [app-ssr] (ecmascript) <export default as MagnifyingGlassIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ServerStackIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ServerStackIcon$3e$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/@heroicons/react/24/outline/esm/ServerStackIcon.js [app-ssr] (ecmascript) <export default as ServerStackIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$tree$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/src/lib/tree.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$extraction$2d$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/src/lib/extraction-context.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$client$2f$snapshot$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/src/lib/client/snapshot-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/src/lib/source.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
const steps = [
    {
        label: "Ingestion",
        status: "current"
    },
    {
        label: "Extraction",
        status: "upcoming"
    },
    {
        label: "Cleansing",
        status: "upcoming"
    },
    {
        label: "Data Enrichment",
        status: "upcoming"
    },
    {
        label: "Content QA",
        status: "upcoming"
    }
];
const uploadTabs = [
    {
        id: "s3",
        title: "Amazon S3 / Cloud",
        description: "Ingest directly from s3:// or classpath URIs.",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CloudArrowUpIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudArrowUpIcon$3e$__["CloudArrowUpIcon"],
        disabled: false
    },
    {
        id: "local",
        title: "Local Upload",
        description: "Upload files directly from your device.",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowUpTrayIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpTrayIcon$3e$__["ArrowUpTrayIcon"],
        disabled: false
    },
    {
        id: "api",
        title: "API Endpoint",
        description: "Send JSON payloads programmatically.",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ServerStackIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ServerStackIcon$3e$__["ServerStackIcon"],
        disabled: false
    }
];
const statusStyles = {
    uploading: {
        label: "Uploading",
        className: "bg-amber-50 text-amber-700",
        dot: "bg-amber-400"
    },
    success: {
        label: "Accepted",
        className: "bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500"
    },
    error: {
        label: "Error",
        className: "bg-rose-50 text-rose-700",
        dot: "bg-rose-500"
    }
};
const formatBytes = (bytes)=>{
    if (!Number.isFinite(bytes)) return "—";
    if (bytes === 0) return "0 B";
    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(value > 9 || index === 0 ? 0 : 1)} ${units[index]}`;
};
const safeJsonParse = (value)=>{
    try {
        return JSON.parse(value);
    } catch  {
        return null;
    }
};
const getFileLabel = (fileName)=>{
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch(extension){
        case "json":
            return {
                label: "JSON",
                style: "bg-violet-100 text-violet-700"
            };
        case "pdf":
            return {
                label: "PDF",
                style: "bg-rose-100 text-rose-700"
            };
        case "xls":
        case "xlsx":
            return {
                label: "XLS",
                style: "bg-emerald-100 text-emerald-700"
            };
        case "doc":
        case "docx":
            return {
                label: "DOC",
                style: "bg-sky-100 text-sky-700"
            };
        default:
            return {
                label: "FILE",
                style: "bg-slate-100 text-slate-600"
            };
    }
};
const describeExtractionPersistenceError = (result)=>{
    if (!result) {
        return "Extraction context could not be cached in this browser.";
    }
    switch(result.reason){
        case "quota":
            return "Browser storage is full. Clear other extraction tabs or reduce the payload size and try again.";
        case "ssr":
            return "Extraction context can only be saved in a browser tab.";
        default:
            return "Extraction context could not be cached locally. Check the console for details.";
    }
};
const FeedbackPill = ({ feedback })=>{
    if (feedback.state === "idle") {
        return null;
    }
    const className = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", feedback.state === "success" ? "bg-emerald-50 text-emerald-700" : feedback.state === "error" ? "bg-rose-50 text-rose-700" : "bg-indigo-50 text-indigo-600");
    const Icon = feedback.state === "loading" ? __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowPathIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowPathIcon$3e$__["ArrowPathIcon"] : feedback.state === "success" ? __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CheckCircleIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircleIcon$3e$__["CheckCircleIcon"] : __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ExclamationCircleIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExclamationCircleIcon$3e$__["ExclamationCircleIcon"];
    const message = feedback.message ?? (feedback.state === "loading" ? "Contacting backend..." : feedback.state === "success" ? "Completed successfully." : "Something went wrong.");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: className,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("size-4", feedback.state === "loading" && "animate-spin")
            }, void 0, false, {
                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                lineNumber: 189,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            message
        ]
    }, void 0, true, {
        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
        lineNumber: 188,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
function IngestionPage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("local");
    const [localFile, setLocalFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [localFileText, setLocalFileText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [apiPayload, setApiPayload] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [s3Uri, setS3Uri] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [treeNodes, setTreeNodes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [previewLabel, setPreviewLabel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("Awaiting content");
    const [expandedNodes, setExpandedNodes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [uploads, setUploads] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [extractFeedback, setExtractFeedback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        state: "idle"
    });
    const [apiFeedback, setApiFeedback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        state: "idle"
    });
    const [s3Feedback, setS3Feedback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        state: "idle"
    });
    const [extracting, setExtracting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const filteredTree = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$tree$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterTree"])(treeNodes, searchQuery), [
        treeNodes,
        searchQuery
    ]);
    const previewLeaves = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!treeNodes.length) return [];
        return treeNodes.flatMap((node)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$tree$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["gatherLeafNodes"])(node));
    }, [
        treeNodes
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (activeTab === "s3") {
            setTreeNodes([]);
            setPreviewLabel("Structure preview unavailable for S3/classpath sources.");
        } else if (activeTab === "local" && localFileText) {
            const parsed = safeJsonParse(localFileText);
            if (parsed) {
                seedPreviewTree(localFile?.name ?? "Local JSON", parsed);
            }
        } else if (activeTab === "api" && apiPayload.trim()) {
            const parsed = safeJsonParse(apiPayload);
            if (parsed) {
                seedPreviewTree("API payload", parsed);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        activeTab
    ]);
    const seedPreviewTree = (label, payload)=>{
        const counter = {
            value: 0
        };
        const children = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$tree$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildTreeFromJson"])(payload, [], counter);
        if (!children.length) {
            setTreeNodes([]);
            setPreviewLabel("Unable to derive structure from payload.");
            setExpandedNodes(new Set());
            return [];
        }
        const rootNode = {
            id: label,
            label,
            path: label,
            type: "object",
            children
        };
        const nodes = [
            rootNode
        ];
        setTreeNodes(nodes);
        setPreviewLabel(label);
        setExpandedNodes(new Set([
            rootNode.id
        ]));
        return nodes;
    };
    const handleLocalFileSelection = async (files)=>{
        if (!files || files.length === 0) return;
        const [file] = Array.from(files);
        setLocalFile(file);
        setExtractFeedback({
            state: "idle"
        });
        if (file.name.toLowerCase().endsWith(".json")) {
            const text = await file.text();
            setLocalFileText(text);
            const parsed = safeJsonParse(text);
            if (parsed) {
                seedPreviewTree(file.name, parsed);
            } else {
                setTreeNodes([]);
                setPreviewLabel("Uploaded JSON could not be parsed.");
            }
        } else {
            setLocalFileText(null);
            setTreeNodes([]);
            setPreviewLabel("Select a JSON file to preview its structure.");
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    const handleExtractData = async ()=>{
        setExtracting(true);
        setExtractFeedback({
            state: "loading",
            message: "Dispatching to backend..."
        });
        try {
            if (activeTab === "local") {
                await processLocalExtraction();
            } else if (activeTab === "api") {
                await processApiExtraction();
            } else {
                await processS3Extraction();
            }
        } catch (error) {
            setExtractFeedback({
                state: "error",
                message: error instanceof Error ? error.message : "Extraction failed unexpectedly."
            });
            setExtracting(false);
        }
    };
    const processLocalExtraction = async ()=>{
        if (!localFile) {
            setExtractFeedback({
                state: "error",
                message: "Add a JSON file before extracting."
            });
            setExtracting(false);
            return;
        }
        const formData = new FormData();
        formData.append("file", localFile);
        const uploadId = crypto.randomUUID();
        setUploads((previous)=>[
                {
                    id: uploadId,
                    name: localFile.name,
                    size: localFile.size,
                    type: localFile.type || localFile.name.split(".").pop() || "file",
                    source: "Local",
                    status: "uploading",
                    createdAt: Date.now()
                },
                ...previous
            ]);
        const response = await fetch("/api/ingestion/upload", {
            method: "POST",
            body: formData
        });
        const payload = await response.json();
        const details = parseBackendPayload(payload);
        setUploads((previous)=>previous.map((item)=>item.id === uploadId ? {
                    ...item,
                    status: response.ok ? "success" : "error",
                    cleansedId: details.cleansedId ?? item.cleansedId,
                    backendStatus: details.status ?? item.backendStatus,
                    backendMessage: details.message ?? item.backendMessage
                } : item));
        if (!response.ok) {
            setExtractFeedback({
                state: "error",
                message: details.message ?? "Backend rejected the upload."
            });
            setExtracting(false);
            return;
        }
        const fallbackIdentifier = `file-upload:${localFile.name}`;
        const sourceIdentifier = details.sourceIdentifier ?? fallbackIdentifier;
        const sourceType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["inferSourceType"])(details.sourceType, sourceIdentifier, "file") ?? "file";
        const metadata = {
            name: localFile.name,
            size: localFile.size,
            source: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["describeSourceLabel"])(sourceType, "Local upload"),
            cleansedId: details.cleansedId,
            status: details.status,
            uploadedAt: Date.now(),
            sourceIdentifier,
            sourceType
        };
        const snapshotId = details.cleansedId ?? uploadId;
        let snapshotPersisted = false;
        let resolvedSnapshotId;
        if (snapshotId) {
            const result = await persistSnapshot(snapshotId, {
                mode: "local",
                metadata,
                rawJson: localFileText ?? undefined,
                tree: treeNodes,
                backendPayload: payload
            });
            snapshotPersisted = result.ok;
            resolvedSnapshotId = result.snapshotId;
            if (!result.ok) {
                console.warn("Unable to cache extraction snapshot, falling back to session storage.", result.message);
            }
        }
        const persistenceResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$extraction$2d$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveExtractionContext"])({
            mode: "local",
            metadata,
            snapshotId: snapshotPersisted ? resolvedSnapshotId ?? snapshotId : undefined,
            tree: snapshotPersisted ? undefined : treeNodes,
            rawJson: snapshotPersisted ? undefined : localFileText ?? undefined,
            backendPayload: snapshotPersisted ? undefined : payload
        });
        if (!persistenceResult.ok) {
            setExtractFeedback({
                state: "error",
                message: describeExtractionPersistenceError(persistenceResult)
            });
            setExtracting(false);
            return;
        }
        setExtractFeedback({
            state: "success",
            message: "Extraction ready. Redirecting..."
        });
        setExtracting(false);
        router.push("/extraction");
    };
    const processApiExtraction = async ()=>{
        if (!apiPayload.trim()) {
            setExtractFeedback({
                state: "error",
                message: "Paste a JSON payload before extracting."
            });
            setExtracting(false);
            return;
        }
        const parsed = safeJsonParse(apiPayload);
        if (!parsed) {
            setExtractFeedback({
                state: "error",
                message: "Payload must be valid JSON before submission."
            });
            setExtracting(false);
            return;
        }
        setApiFeedback({
            state: "loading"
        });
        const uploadId = crypto.randomUUID();
        setUploads((previous)=>[
                {
                    id: uploadId,
                    name: "API payload",
                    size: apiPayload.length,
                    type: "application/json",
                    source: "API",
                    status: "uploading",
                    createdAt: Date.now()
                },
                ...previous
            ]);
        const response = await fetch("/api/ingestion/payload", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                payload: parsed
            })
        });
        const payload = await response.json();
        const details = parseBackendPayload(payload);
        setUploads((previous)=>previous.map((upload)=>upload.id === uploadId ? {
                    ...upload,
                    status: response.ok ? "success" : "error",
                    cleansedId: details.cleansedId ?? upload.cleansedId,
                    backendStatus: details.status ?? upload.backendStatus,
                    backendMessage: details.message ?? upload.backendMessage
                } : upload));
        setApiFeedback({
            state: response.ok ? "success" : "error",
            message: response.ok ? "Payload accepted." : "Backend rejected the payload."
        });
        if (!response.ok) {
            setExtractFeedback({
                state: "error",
                message: details.message ?? "Backend rejected the payload."
            });
            setExtracting(false);
            return;
        }
        const previewNodes = seedPreviewTree("API payload", parsed);
        const fallbackIdentifier = details.cleansedId ?? `api-payload:${uploadId}`;
        const sourceIdentifier = details.sourceIdentifier ?? fallbackIdentifier;
        const sourceType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["inferSourceType"])(details.sourceType, sourceIdentifier, "api") ?? "api";
        const metadata = {
            name: "API payload",
            size: apiPayload.length,
            source: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["describeSourceLabel"])(sourceType, "API payload"),
            cleansedId: details.cleansedId,
            status: details.status,
            uploadedAt: Date.now(),
            sourceIdentifier,
            sourceType
        };
        const snapshotId = details.cleansedId ?? uploadId;
        const serializedPayload = JSON.stringify(parsed, null, 2);
        let snapshotPersisted = false;
        let resolvedSnapshotId;
        if (snapshotId) {
            const snapshotResult = await persistSnapshot(snapshotId, {
                mode: "api",
                metadata,
                rawJson: serializedPayload,
                tree: previewNodes,
                backendPayload: payload
            });
            snapshotPersisted = snapshotResult.ok;
            resolvedSnapshotId = snapshotResult.snapshotId;
            if (!snapshotResult.ok) {
                console.warn("Unable to cache API extraction snapshot, falling back to browser session storage.", snapshotResult.message);
            }
        }
        const persistenceResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$extraction$2d$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveExtractionContext"])({
            mode: "api",
            metadata,
            snapshotId: snapshotPersisted ? resolvedSnapshotId ?? snapshotId : undefined,
            tree: snapshotPersisted ? undefined : previewNodes,
            rawJson: snapshotPersisted ? undefined : serializedPayload,
            backendPayload: snapshotPersisted ? undefined : payload
        });
        if (!persistenceResult.ok) {
            setExtractFeedback({
                state: "error",
                message: describeExtractionPersistenceError(persistenceResult)
            });
            setExtracting(false);
            return;
        }
        setExtractFeedback({
            state: "success",
            message: "Extraction ready. Redirecting..."
        });
        setExtracting(false);
        router.push("/extraction");
    };
    const processS3Extraction = async ()=>{
        const normalized = s3Uri.trim();
        if (!normalized) {
            setExtractFeedback({
                state: "error",
                message: "Provide an s3://bucket/key (or classpath:) URI first."
            });
            setExtracting(false);
            return;
        }
        setS3Feedback({
            state: "loading"
        });
        const uploadId = crypto.randomUUID();
        setUploads((previous)=>[
                {
                    id: uploadId,
                    name: normalized,
                    size: 0,
                    type: "text/uri-list",
                    source: "S3",
                    status: "uploading",
                    createdAt: Date.now()
                },
                ...previous
            ]);
        const response = await fetch("/api/ingestion/s3", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sourceUri: normalized
            })
        });
        const payload = await response.json();
        const details = parseBackendPayload(payload);
        setUploads((previous)=>previous.map((upload)=>upload.id === uploadId ? {
                    ...upload,
                    status: response.ok ? "success" : "error",
                    cleansedId: details.cleansedId ?? upload.cleansedId,
                    backendStatus: details.status ?? (response.ok ? "ACCEPTED" : upload.backendStatus),
                    backendMessage: details.message ?? upload.backendMessage
                } : upload));
        setS3Feedback({
            state: response.ok ? "success" : "error",
            message: response.ok ? "Source accepted." : "Backend rejected the S3/classpath request."
        });
        if (!response.ok) {
            setExtractFeedback({
                state: "error",
                message: details.message ?? "Backend rejected the request."
            });
            setExtracting(false);
            return;
        }
        const sourceIdentifier = details.sourceIdentifier ?? normalized;
        const sourceType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["inferSourceType"])(details.sourceType, sourceIdentifier, "s3") ?? "s3";
        const metadata = {
            name: normalized,
            size: 0,
            source: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["describeSourceLabel"])(sourceType, "S3 / Cloud"),
            cleansedId: details.cleansedId,
            status: details.status,
            uploadedAt: Date.now(),
            sourceIdentifier,
            sourceType
        };
        const snapshotId = details.cleansedId ?? uploadId;
        let snapshotPersisted = false;
        let resolvedSnapshotId;
        if (snapshotId) {
            const snapshotResult = await persistSnapshot(snapshotId, {
                mode: "s3",
                metadata,
                sourceUri: normalized,
                backendPayload: payload
            });
            snapshotPersisted = snapshotResult.ok;
            resolvedSnapshotId = snapshotResult.snapshotId;
            if (!snapshotResult.ok) {
                console.warn("Unable to cache S3 extraction snapshot, falling back to session storage metadata only.", snapshotResult.message);
            }
        }
        const persistenceResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$extraction$2d$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveExtractionContext"])({
            mode: "s3",
            metadata,
            sourceUri: normalized,
            snapshotId: snapshotPersisted ? resolvedSnapshotId ?? snapshotId : undefined,
            backendPayload: snapshotPersisted ? undefined : payload
        });
        if (!persistenceResult.ok) {
            setExtractFeedback({
                state: "error",
                message: describeExtractionPersistenceError(persistenceResult)
            });
            setExtracting(false);
            return;
        }
        setExtractFeedback({
            state: "success",
            message: "Extraction ready. Redirecting..."
        });
        setExtracting(false);
        router.push("/extraction");
    };
    const parseBackendPayload = (payload)=>{
        const body = payload?.body;
        const rawBody = payload?.rawBody;
        const bodyRecord = body && typeof body === "object" && !Array.isArray(body) ? body : null;
        const metadataRecord = bodyRecord?.metadata && typeof bodyRecord.metadata === "object" ? bodyRecord.metadata : null;
        const cleansedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickString"])(bodyRecord?.cleansedDataStoreId) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickString"])(bodyRecord?.cleansedId) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickString"])(bodyRecord?.id);
        const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickString"])(bodyRecord?.status);
        const pickMessage = (source)=>{
            const direct = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickString"])(source);
            if (direct) return direct;
            if (source && typeof source === "object") {
                const candidates = [
                    source["error"],
                    source["message"],
                    source["detail"],
                    source["statusText"],
                    source["description"]
                ];
                for (const candidate of candidates){
                    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickString"])(candidate);
                    if (value) return value;
                }
            }
            return undefined;
        };
        const deriveSourceIdentifier = ()=>{
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickString"])(bodyRecord?.sourceIdentifier) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickString"])(bodyRecord?.sourceUri) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickString"])(metadataRecord?.sourceIdentifier) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickString"])(metadataRecord?.sourceUri) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickString"])(payload?.sourceIdentifier) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickString"])(payload?.sourceUri);
        };
        const sourceIdentifier = deriveSourceIdentifier();
        const sourceType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["inferSourceType"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickString"])(bodyRecord?.sourceType) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$source$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickString"])(metadataRecord?.sourceType), sourceIdentifier);
        const message = pickMessage(body) ?? pickMessage(payload?.error) ?? pickMessage(rawBody) ?? (typeof rawBody === "string" ? rawBody : undefined);
        return {
            cleansedId,
            status,
            message,
            sourceIdentifier,
            sourceType
        };
    };
    const persistSnapshot = async (id, payload)=>{
        if (!id) {
            return {
                ok: false,
                message: "Snapshot id is missing."
            };
        }
        const snapshotPayload = {
            ...payload,
            storedAt: Date.now()
        };
        try {
            const response = await fetch("/api/ingestion/context", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id,
                    payload: {
                        ...payload,
                        mode: payload.mode,
                        metadata: payload.metadata,
                        rawJson: payload.rawJson,
                        tree: payload.tree,
                        sourceUri: payload.sourceUri,
                        backendPayload: payload.backendPayload
                    }
                })
            });
            if (!response.ok) {
                let message = "Failed to cache extraction snapshot.";
                try {
                    const body = await response.json();
                    if (body?.error) message = body.error;
                } catch  {
                // ignore
                }
                throw new Error(message);
            }
            return {
                ok: true,
                snapshotId: id
            };
        } catch (error) {
            const localId = `local:${id}`;
            const localResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$src$2f$lib$2f$client$2f$snapshot$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storeClientSnapshot"])(localId, snapshotPayload);
            if (localResult.ok) {
                return {
                    ok: true,
                    snapshotId: localId
                };
            }
            return {
                ok: false,
                message: localResult.message ?? (error instanceof Error ? error.message : "Failed to cache extraction snapshot.")
            };
        }
    };
    const toggleNode = (nodeId)=>{
        setExpandedNodes((previous)=>{
            const next = new Set(previous);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });
    };
    const renderTree = (nodes)=>nodes.map((node)=>{
            const hasChildren = Boolean(node.children?.length);
            const expanded = expandedNodes.has(node.id);
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 rounded-lg px-2 py-1.5",
                        children: [
                            hasChildren ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>toggleNode(node.id),
                                className: "text-slate-500 transition hover:text-slate-800",
                                "aria-label": expanded ? "Collapse section" : "Expand section",
                                children: expanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                    className: "size-4"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                    lineNumber: 850,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronRightIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRightIcon$3e$__["ChevronRightIcon"], {
                                    className: "size-4"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                    lineNumber: 852,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                lineNumber: 843,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "size-4"
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                lineNumber: 856,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-medium text-slate-900",
                                        children: node.label
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                        lineNumber: 859,
                                        columnNumber: 15
                                    }, this),
                                    !hasChildren && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-slate-500",
                                        children: node.path
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                        lineNumber: 863,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                lineNumber: 858,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                        lineNumber: 841,
                        columnNumber: 11
                    }, this),
                    hasChildren && expanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border-l border-slate-100 pl-4",
                        children: renderTree(node.children)
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                        lineNumber: 868,
                        columnNumber: 13
                    }, this)
                ]
            }, node.id, true, {
                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                lineNumber: 840,
                columnNumber: 9
            }, this);
        });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-slate-50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "border-b border-slate-200 bg-white",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-lg font-semibold text-white",
                                    children: ""
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                    lineNumber: 881,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-slate-500",
                                            children: "Context"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                            lineNumber: 885,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-1 flex flex-wrap gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700",
                                                    children: "EN-US"
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                    lineNumber: 887,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700",
                                                    children: "US"
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                    lineNumber: 890,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700",
                                                    children: "product-detail"
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                    lineNumber: 893,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                            lineNumber: 886,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                    lineNumber: 884,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                            lineNumber: 880,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                            className: "flex flex-1 justify-end gap-2 text-sm font-medium text-slate-500",
                            children: steps.map((step, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("rounded-full px-3 py-1", step.status === "current" ? "bg-indigo-50 text-indigo-600" : "bg-slate-50"),
                                            children: step.label
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                            lineNumber: 902,
                                            columnNumber: 17
                                        }, this),
                                        index < steps.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-slate-300",
                                            children: "—"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                            lineNumber: 913,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, step.label, true, {
                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                    lineNumber: 901,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                            lineNumber: 899,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                    lineNumber: 879,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                lineNumber: 878,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap items-start justify-between gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs uppercase tracking-wide text-slate-400",
                                                        children: "Ingestion"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                        lineNumber: 926,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        className: "mt-1 text-xl font-semibold text-slate-900",
                                                        children: "Upload Files"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                        lineNumber: 929,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-slate-500",
                                                        children: "Drag and drop JSON, paste payloads, or point at S3/classpath URIs."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                        lineNumber: 932,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 925,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FeedbackPill, {
                                                feedback: extractFeedback
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 936,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                        lineNumber: 924,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-6 grid gap-3 sm:grid-cols-3",
                                        children: uploadTabs.map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                disabled: tab.disabled,
                                                onClick: ()=>!tab.disabled && setActiveTab(tab.id),
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("rounded-2xl border px-4 py-3 text-left transition", tab.disabled ? "border-dashed border-slate-200 text-slate-400" : activeTab === tab.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-200"),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(tab.icon, {
                                                            className: "size-5 text-slate-500"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                            lineNumber: 956,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-sm font-semibold text-slate-900",
                                                                    children: tab.title
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                                    lineNumber: 958,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs text-slate-500",
                                                                    children: tab.description
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                                    lineNumber: 961,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                            lineNumber: 957,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                    lineNumber: 955,
                                                    columnNumber: 19
                                                }, this)
                                            }, tab.id, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 941,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                        lineNumber: 939,
                                        columnNumber: 13
                                    }, this),
                                    activeTab === "local" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "file-upload",
                                            onDragOver: (event)=>{
                                                event.preventDefault();
                                                event.stopPropagation();
                                            },
                                            onDrop: (event)=>{
                                                event.preventDefault();
                                                event.stopPropagation();
                                                handleLocalFileSelection(event.dataTransfer.files);
                                            },
                                            className: "flex cursor-pointer flex-col items-center gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowUpTrayIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpTrayIcon$3e$__["ArrowUpTrayIcon"], {
                                                    className: "size-10 text-indigo-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                    lineNumber: 985,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm font-semibold text-slate-900",
                                                            children: [
                                                                "Drag a JSON file here or ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-indigo-600 underline",
                                                                    children: "browse"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                                    lineNumber: 988,
                                                                    columnNumber: 48
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                            lineNumber: 987,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-slate-500",
                                                            children: "Single-file uploads only. Max 50 MB."
                                                        }, void 0, false, {
                                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                            lineNumber: 990,
                                                            columnNumber: 21
                                                        }, this),
                                                        localFile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "mt-1 text-xs text-slate-500",
                                                            children: [
                                                                "Selected: ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-semibold text-slate-800",
                                                                    children: localFile.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                                    lineNumber: 995,
                                                                    columnNumber: 35
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                            lineNumber: 994,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                    lineNumber: 986,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    id: "file-upload",
                                                    ref: fileInputRef,
                                                    type: "file",
                                                    className: "sr-only",
                                                    accept: ".json,application/json",
                                                    onChange: (event)=>handleLocalFileSelection(event.target.files)
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                    lineNumber: 999,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                            lineNumber: 972,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                        lineNumber: 971,
                                        columnNumber: 15
                                    }, this),
                                    activeTab === "api" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 text-sm font-semibold text-slate-900",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ServerStackIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ServerStackIcon$3e$__["ServerStackIcon"], {
                                                        className: "size-5 text-indigo-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                        lineNumber: 1014,
                                                        columnNumber: 19
                                                    }, this),
                                                    "POST /api/ingest-json-payload"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 1013,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                value: apiPayload,
                                                onChange: (event)=>{
                                                    setApiPayload(event.target.value);
                                                    const parsed = safeJsonParse(event.target.value);
                                                    if (parsed) {
                                                        seedPreviewTree("API payload", parsed);
                                                        setApiFeedback({
                                                            state: "idle"
                                                        });
                                                    }
                                                },
                                                rows: 6,
                                                placeholder: 'Paste JSON payload. Example: { "product": { "name": "Vision Pro" } }',
                                                className: "w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 1017,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FeedbackPill, {
                                                feedback: apiFeedback
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 1031,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                        lineNumber: 1012,
                                        columnNumber: 15
                                    }, this),
                                    activeTab === "s3" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 text-sm font-semibold text-slate-900",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CloudArrowUpIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudArrowUpIcon$3e$__["CloudArrowUpIcon"], {
                                                        className: "size-5 text-indigo-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                        lineNumber: 1038,
                                                        columnNumber: 19
                                                    }, this),
                                                    "GET /api/extract-cleanse-enrich-and-store"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 1037,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                value: s3Uri,
                                                onChange: (event)=>setS3Uri(event.target.value),
                                                placeholder: "s3://my-bucket/path/to/file.json",
                                                className: "w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 1041,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-slate-500",
                                                children: "Accepts s3://bucket/key or classpath:relative/path references that the Spring Boot service can access."
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 1047,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FeedbackPill, {
                                                feedback: s3Feedback
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 1050,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                        lineNumber: 1036,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                lineNumber: 923,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap items-center justify-between gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-lg font-semibold text-slate-900",
                                                children: "Upload History"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 1057,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative w-full max-w-xs",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$MagnifyingGlassIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MagnifyingGlassIcon$3e$__["MagnifyingGlassIcon"], {
                                                        className: "pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                        lineNumber: 1059,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "search",
                                                        placeholder: "Search coming soon",
                                                        className: "w-full cursor-not-allowed rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-400",
                                                        disabled: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                        lineNumber: 1060,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 1058,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                        lineNumber: 1056,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-4 space-y-4",
                                        children: [
                                            uploads.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500",
                                                children: "No uploads yet. Drop a JSON file to start the pipeline."
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 1071,
                                                columnNumber: 17
                                            }, this),
                                            uploads.map((upload)=>{
                                                const status = statusStyles[upload.status];
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-3",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "rounded-2xl bg-white p-2 shadow-sm",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$DocumentTextIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__DocumentTextIcon$3e$__["DocumentTextIcon"], {
                                                                        className: "size-5 text-slate-500"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                                        lineNumber: 1084,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                                    lineNumber: 1083,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-sm font-semibold text-slate-900",
                                                                            children: upload.name
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                                            lineNumber: 1087,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-xs text-slate-500",
                                                                            children: [
                                                                                new Date(upload.createdAt).toLocaleString(),
                                                                                " • ",
                                                                                upload.source
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                                            lineNumber: 1090,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                                    lineNumber: 1086,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                            lineNumber: 1082,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-3",
                                                            children: [
                                                                upload.cleansedId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                                    className: "rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-inner",
                                                                    children: upload.cleansedId
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                                    lineNumber: 1097,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", status.className),
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("size-2 rounded-full", status.dot)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                                            lineNumber: 1107,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        status.label
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                                    lineNumber: 1101,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                            lineNumber: 1095,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, upload.id, true, {
                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                    lineNumber: 1078,
                                                    columnNumber: 19
                                                }, this);
                                            })
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                        lineNumber: 1069,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                lineNumber: 1055,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                        lineNumber: 922,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs uppercase tracking-wide text-slate-400",
                                                children: "Preview"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 1121,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-lg font-semibold text-slate-900",
                                                children: "Select Items"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 1124,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-slate-500",
                                                children: "Preview is read-only. All fields will be sent forward."
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 1127,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                        lineNumber: 1120,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-semibold text-slate-600",
                                        children: [
                                            previewLeaves.length,
                                            " fields"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                        lineNumber: 1129,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                lineNumber: 1119,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$InboxStackIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__InboxStackIcon$3e$__["InboxStackIcon"], {
                                        className: "size-4 text-slate-500"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                        lineNumber: 1134,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-semibold text-slate-600",
                                        children: previewLabel
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                        lineNumber: 1135,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                lineNumber: 1133,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$MagnifyingGlassIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MagnifyingGlassIcon$3e$__["MagnifyingGlassIcon"], {
                                                className: "pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 1142,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "search",
                                                placeholder: "Search fields...",
                                                value: searchQuery,
                                                onChange: (event)=>setSearchQuery(event.target.value),
                                                className: "w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 1143,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                        lineNumber: 1141,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-4 max-h-[420px] overflow-y-auto pr-2",
                                        children: filteredTree.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500",
                                            children: "Upload a JSON payload to view its structure."
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                            lineNumber: 1153,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-3",
                                            children: renderTree(filteredTree)
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                            lineNumber: 1157,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                        lineNumber: 1151,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                lineNumber: 1140,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-6 rounded-2xl bg-slate-50 p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap items-center gap-2 text-xs text-slate-600",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-semibold text-slate-800",
                                                children: "Fields:"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 1164,
                                                columnNumber: 15
                                            }, this),
                                            previewLeaves.slice(0, 6).map((leaf)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "rounded-full bg-white px-3 py-1 font-semibold shadow-sm",
                                                    children: leaf.label
                                                }, leaf.id, false, {
                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                    lineNumber: 1166,
                                                    columnNumber: 17
                                                }, this)),
                                            previewLeaves.length > 6 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "rounded-full bg-white px-3 py-1 font-semibold shadow-sm",
                                                children: [
                                                    "+",
                                                    previewLeaves.length - 6,
                                                    " more"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                lineNumber: 1174,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                        lineNumber: 1163,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleExtractData,
                                        disabled: extracting,
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("mt-4 w-full rounded-full bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-black", extracting && "cursor-not-allowed opacity-60 hover:bg-slate-900"),
                                        children: extracting ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "inline-flex items-center justify-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowPathIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowPathIcon$3e$__["ArrowPathIcon"], {
                                                    className: "size-4 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                                    lineNumber: 1190,
                                                    columnNumber: 19
                                                }, this),
                                                "Extracting…"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                            lineNumber: 1189,
                                            columnNumber: 17
                                        }, this) : "Extract Data"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                        lineNumber: 1179,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                                lineNumber: 1162,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                        lineNumber: 1118,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
                lineNumber: 921,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Documents/GitHub/UserFlow/UserFlow/src/app/ingestion/page.tsx",
        lineNumber: 877,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__eaa922c7._.js.map