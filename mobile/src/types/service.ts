export interface Service {
    id: number
    shopId: number
    name: string
    description: string
    price: string
    duration: number
    image?: string
    createdAt: string
    updatedAt: string
}

export interface CreateService {
    name: string
    description?: string
    price: string
    duration: number
}

export interface UpdateService {
    name?: string
    description?: string
    price?: string
    duration?: number
}