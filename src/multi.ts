import Lexi from "./lexi";
import { CmdType, type Command } from "./cmd";
import { LexiTypes, type LexiVal } from "./lexitypes";
import type { SetCmd, GetCmd, PushCmd, EnqueCmd, ClusterNewCmd, ClusterSetCmd,
    ClusterGetCmd, ClusterDelCmd, DelCmd, ClusterValuesCmd, ClusterPushCmd,
    ClusterPopCmd, ClusterKeysCmd, ClusterEntriesCmd, ClusterDropCmd
} from "./cmd";
import { Parser } from "./parser";

export class Multi {
    private client: Lexi;
    private commands: Command[];
    constructor(c: Lexi) {
        this.client = c;
        this.commands = [];
    }

    public addPing(): Multi {
        let cmd = { type: CmdType.Ping, cmd: null };
        this.commands.push(cmd);
        return this;
    }

    public addSet(key: string, value: string): Multi {
        let setCmd: SetCmd = { key, value: { type: LexiTypes.bulk, value } };
        let cmd: Command = { type: CmdType.Set, cmd: setCmd };
        this.commands.push(cmd);
        return this;
    }

    public addGet(key: string): Multi {
        let getCmd: GetCmd = { key };
        let cmd: Command = { type: CmdType.Get, cmd: getCmd };
        this.commands.push(cmd);
        return this;
    }

    public addDel(key: string): Multi {
        let delCmd: DelCmd = { key };
        let cmd: Command = { type: CmdType.Del, cmd: delCmd };
        this.commands.push(cmd);
        return this;
    }

    public addPush(value: string): Multi {
        let pushCmd: PushCmd = { value: { type: LexiTypes.bulk, value } };
        let cmd: Command = { type: CmdType.Push, cmd: pushCmd };
        this.commands.push(cmd);
        return this;
    }

    public addPop(): Multi {
        let cmd: Command = { type: CmdType.Pop, cmd: null };
        this.commands.push(cmd);
        return this;
    }

    public addEnque(value: string): Multi {
        let pushCmd: EnqueCmd = { value: { type: LexiTypes.bulk, value } };
        let cmd: Command = { type: CmdType.Enque, cmd: pushCmd };
        this.commands.push(cmd);
        return this;
    }

    public addDeque(): Multi {
        let cmd: Command = { type: CmdType.Deque, cmd: null };
        this.commands.push(cmd);
        return this;
    }

    public addKeys(): Multi {
        let cmd: Command = { type: CmdType.Keys, cmd: null };
        this.commands.push(cmd);
        return this;
    }

    public addValues(): Multi {
        let cmd: Command = { type: CmdType.Values, cmd: null };
        this.commands.push(cmd);
        return this;
    }

    public addEntries(): Multi {
        let cmd: Command = { type: CmdType.Entries, cmd: null };
        this.commands.push(cmd);
        return this;
    }

    public addClusterNew(name: string): Multi {
        let clusterNewCmd: ClusterNewCmd = { name };
        let cmd: Command = { type: CmdType.ClusterNew, cmd: clusterNewCmd };
        this.commands.push(cmd);
        return this;
    }

    public addClusterDrop(name: string): Multi {
        let clusterDropCmd: ClusterDropCmd = { name };
        let cmd: Command = { type: CmdType.ClusterDrop, cmd: clusterDropCmd };
        this.commands.push(cmd);
        return this;
    }

    public addClusterPush(name: string, value: string): Multi {
        let clusterPushCmd: ClusterPushCmd = { name, value: { type: LexiTypes.bulk, value }};
        let cmd: Command = { type: CmdType.ClusterPush, cmd: clusterPushCmd };
        this.commands.push(cmd);
        return this;
    }

    public addClusterSet(name: string, key: string, value: string): Multi {
        let clusterSetCmd: ClusterSetCmd = { name, key, value: { type: LexiTypes.bulk, value } };
        let cmd: Command = { type: CmdType.ClusterSet, cmd: clusterSetCmd };
        this.commands.push(cmd);
        return this;
    }

