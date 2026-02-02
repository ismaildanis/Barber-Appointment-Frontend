import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shopApi } from "../api/shopApi";

const key = ["shop"] as const;

export const useGetShops = () =>
    useQuery({
        queryKey: key,
        queryFn: () => shopApi.getShops(),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });

export const useUploadShopImage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => shopApi.uploadShopImage(formData),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key });
        },
    })
}

export const useDeleteShopImage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => shopApi.deleteShopImage(),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key });
        },
    })
}
