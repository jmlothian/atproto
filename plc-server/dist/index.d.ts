import * as plc from '@did-plc/server';
export declare type CloseFn = () => Promise<void>;
export declare type PlcConfig = {
    port?: number;
    version?: string;
};
declare type ServerInfo = {
    port: number;
    url: string;
    close: CloseFn;
};
export declare type PlcServerInfo = ServerInfo & {
    ctx: plc.AppContext;
};
export declare const runPlc: (cfg: PlcConfig) => Promise<PlcServerInfo>;
export {};
