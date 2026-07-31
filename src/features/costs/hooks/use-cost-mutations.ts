"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query";
import { costsApi } from "../api";
import type {
  Cost,
  CreateCostInput,
  ID,
  UpdateCostInput,
} from "@/types";

export function useCreateCost() {
  const queryClient = useQueryClient();
  return useMutation<Cost, Error, CreateCostInput>({
    mutationFn: (input) => costsApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.costs.all() });
      toast.success("Đã tạo khoản chi phí");
    },
    onError: (error) => {
      toast.error("Không thể tạo khoản chi phí", {
        description: error.message,
      });
    },
  });
}

export function useUpdateCost() {
  const queryClient = useQueryClient();
  return useMutation<Cost, Error, { id: ID; input: UpdateCostInput }>({
    mutationFn: ({ id, input }) => costsApi.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.costs.all() });
      toast.success("Đã cập nhật khoản chi phí");
    },
    onError: (error) => {
      toast.error("Không thể cập nhật khoản chi phí", {
        description: error.message,
      });
    },
  });
}

export function useDeleteCost() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, ID>({
    mutationFn: (id) => costsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.costs.all() });
      toast.success("Đã xoá khoản chi phí");
    },
    onError: (error) => {
      toast.error("Không thể xoá khoản chi phí", {
        description: error.message,
      });
    },
  });
}