    public addClusterGet(name: string, key: string): Multi {
        let clusterGetCmd: ClusterGetCmd = { name, key };
        let cmd: Command = { type: CmdType.ClusterGet, cmd: clusterGetCmd };
        this.commands.push(cmd);
        return this;
    }

    public addClusterDel(name: string, key: string): Multi {
        let clusterDelCmd: ClusterDelCmd = { name, key };
        let cmd: Command = { type: CmdType.ClusterDel, cmd: clusterDelCmd };
        this.commands.push(cmd);
        return this;
    }

    public clusterKeys(name: string): Multi {
        let clusterKeysCmd: ClusterKeysCmd = { name };
        let cmd: Command = { type: CmdType.ClusterKeys, cmd: clusterKeysCmd };
        this.commands.push(cmd);
        return this;
    }

    public clusterValues(name: string): Multi {
        let clusterValuesCmd: ClusterValuesCmd = { name };
        let cmd: Command = { type: CmdType.ClusterValues, cmd: clusterValuesCmd };
        this.commands.push(cmd);
        return this;
    }

    public clusterEntries(name: string): Multi {
        let clusterEntriesCmd: ClusterEntriesCmd = { name };
        let cmd: Command = { type: CmdType.ClusterEntries, cmd: clusterEntriesCmd };
        this.commands.push(cmd);
        return this;
    }

    public async done(): Promise<LexiVal> {
        let buf = this.buildCmd();
        await this.client.send(buf);
        let d = await this.client.read();
        let p = new Parser(d);
        return p.parse().value;
    }

    private buildCmd(): [Buffer, number] {
        let len = this.commands.length;
        let i: number;
        this.client.builder.reset().addArr(len);
        for (i = 0; i < len; ++i) {
            let cmd = this.commands[i];
            this.addCmd(cmd);
        }

        return this.client.builder.out();
    }

