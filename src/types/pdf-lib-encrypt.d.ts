declare module "pdf-lib-encrypt" {
  /**
   * Provide the pdf-lib module once before calling lock()/unlockInPlace().
   */
  export function configure(pdfLib: typeof import("pdf-lib")): void;

  /**
   * Encrypt a plaintext PDF document and return AES-256 protected bytes.
   * @param plainBytes - The raw PDF bytes to encrypt
   * @param password - The user/owner password to protect with
   * @param opts - Optional settings
   */
  export function lock(
    plainBytes: Uint8Array | Buffer,
    password: string,
    opts?: { algo?: "aes256" | "rc4"; permissions?: number },
  ): Promise<Uint8Array>;

  /**
   * Remove encryption from a loaded (ignoreEncryption) document, in place.
   * Returns false if the doc isn't encrypted; throws on a wrong password.
   */
  export function unlockInPlace(
    doc: import("pdf-lib").PDFDocument,
    password: string,
  ): Promise<boolean>;
}