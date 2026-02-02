import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { serviceApi } from "../api/serviceApi";
import { CreateService, UpdateService } from "../types/service";

const key = ["service"] as const;

export const useGetServices = (slug: string) => 
    useQuery({
        queryKey: [key, slug], 
        queryFn: () => serviceApi.getServices(slug),
        gcTime: 30 * 60 * 1000,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        enabled: !!slug
    });

export const useGetServicesForAdmin = () => 
    useQuery({
        queryKey: key,
        queryFn: () => serviceApi.getServicesForAdmin(),
        gcTime: 30 * 60 * 1000,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });

export const useGetService = (id: number) => 
    useQuery({
        queryKey: [key, id],
        queryFn: () => serviceApi.getService(id),
        enabled: !!id
    });

export const useCreateService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateService) => serviceApi.createService(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key });
        },
    })
}
export const useUpdateService = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateService) => serviceApi.updateService(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key });
        },
    })
}

export const useDeleteService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => serviceApi.deleteService(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key });
        },
    })  
}

export const useUploadImage = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => serviceApi.uploadImage(formData, id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key });
        },
    }) 
}

export const useDeleteImage = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => serviceApi.deleteImage(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key });
        },
    }) 
}