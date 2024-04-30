
export enum DataType {
    Illegal,
    String,
    Integer,
    Double,
    Error,
    Array,
}

export type LexiData = {
    type: DataType.Illegal,
    data: string,
} | {
    type: DataType.String,
    data: string,
} | {
    type: DataType.Integer,
    data: number,
} | {
    type: DataType.Double,
    data: number,
} | {
    type: DataType.Error,
    data: string,
} | {
    type: DataType.Array,
    data: LexiData[],
};
