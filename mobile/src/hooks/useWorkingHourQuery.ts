import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workingHourApi } from "../api/workingHourApi";
import { WorkingHourCreate, WorkingHourUpdate } from "../types/workingHour";

const key = ["workingHour"] as const;

export const useGetWorkingHours = () => useQuery({ queryKey: key, queryFn: () => workingHourApi.get() })

export const useCreateWorkingHour = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: WorkingHourCreate) => workingHourApi.create(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key })
        },
    })
}

export const useUpdateWorkingHour = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: WorkingHourUpdate) => workingHourApi.update(data, id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key })
        },
    })
}

export const useDeleteWorkingHour = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => workingHourApi.delete(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key })
        },
    })
}