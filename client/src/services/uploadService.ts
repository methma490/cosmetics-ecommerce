import api from "./api";

export interface UploadResponse {
  success: boolean;
  message?: string;
  urls: string[];
  images?: Array<{ url: string; publicId: string }>;
}

export const uploadService = {
  /**
   * Upload one or more image files to Cloudinary via backend
   */
  uploadImages: async (
    files: File[],
    folder: string = "cosmetics_ecommerce/products"
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    if (folder) {
      formData.append("folder", folder);
    }

    const response = await api.post<UploadResponse>("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};

export default uploadService;
