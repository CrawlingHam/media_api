import { Response } from 'express';

export declare type CloudinarySignatureProps = {
    formData: FormData;
};

export declare type initialAppendToFormDataProps = CloudinarySignatureProps & {
    uploadPreset: string;
};

export declare type ExtractFormDataResult = {
    upload_preset: string;
    signature: string;
    timestamp: string;
    apiKey: string;
};

export declare type PostAppendToFormDataProps = CloudinarySignatureProps & {
    body: string;
};

export declare type UploadImageProps = PostAppendToFormDataProps;

export declare type CloudinaryUploadServiceOperation = 'image';

export declare type CloudinaryUploadServiceProps = UploadImageProps & {
    operation: CloudinaryUploadServiceOperation;
};

export declare type CloudinaryUploadProps = Omit<CloudinaryUploadServiceProps, 'body'> & {
    res: Response;
};

export declare type CloudinaryExecution = 'upload';

export declare type CloudinaryExecuteProps = CloudinaryUploadProps & {
    execution: CloudinaryExecution;
};
