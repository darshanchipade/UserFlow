module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

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
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/Documents/GitHub/UserFlow/UserFlow/src/app/api/ingestion/enrichment/result/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/UserFlow/UserFlow/node_modules/next/server.js [app-route] (ecmascript)");
;
const backendBaseUrl = process.env.SPRINGBOOT_BASE_URL;
const safeParse = (payload)=>{
    try {
        return JSON.parse(payload);
    } catch  {
        return payload;
    }
};
const pickString = (value)=>{
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
};
const toArray = (value)=>{
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
        const record = value;
        const candidates = [
            record.items,
            record.records,
            record.data,
            record.result,
            record.entries,
            record.enrichedItems,
            record.consolidatedItems,
            record.payload
        ];
        for (const candidate of candidates){
            if (Array.isArray(candidate)) {
                return candidate;
            }
        }
    }
    return [];
};
const toStringList = (value)=>{
    if (!value) return [];
    if (Array.isArray(value)) {
        return value.map((entry)=>pickString(entry)).filter((entry)=>Boolean(entry));
    }
    const asString = pickString(value);
    if (!asString) return [];
    if (asString.includes(",")) {
        return asString.split(",").map((token)=>token.trim()).filter(Boolean);
    }
    return [
        asString
    ];
};
const FIELD_KEYS = [
    "cleansedItem",
    "cleansedContent",
    "item",
    "field",
    "label",
    "title",
    "name",
    "copy",
    "original"
];
const SUMMARY_KEYS = [
    "summary",
    "aiSummary",
    "analysis",
    "description",
    "insight",
    "text",
    "content"
];
const TAG_KEYS = [
    "tags",
    "topics",
    "labels",
    "categories"
];
const SENTIMENT_KEYS = [
    "sentiments",
    "sentiment",
    "tone",
    "tones"
];
const pickFromSources = (sources, keys)=>{
    for (const key of keys){
        for (const source of sources){
            const candidate = pickString(source[key]);
            if (candidate) {
                return candidate;
            }
        }
    }
    return undefined;
};
const pickArrayFromSources = (sources, keys)=>{
    for (const key of keys){
        for (const source of sources){
            const candidate = source[key];
            const normalized = toStringList(candidate);
            if (normalized.length) {
                return normalized;
            }
        }
    }
    return [];
};
const normalizeEnrichmentDetails = (payload)=>{
    const rows = toArray(payload).map((entry, index)=>{
        if (!entry || typeof entry !== "object") return null;
        const record = entry;
        const context = typeof record.context === "object" && record.context !== null ? record.context : null;
        const metadata = typeof record.metadata === "object" && record.metadata !== null ? record.metadata : null;
        const facets = context && typeof context.facets === "object" && context.facets !== null ? context.facets : null;
        const sources = [
            record
        ];
        if (context) sources.push(context);
        if (facets) sources.push(facets);
        if (metadata) sources.push(metadata);
        const label = pickFromSources(sources, FIELD_KEYS) ?? `Item ${index + 1}`;
        const summary = pickFromSources(sources, SUMMARY_KEYS);
        const tags = pickArrayFromSources(sources, TAG_KEYS);
        const sentiments = pickArrayFromSources(sources, SENTIMENT_KEYS);
        return {
            id: pickString(record.id) ?? pickString(record.cleansedDataStoreId) ?? pickString(record.contentHash) ?? `enrichment-${index}`,
            cleansedItem: label,
            summary: summary ?? undefined,
            tags,
            sentiments
        };
    }).filter((row)=>Boolean(row));
    return rows;
};
const buildSummaryText = (details, fallback)=>{
    if (details.length) {
        return details.map((detail)=>{
            const headline = detail.cleansedItem;
            const summary = detail.summary ?? "Awaiting summary.";
            const tagsLine = detail.tags.length ? `Tags: ${detail.tags.join(", ")}` : null;
            const sentimentsLine = detail.sentiments.length ? `Sentiments: ${detail.sentiments.join(", ")}` : null;
            return [
                `${headline}: ${summary}`,
                tagsLine,
                sentimentsLine
            ].filter(Boolean).join("\n");
        }).join("\n\n");
    }
    const fallbackText = pickString(fallback);
    return fallbackText ?? undefined;
};
async function GET(request) {
    if (!backendBaseUrl) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "SPRINGBOOT_BASE_URL is not configured."
        }, {
            status: 500
        });
    }
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Missing required `id` query parameter."
        }, {
            status: 400
        });
    }
    try {
        const resultUrl = new URL(`/api/enrichment/result/${id}`, backendBaseUrl);
        const upstream = await fetch(resultUrl);
        const rawBody = await upstream.text();
        const body = safeParse(rawBody);
        const details = normalizeEnrichmentDetails(body);
        const summaryText = buildSummaryText(details, rawBody);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            upstreamStatus: upstream.status,
            upstreamOk: upstream.ok,
            details,
            summary: summaryText,
            body,
            rawBody
        }, {
            status: upstream.ok ? 200 : upstream.status
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error instanceof Error ? error.message : "Unable to reach Spring Boot enrichment result endpoint."
        }, {
            status: 502
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a64bbcba._.js.map