import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { barberApi } from '../api/barberApi'
import { ActivityBarber, CreateBarber, UpdateBarber } from '../types/barber';

const key = ['barber'] as const

export const useGetBarbers = (slug: string) => 
    useQuery({ 
        queryKey: [key],
        queryFn: () => barberApi.getBarbers(slug), 
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });

export const useGetBarber = (id: number, slug: string) => 
    useQuery({ 
        queryKey: [key, id], 
        queryFn: () => barberApi.getBarber(id, slug), 
        enabled: !!id 
    });

export const useCreateBarber = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateBarber) => barberApi.createBarber(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key })
        },
    })
}

export const useUpdateActivityBarberr = (id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: ActivityBarber) => barberApi.updateBarberActivity(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key })
        },
    })
}

export const useUpdateBarber = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: UpdateBarber) => barberApi.updateBarber(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key })
        }
    })
}

export const useDeleteBarber = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => barberApi.deleteBarber(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key })
        },
    })
}

export const useBarberUploadImage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => barberApi.uploadImage(formData),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key });
        },
    }) 
}

export const useBarberDeleteImage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => barberApi.deleteImage(),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key });
        },
    }) 
}