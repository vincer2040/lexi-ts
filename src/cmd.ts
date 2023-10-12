import { LexiValue } from "./lexitypes";

export enum CmdType {
    Ping,
    Set,
    Get,
    Del,
    Keys,
    Values,
    Entries,
    Push,
    Pop,
    Enque,
    Deque,
    ClusterNew,
    ClusterDrop,
    ClusterSet,
    ClusterGet,
    ClusterDel,
    ClusterKeys,
    ClusterValues,
    ClusterEntries,
    ClusterPush,
    ClusterPop,
};

export type SetCmd = {
    key: string,
    value: LexiValue,
};

export type GetCmd = {
    key: string,
};

export type DelCmd = GetCmd;

export type PushCmd = {
    value: LexiValue,
};

export type EnqueCmd = {
    value: LexiValue,
};

export type ClusterNewCmd = {
    name: string,
};

export type ClusterDropCmd = ClusterNewCmd;

export type ClusterSetCmd = {
    name: string,
    key: string,
    value: LexiValue,
};

export type ClusterGetCmd = {
    name: string,
    key: string,
};

export type ClusterDelCmd = ClusterGetCmd;

export type ClusterPushCmd = {
    name: string,
    value: LexiValue,
};

export type ClusterPopCmd = {
    name: string,
};

export type ClusterKeysCmd = ClusterNewCmd;

export type ClusterValuesCmd = ClusterNewCmd;

export type ClusterEntriesCmd = ClusterNewCmd;

export type Command = {
    type: CmdType,
    cmd: SetCmd | GetCmd | DelCmd | PushCmd | EnqueCmd | ClusterNewCmd |
        ClusterDropCmd | ClusterSetCmd | ClusterGetCmd | ClusterDelCmd |
        ClusterKeysCmd | ClusterValuesCmd | ClusterEntriesCmd | null;
};

