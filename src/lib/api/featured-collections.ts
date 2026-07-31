import { del, get, post, put } from "./client";
import { adminApiClient, publicApiClient } from "./axios";
import { toPageRequest, toQueryString } from "../utils/pagination";
import type {
  CreateFeaturedCollectionInput,
  FeaturedCollection,
  FeaturedCollectionPublic,
  ID,
  PaginatedList,
  SetFeaturedCollectionItemsInput,
  UpdateFeaturedCollectionInput,
} from "@/types";

/**
 * Typed client for the featured-collection endpoints. The backend
 * exposes two surfaces:
 *   - public  `GET /featured-collections` (only active sections, with
 *     items + product projection embedded)
 *   - admin   full CRUD on `/admin/featured-collections` plus a
 *     wholesale "save picker" on `PUT /admin/featured-collections/:id/items`
 *
 * The cover image is opaque from the admin side — the admin first
 * uploads it via the generic `POST /v1/admin/upload` endpoint and
 * passes the resulting `object_key` into `image_key`. The public
 * shape hands back a pre-resolved `image_url` so the storefront
 * never sees the opaque key.
 */
export const featuredCollectionsApi = {
  /* ----- public ----- */
  listPublic(): Promise<{ items: FeaturedCollectionPublic[] }> {
    return get<{ items: FeaturedCollectionPublic[] }>(publicApiClient, "/featured-collections");
  },

  /* ----- admin ----- */
  list(params: { page?: number; per_page?: number } = {}): Promise<PaginatedList<FeaturedCollection>> {
    return get<PaginatedList<FeaturedCollection>>(
      adminApiClient,
      `/admin/featured-collections${toQueryString(toPageRequest(params))}`,
    );
  },

  get(id: ID): Promise<FeaturedCollection> {
    return get<FeaturedCollection>(adminApiClient, `/admin/featured-collections/${id}`);
  },

  create(input: CreateFeaturedCollectionInput): Promise<FeaturedCollection> {
    return post<FeaturedCollection, CreateFeaturedCollectionInput>(
      adminApiClient,
      "/admin/featured-collections",
      input,
    );
  },

  update(id: ID, input: UpdateFeaturedCollectionInput): Promise<FeaturedCollection> {
    return put<FeaturedCollection, UpdateFeaturedCollectionInput>(
      adminApiClient,
      `/admin/featured-collections/${id}`,
      input,
    );
  },

  delete(id: ID): Promise<void> {
    return del<void>(adminApiClient, `/admin/featured-collections/${id}`);
  },

  /**
   * Replace the collection's product list wholesale. The admin's
   * picker order becomes the rendering order on the storefront.
   * The backend de-duplicates the product list before persisting.
   */
  setItems(id: ID, input: SetFeaturedCollectionItemsInput): Promise<FeaturedCollection> {
    return put<FeaturedCollection, SetFeaturedCollectionItemsInput>(
      adminApiClient,
      `/admin/featured-collections/${id}/items`,
      input,
    );
  },
};