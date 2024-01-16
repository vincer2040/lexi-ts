
export enum Type {
    Unkown,
    Ok,
    None,
    String,
    Int,
    Double,
}

export type LexiDataT = null | string | number;

export type LexiData = {
    type: Type,
    data: LexiDataT,
}

export function extractData(lexiData: LexiData): LexiDataT {
    switch (lexiData.type) {
        case Type.Ok:
            return "OK";
        case Type.None:
            return "NONE";
        case Type.String:
            return lexiData.data;
        case Type.Int:
            return lexiData.data;
        case Type.Double:
            return lexiData.data;
        default:
            break;
    }
    return null;
}

