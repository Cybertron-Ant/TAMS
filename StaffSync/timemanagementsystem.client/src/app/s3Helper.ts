import { fetchWithAuth } from "./fetchWrapper";

export interface UploadResult {
  file: File;
  success: boolean;
  previewUrl?: string;
  error?: string;
}
const API_URL = import.meta.env.VITE_TMS_S3_URL;

export const uploadToS3 = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetchWithAuth(`${API_URL}/S3/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file to S3");
    }

    const result = await response.json();

    const uploadResult: UploadResult = {
      file,
      success: Boolean(result.previewUrl),
      previewUrl: result.previewUrl,
      error: !result.previewUrl
        ? "Preview URL is missing in the response."
        : undefined,
    };

    return uploadResult;
  } catch (error) {
    console.error("Error uploading file to S3:", error);

    const uploadResult: UploadResult = {
      file,
      success: false,
      error: "Failed to upload file to S3.",
    };

    return uploadResult;
  }
};
