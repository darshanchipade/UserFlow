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
"[project]/Documents/GitHub/UserFlow/UserFlow/src/app/api/ingestion/cleansed-items/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
const isRecord = (value)=>{
    return typeof value === "object" && value !== null;
};
const pickFromSources = (sources, keys, forbiddenValues)=>{
    for (const key of keys){
        if (!key) continue;
        for (const source of sources){
            const candidate = pickString(source[key]);
            if (!candidate) continue;
            if (forbiddenValues?.some((forbiddenValue)=>forbiddenValue && candidate.trim() === forbiddenValue.trim())) {
                continue;
            }
            return candidate;
        }
    }
    return undefined;
};
const normalizeItems = (payload)=>{
    const extractRawItems = ()=>{
        if (Array.isArray(payload)) return payload;
        if (isRecord(payload)) {
            if (Array.isArray(payload.items)) return payload.items;
            if (Array.isArray(payload.records)) return payload.records;
            if (Array.isArray(payload.data)) return payload.data;
        }
        return [];
    };
    const FIELD_KEYS = [
        "field",
        "label",
        "key",
        "name",
        "originalFieldName",
        "fieldName",
        "itemType"
    ];
    const ORIGINAL_KEYS = [
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
    const CLEANSED_KEYS = [
        "cleansedValue",
        "cleanedValue",
        "normalizedValue",
        "after",
        "output",
        "valueAfter",
        "value",
        "cleansedContent",
        "cleansedCopy"
    ];
    return extractRawItems().map((item, index)=>{
        if (!isRecord(item)) return null;
        const context = isRecord(item.context) ? item.context : undefined;
        const facets = context && isRecord(context.facets) ? context.facets : undefined;
        const sources = [
            item
        ];
        if (context) sources.push(context);
        if (facets) sources.push(facets);
        const field = pickFromSources(sources, FIELD_KEYS) ?? `Item ${index + 1}`;
        const original = pickFromSources(sources, ORIGINAL_KEYS, field ? [
            field
        ] : undefined);
        const cleansed = pickFromSources(sources, CLEANSED_KEYS, field ? [
            field
        ] : undefined);
        return {
            id: pickString(item.id) ?? pickString(item.contentHash) ?? `row-${index}`,
            field,
            original: original ?? null,
            cleansed: cleansed ?? null
        };
    }).filter((row)=>Boolean(row));
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
        const targetUrl = new URL(`/api/cleansed-items/${id}`, backendBaseUrl);
        const upstream = await fetch(targetUrl);
        const rawBody = await upstream.text();
        const body = safeParse(rawBody);
        const items = normalizeItems(body);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            upstreamStatus: upstream.status,
            upstreamOk: upstream.ok,
            items,
            rawBody
        }, {
            status: upstream.ok ? 200 : upstream.status
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$UserFlow$2f$UserFlow$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error instanceof Error ? error.message : "Unable to reach Spring Boot backend."
        }, {
            status: 502
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d77e7dec._.js.map