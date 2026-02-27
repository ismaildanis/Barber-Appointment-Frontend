import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gameApi } from "../api/gameApi";

const key = ["game"] as const;

export const useSpinWheel = (slug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => gameApi.spinWheel(slug),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: key });
      await queryClient.invalidateQueries({ queryKey: [key, slug, "last-spin"] });
    },
  });
};

export const useGetLastSpin = (slug: string) => {
  return useQuery({
    queryKey: [key, slug, "last-spin"],
    queryFn: () => gameApi.lastSpin(slug),
    staleTime: 5 * 60 * 1000,
    enabled: !!slug,
  });
};
