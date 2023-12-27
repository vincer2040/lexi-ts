
export enum Type {
    Unkown,
    Ok,
    None,
    String,
}

export type LexiData = {
    type: Type,
    data: null | string;
}

export function extractData(lexiData: LexiData): null | string {
    switch (lexiData.type) {
        case Type.Ok:
            return "OK";
        case Type.None:
            return "NONE";
        case Type.String:
            return lexiData.data;
        default:
            break;
    }
    return null;
}

