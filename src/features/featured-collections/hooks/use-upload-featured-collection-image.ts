"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApiClient } from "@/lib/api/axios";

/**
 * Wire shape returned by the generic `POST /v1/admin/upload` endpoint.
 * The backend hands back both the opaque `object_key` (which the
 * caller persists on its own resource) and the public `url` (for
 * immediate preview).
 *
 * Mirrors `lib/api/products.ProductUploadOutput`; duplicated here so
 * this hook doesn't have to import from a sibling feature module.
 */
interface FeaturedCollectionUploadOutput {
  object_key: string;
  url: string;
  content_type: string;
  size: number;
  original_name: string;
}

/**
 * `useUploadFeaturedCollectionImage` — POST /v1/admin/upload.
 *
 * Mirrors the banner pattern: the admin picks a file in the form,
 * we upload it via the generic multipart endpoint, and the resulting
 * `object_key` is what we persist on the collection row.
 *
 * The 30 MB ceiling (matching the product-image rule) is enforced by
 * the browser via the `accept` attribute + manual file-size check
 * in the upload widget; the server enforces the same limit.
 */
export function useUploadFeaturedCollectionImage() {
  return useMutation<FeaturedCollectionUploadOutput, Error, File>({
    mutationFn: async (file) => {
      const form = new FormData();
      form.append("file", file);
      // The shared `post()` helper always targets the public client.
      // Featured-collection uploads require the admin JWT so we drop
      // down to `adminApiClient.post` directly and unwrap manually.
      //
      // Do NOT pass a static `Content-Type` here: axios sets the
      // proper `multipart/form-data; boundary=...` from the FormData
      // body, and overriding that header at the call site in axios
      // 1.6+ wipes the `Authorization` header attached by the
      // instance's request interceptor.
      const response = await adminApiClient.post<{
        data: FeaturedCollectionUploadOutput;
      }>("/admin/upload", form);
      return response.data.data;
    },
    onError: (error) => {
      toast.error("Không thể tải ảnh lên", {
        description: error.message,
      });
    },
  });
}