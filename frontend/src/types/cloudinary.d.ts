export interface CloudinaryWidget {
  open: () => void;
  close: () => void;
}

export interface CloudinaryResult {
  event: string;
  info: {
    secure_url: string;
  };
}

export interface Cloudinary {
  createUploadWidget: (
    options: object,
    callback: (error: unknown, result: CloudinaryResult) => void
  ) => CloudinaryWidget;
}

declare global {
  interface Window {
    cloudinary: Cloudinary;
  }
}
