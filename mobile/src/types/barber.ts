export interface Barber {
    id: number;
    shopId: number
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null
    active: boolean
    image?: string
}
export interface CreateBarber {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string | null
}

export interface ActivityBarber {
    active: boolean
}

export interface UpdateBarber {
    firstName: string;
    lastName: string;
    phone?: string | null
}