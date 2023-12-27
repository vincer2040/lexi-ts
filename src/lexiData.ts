
export enum Type {
    Unkown,
    OK,
    String,
}

export type LexiData = {
    type: Type,
    data: null | string;
}
