import { authedApi as api } from "../api/unifiedAuthApi";
import { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest, CreateBreakForBarber, BarberAppointment, Status, AdminAppointment, GetBreaksForBarber, BarberCancel, AppointmentRange, CampaignPreview, CampaignPreviewRequest } from "../types/appointment";

export const appointmentApi = {
    //Customer 
    getCustomerAppointments: async (range: AppointmentRange) => await  api.get<Appointment[]>("/appointment", {params: {range}}).then(r => r.data),
    getCustomerOneAppointment: async (id: number) => await api.get<Appointment>(`/appointment/${id}`).then(r => r.data),
    getCustomerLastAppointment: async () => await api.get<Appointment | null>(`/appointment/last`).then(r => r.data),
    getCustomerScheduledAppointment: async () => await api.get<Appointment | null>(`/appointment/last-scheduled`).then(r => r.data),
    createAppointment: async (data: CreateAppointmentRequest) => await api.post<Appointment | null>("/appointment", data).then(r => r.data),
    updateCustomerAppointment: async (data: UpdateAppointmentRequest) => await api.put<Appointment>("/appointment", data).then(r => r.data),
    cancelCustomerAppointment: async (id: number) => await api.put(`/appointment/cancel/${id}`).then(r => r.data),
    availableHoursForAppointment: async (barberId: number, date: string) => await api.get(`/appointment/available-hours/${barberId}`, { params: { date } }).then(r => r.data),
    availableDatesForAppointment: async () => await api.get(`/appointment/available-dates`).then(r => r.data),
    campaignPreview: async (data: CampaignPreviewRequest) => await api.get<CampaignPreview>(`/appointment/preview`, { params: data }).then(r => r.data),

    //Barber
    getBarberAppointments: async (date: string) => await api.get<BarberAppointment[]>(`/appointment/barber`, { params: { date } }).then(r => r.data),
    getBarberOneAppointment: async (id: number) => await api.get<BarberAppointment>(`/appointment/barber/${id}`).then(r => r.data),
    getBarberTodayAppointments: async () => await api.get<BarberAppointment[]>(`/appointment/barber/today`).then(r => r.data),
    cancelBarberAppointment: async (id: number, data: BarberCancel) => await api.post(`/appointment/barber-cancel/${id}`, data).then(r => r.data),
    createBreakForBarber: async (data: CreateBreakForBarber) => await api.post(`/appointment/barber-break`, data).then(r => r.data),
    deleteBreakForBarber: async (id: number) => await api.delete(`/appointment/barber-break/${id}`).then(r => r.data),
    getBreaksForBarber: async () => await api.get<GetBreaksForBarber[]>(`/appointment/barber-break`).then(r => r.data),
    markCompletedBarber: async (id: number) => await api.post(`/appointment/barber-mark-completed/${id}`).then(r => r.data),
    markNoShowBarber: async (id: number) => await api.post(`/appointment/barber-mark-no-show/${id}`).then(r => r.data),
    //Admin
    getAdminAppointments: async (status: Status, date: string) => await  api.get<AdminAppointment[]>("/appointment/admin", { params: { status,  ...(date && { date }) } }).then(r => r.data),
    getAdminOneAppointment: async (id: number) => await api.get<AdminAppointment>(`/appointment/admin/${id}`).then(r => r.data),
    markCanceledAppointment: async (id: number) => await api.post(`/appointment/mark-cancel/${id}`).then(r => r.data),
    markNoShowAppointment: async (id: number) => await api.post(`/appointment/mark-no-show/${id}`).then(r => r.data),
    markCompletedAppointment: async (id: number) => await api.post(`/appointment/mark-completed/${id}`).then(r => r.data),
}

 