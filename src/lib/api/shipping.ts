import { del, get, patch, post, put } from "./client";
import { adminApiClient } from "./axios";
import type {
  CreateShipmentInput,
  ID,
  Shipment,
  ShippingStats,
  UpdateShipmentInput,
} from "@/types";

/**
 * Shipping API — admin surface under `/admin/shipping`. The backend
 * owns shipments, carriers, and shipping rates. Status updates are
 * PATCHed so a single change only re-renders the affected row.
 */
export const shippingApi = {
  list(): Promise<{ items: Shipment[] }> {
    return get<{ items: Shipment[] }>(adminApiClient, "/admin/shipping");
  },

  stats(): Promise<ShippingStats> {
    return get<ShippingStats>(adminApiClient, "/admin/shipping/stats");
  },

  get(id: ID): Promise<Shipment> {
    return get<Shipment>(adminApiClient, `/admin/shipping/${id}`);
  },

  create(input: CreateShipmentInput): Promise<Shipment> {
    return post<Shipment, CreateShipmentInput>(adminApiClient, "/admin/shipping", input);
  },

  update(id: ID, input: UpdateShipmentInput): Promise<Shipment> {
    return patch<Shipment, UpdateShipmentInput>(adminApiClient, `/admin/shipping/${id}`, input);
  },

  /** Convenience for swapping the carrier on a single shipment. */
  setCarrier(id: ID, carrier: Shipment["carrier"]): Promise<Shipment> {
    return put<Shipment, { carrier: Shipment["carrier"] }>(
      adminApiClient,
      `/admin/shipping/${id}/carrier`,
      { carrier },
    );
  },

  delete(id: ID): Promise<void> {
    return del<void>(adminApiClient, `/admin/shipping/${id}`);
  },
};