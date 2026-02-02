import { authedApi as api } from "../api/unifiedAuthApi";
import { CreateService, Service, UpdateService } from "../types/service";

export const serviceApi = {
    getServices: (slug: string) => api.get<Service[]>(`/service/${slug}`).then(r => r.data),
    getServicesForAdmin: () => api.get<Service[]>(`/service`).then(r => r.data),
    getService: (id: number) => api.get<Service>(`/service/${id}`).then(r => r.data),
    createService: (data: CreateService) => api.post<Service>("/service", data).then(r => r.data),
    updateService: (id: number, data: UpdateService) => api.put<Service>(`/service/${id}`, data).then(r => r.data),
    deleteService: (id: number) => api.delete(`/service/${id}`).then(r => r.data),

    uploadImage: (formData: FormData, id: number) => api.post(`/service/image/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }).then(r => r.data),
    deleteImage: (id: number) => api.put(`/service/image/${id}`).then(r => r.data),

};