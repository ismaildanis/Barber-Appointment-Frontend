import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest, CreateBreakForBarber, Status, BarberCancel, AppointmentRange } from "../types/appointment";
import { appointmentApi } from "../api/appointmentApi";

const key = ["appointment"] as const;

//Customer
export const useGetCustomerAppointments = (range: AppointmentRange, enabled: boolean = true) => 
    useQuery({
        queryKey: ['appointments', range],
        queryFn: () => appointmentApi.getCustomerAppointments(range),
        staleTime: 5 * 60 * 1000,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        enabled,
        retry: false,
    })

export const useGetCustomerOneAppointment = (id: number) => 
    useQuery({
        queryKey: [key, id],
        queryFn: () => appointmentApi.getCustomerOneAppointment(id),
        enabled: !!id
    })


export const useGetCustomerLastAppointment = (enabled: boolean = true) =>
    useQuery({
        queryKey: ["appointment", "last-completed"],
        queryFn: () => appointmentApi.getCustomerLastAppointment(),
        staleTime: 5 * 60 * 1000,
        enabled,
        retry: false,
    });

export const useGetCustomerScheduledAppointment = (enabled: boolean = true) =>
    useQuery({
        queryKey: ["appointment", "last-scheduled"],
        queryFn: () => appointmentApi.getCustomerScheduledAppointment(),
        staleTime: 5 * 60 * 1000,
        enabled,
        retry: false,
    });

export const useCreateAppointment = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateAppointmentRequest) => appointmentApi.createAppointment(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key })
        },
    })
}

export const  useUpdateCustomerAppointment = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: UpdateAppointmentRequest) => appointmentApi.updateCustomerAppointment(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key })
        },
    })
}

export const useCancelCustomerAppointment = (id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => appointmentApi.cancelCustomerAppointment(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key })
        },
    })
}

export const useAvailableHoursForAppointment = (barberId?: number, date?: string) =>
  useQuery({
    queryKey: ["appointment", "available-hours", barberId, date],
    queryFn: async () => {
      const { allHours, busyHours } = await appointmentApi.availableHoursForAppointment(barberId!, date!);
      return allHours.map((time: any) => ({ time, available: !busyHours.includes(time) }));
    },
    enabled: !!barberId && !!date,
    retry: false,
  });


export const  useAvailableDatesForAppointment = () => 
    useQuery({
        queryKey: ["appointment", "available-dates"],
        queryFn: () => appointmentApi.availableDatesForAppointment(),
        staleTime : 5 * 60 * 1000,
        retry: false,
    })


//Barber

export const useGetBarberAppointments = (date?: string) => 
    useQuery({
        queryKey: ["barber-appointments", date],
        queryFn: () => appointmentApi.getBarberAppointments(date!),
        enabled: !!date,
        staleTime: 5 * 60 * 1000
    })

export const useGetBarberOneAppointment = (id?: number) => 
    useQuery({
        queryKey: ["barber-appointment", id],
        queryFn: () => appointmentApi.getBarberOneAppointment(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    })

export const useGetBarberTodayAppointments = () => 
    useQuery({
        queryKey: ["barber-today-appointments"],
        queryFn: () => appointmentApi.getBarberTodayAppointments(),
        staleTime: 5 * 60 * 1000
    })

export const useCancelBarberAppointment = (id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: BarberCancel) => appointmentApi.cancelBarberAppointment(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key })
        },
    })
}

export const useCreateBreakForBarber = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateBreakForBarber) => appointmentApi.createBreakForBarber(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key })
        },
    })
}

export const useDeleteBreakForBarber = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => appointmentApi.deleteBreakForBarber(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: key })
        },
    })
}

export const useGetBreaksForBarber = () =>
    useQuery({
        queryKey: ["barber-breaks"],
        queryFn: () => appointmentApi.getBreaksForBarber(),
        staleTime: 5 * 60 * 1000
    })

export const useMarkCompletedBarber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentApi.markCompletedBarber(id),    
    ...makeOptimistic(queryClient, "SCHEDULED"),
  });
};

export const useMarkNoShowBarber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentApi.markNoShowBarber(id),    
    ...makeOptimistic(queryClient, "SCHEDULED"),
  });
};

//Admin

export const useGetAdminAppointments = (status: Status, date: string) => 
    useQuery({
        queryKey: ["admin-appointments", status, date],
        queryFn: () => appointmentApi.getAdminAppointments(status, date),
        staleTime: 5 * 60 * 1000
    })

export const useGetAdminOneAppointment = (id: number) => 
    useQuery({
        queryKey: [key, id],
        queryFn: () => appointmentApi.getAdminOneAppointment(id),
        enabled: !!id
    })

const makeOptimistic = (queryClient: QueryClient, status: Status) => ({
  onMutate: async (id: number) => {
    await queryClient.cancelQueries({ queryKey: key });
    await queryClient.cancelQueries({ queryKey: [key, id] });

    const prevList = queryClient.getQueryData<Appointment[]>(key);
    const prevOne = queryClient.getQueryData<Appointment>([key, id]);

    if (prevList) {
      queryClient.setQueryData(
        key,
        prevList.map((a) => (a.id === id ? { ...a, status } : a))
      );
    }
    if (prevOne) {
      queryClient.setQueryData([key, id], { ...prevOne, status });
    }

    return { prevList, prevOne };
  },
  onError: (_err: any, id: number, ctx?: any) => {
    if (ctx?.prevList) queryClient.setQueryData(key, ctx.prevList);
    if (ctx?.prevOne) queryClient.setQueryData([key, id], ctx.prevOne);
  },
  onSettled: (_data: any, _err: any, id: number) => {
    queryClient.invalidateQueries({ queryKey: key });
    queryClient.invalidateQueries({ queryKey: [key, id] });
  },
});

export const useMarkCanceledAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentApi.markCanceledAppointment(id),
    ...makeOptimistic(queryClient, "CANCELLED"),
  });
};

export const useMarkNoShowAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentApi.markNoShowAppointment(id),
    ...makeOptimistic(queryClient, "NO_SHOW"),
  });
};

export const useMarkCompletedAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentApi.markCompletedAppointment(id),
    ...makeOptimistic(queryClient, "COMPLETED"),
  });
};