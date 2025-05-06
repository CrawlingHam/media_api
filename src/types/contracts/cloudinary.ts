import { CloudinarySignatureProps, CloudinaryUploadServiceProps } from '../props';

/**
 * Contract defining the public methods of the CookieWriter class.
 */
export declare type ICloudinarySignatureService = {
    /**
     * Retrieves a signature from the Cloudinary Lambda for secure uploads.
     * This signature is required for authenticated uploads to Cloudinary.
     *
     * @example
     * ```typescript
     * const signature = await signatureService.getSignature({
     *   file: imageFile
     * });
     * // Returns: "upload_preset=preset&signature=abc&timestamp=123&api_key=xyz"
     * ```
     *
     * @throws {Error} When Lambda response is invalid
     * @throws {Error} When Lambda returns an error
     * @returns {Promise<string>} URLSearchParams string containing upload parameters
     */
    getSignature: (props: CloudinarySignatureProps) => Promise<string>;
};

/**
 * Contract defining the public methods of the CookieWriter class.
 */
export declare type ICloudinaryUploadService = {
    /**
     * Main upload method that handles file uploads to Cloudinary.
     * Supports different types of uploads (eg. image, video, etc.)
     *
     * @example
     * ```typescript
     * const result = await cloudinaryService.upload({
     *   file: imageFile,
     *   operation: 'image'
     * });
     * // Returns: "https://res.cloudinary.com/..."
     * ```
     *
     * @throws {Error} When file or operation is missing
     * @throws {Error} When operation is invalid
     * @throws {Error} When upload fails (with detailed message from Cloudinary)
     * @returns {Promise<string>} The secure URL of the uploaded file
     */
    upload: (props: CloudinaryUploadServiceProps) => Promise<string>;
};
