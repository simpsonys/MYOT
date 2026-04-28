var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// ── Helpers ────────────────────────────────────────────────────────────
function readBody(req) {
    return new Promise(function (resolve, reject) {
        var data = '';
        req.on('data', function (chunk) { data += chunk.toString(); });
        req.on('end', function () { return resolve(data); });
        req.on('error', reject);
    });
}
function send(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
}
function extractJson(text) {
    var trimmed = text.trim();
    var fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    return fenced ? fenced[1].trim() : trimmed;
}
// ── Dev API plugin ─────────────────────────────────────────────────────
// Intercepts /api/gemini and /api/theme in `npm run dev` so the full
// AI pipeline works without needing `vercel dev`.
// GoogleGenerativeAI is imported dynamically to avoid top-level ESM
// resolution issues in the Vite config loader.
function devApiPlugin(env) {
    return {
        name: 'dev-api',
        configureServer: function (server) {
            var _this = this;
            // /api/gemini — main LLM widget orchestration
            server.middlewares.use(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                var body, _a, _b, userInput, currentLayout, reqMode, dryRun, buildSystemPrompt, listPrimitives, primitives, systemPrompt, apiKey, GoogleGenerativeAI, modelId, genAI, model, userPrompt, started, result, e_1, msg, fallback, text, duration, parsed, e_2;
                var _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            if (!((_c = req.url) === null || _c === void 0 ? void 0 : _c.startsWith('/api/gemini')) || req.method !== 'POST')
                                return [2 /*return*/, next()];
                            _f.label = 1;
                        case 1:
                            _f.trys.push([1, 13, , 14]);
                            _b = (_a = JSON).parse;
                            return [4 /*yield*/, readBody(req)];
                        case 2:
                            body = _b.apply(_a, [(_f.sent()) || '{}']);
                            userInput = body.userInput, currentLayout = body.currentLayout, reqMode = body.mode, dryRun = body.dryRun;
                            return [4 /*yield*/, server.ssrLoadModule('/src/runtime/orchestrator.ts')];
                        case 3:
                            buildSystemPrompt = (_f.sent()).buildSystemPrompt;
                            return [4 /*yield*/, server.ssrLoadModule('/src/primitives/registry.ts')];
                        case 4:
                            listPrimitives = (_f.sent()).listPrimitives;
                            primitives = listPrimitives();
                            systemPrompt = buildSystemPrompt(primitives);
                            if (dryRun) {
                                return [2 /*return*/, send(res, 200, { kind: 'dry_run', systemPromptPreview: systemPrompt, primitiveCount: primitives.length })];
                            }
                            apiKey = env.GEMINI_API_KEY;
                            if (!apiKey)
                                return [2 /*return*/, send(res, 500, { kind: 'error', message: 'GEMINI_API_KEY not set in .env.local' })];
                            return [4 /*yield*/, import('@google/generative-ai')];
                        case 5:
                            GoogleGenerativeAI = (_f.sent()).GoogleGenerativeAI;
                            modelId = env.GEMINI_MODEL || 'gemini-2.5-flash';
                            genAI = new GoogleGenerativeAI(apiKey);
                            model = genAI.getGenerativeModel({
                                model: modelId,
                                systemInstruction: systemPrompt,
                                generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
                            });
                            userPrompt = [
                                '# Current TV State',
                                JSON.stringify(currentLayout !== null && currentLayout !== void 0 ? currentLayout : { theme: {}, widgets: [] }, null, 2),
                                '',
                                '# Mode',
                                reqMode === 'recommend' ? 'User wants 3 recommended layouts.' : 'Decide the best response kind (compose_widget / mutate_widget / layout / emit_event).',
                                '',
                                "# User's Utterance",
                                userInput,
                            ].join('\n');
                            started = Date.now();
                            result = void 0;
                            _f.label = 6;
                        case 6:
                            _f.trys.push([6, 8, , 12]);
                            return [4 /*yield*/, model.generateContent(userPrompt)];
                        case 7:
                            result = _f.sent();
                            return [3 /*break*/, 12];
                        case 8:
                            e_1 = _f.sent();
                            msg = (_d = e_1.message) !== null && _d !== void 0 ? _d : '';
                            if (!(msg.includes('503') && modelId === 'gemini-2.5-flash')) return [3 /*break*/, 10];
                            fallback = genAI.getGenerativeModel({
                                model: 'gemini-2.0-flash',
                                systemInstruction: systemPrompt,
                                generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
                            });
                            return [4 /*yield*/, fallback.generateContent(userPrompt)];
                        case 9:
                            result = _f.sent();
                            return [3 /*break*/, 11];
                        case 10: throw e_1;
                        case 11: return [3 /*break*/, 12];
                        case 12:
                            text = result.response.text();
                            duration = Date.now() - started;
                            parsed = void 0;
                            try {
                                parsed = JSON.parse(extractJson(text));
                            }
                            catch (_g) {
                                return [2 /*return*/, send(res, 200, { kind: 'error', message: 'AI returned invalid JSON', raw: text })];
                            }
                            parsed._trace = { durationMs: duration, rawResponse: text };
                            return [2 /*return*/, send(res, 200, parsed)];
                        case 13:
                            e_2 = _f.sent();
                            return [2 /*return*/, send(res, 500, { kind: 'error', message: (_e = e_2.message) !== null && _e !== void 0 ? _e : 'Unknown error' })];
                        case 14: return [2 /*return*/];
                    }
                });
            }); });
            // /api/theme — proxy to the actual Vercel handler via ssrLoadModule
            // This ensures TMDB + Gemini Vision logic runs identically in dev.
            server.middlewares.use(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                var _i, _a, _b, k, v, bodyStr, webReq, themeHandler, webRes, text, e_3;
                var _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            if (!((_c = req.url) === null || _c === void 0 ? void 0 : _c.startsWith('/api/theme')) || req.method !== 'POST')
                                return [2 /*return*/, next()];
                            _e.label = 1;
                        case 1:
                            _e.trys.push([1, 6, , 7]);
                            // Inject .env.local vars into process.env so the handler finds them
                            for (_i = 0, _a = Object.entries(env); _i < _a.length; _i++) {
                                _b = _a[_i], k = _b[0], v = _b[1];
                                if (!process.env[k])
                                    process.env[k] = v;
                            }
                            return [4 /*yield*/, readBody(req)];
                        case 2:
                            bodyStr = _e.sent();
                            webReq = new Request('http://localhost/api/theme', {
                                method: 'POST',
                                headers: { 'content-type': 'application/json' },
                                body: bodyStr,
                            });
                            return [4 /*yield*/, server.ssrLoadModule('/api/theme.ts')];
                        case 3:
                            themeHandler = (_e.sent()).default;
                            return [4 /*yield*/, themeHandler(webReq)];
                        case 4:
                            webRes = _e.sent();
                            return [4 /*yield*/, webRes.text()];
                        case 5:
                            text = _e.sent();
                            res.writeHead(webRes.status, { 'Content-Type': 'application/json' });
                            res.end(text);
                            return [3 /*break*/, 7];
                        case 6:
                            e_3 = _e.sent();
                            return [2 /*return*/, send(res, 500, { error: (_d = e_3.message) !== null && _d !== void 0 ? _d : 'Unknown error' })];
                        case 7: return [2 /*return*/];
                    }
                });
            }); });
        },
    };
}
// ── Vite config ────────────────────────────────────────────────────────
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react(), devApiPlugin(env)],
        server: { port: 5173 },
    };
});