    private addCmd(cmd: Command) {
        switch (cmd.type) {
            case CmdType.Ping:
                this.client.builder.addPing();
                break;
            case CmdType.Set: {
                let setCmd = cmd.cmd as SetCmd;
                let key = setCmd.key;
                let val = setCmd.value;
                this.client.builder
                    .addArr(3)
                    .addBulk("SET")
                    .addBulk(key);
                if (val.type === LexiTypes.bulk) {
                    let value = val.value as string;
                    this.client.builder.addBulk(value);
                } else if (val.type === LexiTypes.int) {
                    let value = val.value as number;
                    this.client.builder.add64BitInt(BigInt(value));
                }
            } break;
            case CmdType.Get: {
                let getCmd = cmd.cmd as GetCmd;
                let key = getCmd.key;
                this.client.builder
                    .addArr(2)
                    .addBulk("GET")
                    .addBulk(key);
            } break;
            case CmdType.Del: {
                let delCmd = cmd.cmd as DelCmd;
                let key = delCmd.key;
                this.client.builder
                    .addArr(2)
                    .addBulk("DEL")
                    .addBulk(key);
            } break;
            case CmdType.Push: {
                let pushCmd = cmd.cmd as PushCmd;
                let val = pushCmd.value;
                this.client.builder
                    .addArr(2)
                    .addBulk("PUSH");
                if (val.type === LexiTypes.bulk) {
                    let value = val.value as string;
                    this.client.builder.addBulk(value);
                } else if (val.type === LexiTypes.int) {
                    let value = val.value as number;
                    this.client.builder.add64BitInt(BigInt(value));
                }
            } break;
            case CmdType.Pop: {
                this.client.builder.addBulk("POP");
            } break;
            case CmdType.Enque: {
                let enqueCmd = cmd.cmd as EnqueCmd;
                let val = enqueCmd.value;
                this.client.builder
                    .addArr(2)
                    .addBulk("ENQUE");
                if (val.type === LexiTypes.bulk) {
                    let value = val.value as string;
                    this.client.builder.addBulk(value);
                } else if (val.type === LexiTypes.int) {
                    let value = val.value as number;
                    this.client.builder.add64BitInt(BigInt(value));
                }
            } break;
            case CmdType.Deque: {
                this.client.builder.addBulk("POP");
            } break;
            case CmdType.Keys: {
                this.client.builder.addBulk("KEYS");
            } break;
            case CmdType.Values: {
                this.client.builder.addBulk("VALUES");
            } break;
            case CmdType.Entries: {
                this.client.builder.addBulk("ENTRIES");
            } break;
            case CmdType.ClusterNew: {
                let clusterNewCmd = cmd.cmd as ClusterNewCmd;
                let name = clusterNewCmd.name;
                this.client.builder
                    .addArr(2)
                    .addBulk("CLUSTER.NEW")
                    .addBulk(name);
            } break;
            case CmdType.ClusterDrop: {
                let clusterNewCmd = cmd.cmd as ClusterNewCmd;
                let name = clusterNewCmd.name;
                this.client.builder
                    .addArr(2)
                    .addBulk("CLUSTER.DROP")
                    .addBulk(name);
            } break;
            case CmdType.ClusterSet: {
                let clusterSetCmd = cmd.cmd as ClusterSetCmd;
                let name = clusterSetCmd.name;
                let key = clusterSetCmd.key;
                let val = clusterSetCmd.value;
                this.client.builder
                    .addArr(4)
                    .addBulk("CLUSTER.SET")
                    .addBulk(name)
                    .addBulk(key);
                if (val.type === LexiTypes.bulk) {
                    let value = val.value as string;
                    this.client.builder.addBulk(value);
                } else if (val.type === LexiTypes.int) {
                    let value = val.value as number;
                    this.client.builder.add64BitInt(BigInt(value));
                }
            } break;
            case CmdType.ClusterGet: {
                let clusterGetCmd = cmd.cmd as ClusterGetCmd;
                let name = clusterGetCmd.name;
                let key = clusterGetCmd.key;
                this.client.builder
                    .addArr(3)
                    .addBulk("CLUSTER.GET")
                    .addBulk(name)
                    .addBulk(key);
            } break;
            case CmdType.ClusterDel: {
                let clusterDelCmd = cmd.cmd as ClusterDelCmd;
                let name = clusterDelCmd.name;
                let key = clusterDelCmd.key;
                this.client.builder
                    .addArr(3)
                    .addBulk("CLUSTER.DEL")
                    .addBulk(name)
                    .addBulk(key);
            } break;
            case CmdType.ClusterPush: {
                let clusterPushCmd = cmd.cmd as ClusterPushCmd;
                let name = clusterPushCmd.name;
                let val = clusterPushCmd.value;
                this.client.builder
                    .addArr(3)
                    .addBulk("CLUSTER.PUSH")
                    .addBulk(name);
                if (val.type === LexiTypes.bulk) {
                    let value = val.value as string;
                    this.client.builder.addBulk(value);
                } else if (val.type === LexiTypes.int) {
                    let value = val.value as number;
                    this.client.builder.add64BitInt(BigInt(value));
                }
            } break;
            case CmdType.ClusterPop: {
                let clusterPopCmd = cmd.cmd as ClusterPopCmd;
                let name = clusterPopCmd.name;
                this.client.builder
                    .addArr(2)
                    .addBulk("CLUSTER.POP")
                    .addBulk(name);
            } break;
            case CmdType.ClusterKeys: {
                let clusterKeysCmd = cmd.cmd as ClusterKeysCmd;
                let name = clusterKeysCmd.name;
                this.client.builder
                    .addArr(2)
                    .addBulk("CLUSTER.KEYS")
                    .addBulk(name);
            } break;
            case CmdType.ClusterValues: {
                let clusterValuesCmd = cmd.cmd as ClusterValuesCmd;
                let name = clusterValuesCmd.name;
                this.client.builder
                    .addArr(2)
                    .addBulk("CLUSTER.VALUES")
                    .addBulk(name);
            } break;
            case CmdType.ClusterEntries: {
                let clusterEntriesCmd = cmd.cmd as ClusterEntriesCmd;
                let name = clusterEntriesCmd.name;
                this.client.builder
                    .addArr(2)
                    .addBulk("CLUSTER.ENTRIES")
                    .addBulk(name);
            } break;
        }
    }
}
