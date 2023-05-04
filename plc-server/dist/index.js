"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPlc = void 0;
const express_1 = __importDefault(require("express"));
const plc = __importStar(require("@did-plc/server"));
const app = (0, express_1.default)();
const port = 8080;
const runPlc = async (cfg) => {
    const db = plc.Database.postgres({ url: "postgresql://pgbskyadmin:%40uz0%40m4zvnz%23u%5EDEFiuLzH2MP0Nfn%25%5E%5E6n6q8epV@bluesky.postgres.database.azure.com:5432/plc?sslmode==prefer" });
    await db.migrateToLatestOrThrow();
    const server = plc.PlcServer.create({ db, ...cfg });
    const listener = await server.start();
    const port = listener.address().port;
    const url = `http://localhost:${port}`;
    return {
        port,
        url,
        ctx: server.ctx,
        close: async () => {
            await server.destroy();
        },
    };
};
exports.runPlc = runPlc;
app.get('/', (req, res) => {
    res.send('Hello World!');
});
(0, exports.runPlc)({ port: 8080 });
//# sourceMappingURL=index.js.map