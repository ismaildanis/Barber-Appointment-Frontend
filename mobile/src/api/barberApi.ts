import { authedApi as api } from "../api/unifiedAuthApi";
import { ActivityBarber, CreateBarber, Barber, UpdateBarber } from "../types/barber";

export const barberApi = {
    getBarbers: async (slug: string) => await api.get<Barber[]>(`/barber${slug}`).then(r => r.data),
    getBarber: async (id: number, slug: string) => await api.get<Barber>(`/barber/${slug}/${id}`).then(r => r.data),
    createBarber: async (data: CreateBarber) => await api.post("/barber", data).then(r => r.data),
    updateBarberActivity: async (id: number, data: ActivityBarber) => await api.put(`/barber/${id}`, data).then(r => r.data),
    updateBarber: async (data: UpdateBarber) => await api.put(`/barber/update`, data).then(r => r.data),
    deleteBarber: async (id: number) => await api.delete(`/barber/${id}`).then(r => r.data),

    uploadImage: (formData: FormData) => api.post("/barber/image", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }).then(r => r.data),
    deleteImage: () => api.put(`/barber/image`).then(r => r.data),
};