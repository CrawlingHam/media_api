export type SuccessResponse = {
    message: string;
};

export type SuccessResponseWithData<T> = {
    [key: string]: T;
};
