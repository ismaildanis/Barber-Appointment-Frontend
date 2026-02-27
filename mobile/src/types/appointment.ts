import { Campaign } from "./campaign";
import { Reward } from "./reward";
import { Customer } from "./customerAuth";
import { WorkingHour } from "./workingHour";

export type Status = 'SCHEDULED' | 'COMPLETED' | 'NO_SHOW' | 'EXPIRED' | 'BARBER_CANCELLED' |'CANCELLED';

export type AppointmentRange = 'today' | 'last_7_days' | 'last_1_month' | 'last_3_months' | 'last_1_year' | 'last_3_years' | 'last_5_years' | 'last_10_years' | 'plus_10_years';

export const rangeLabels: Record<AppointmentRange, string> = {
  today: 'Bugün',
  last_7_days: 'Son 7 Gün',
  last_1_month: 'Son 1 Ay',
  last_3_months: 'Son 3 Ay',
  last_1_year: 'Son 1 Yıl',
  last_3_years: 'Son 3 Yıl',
  last_5_years: 'Son 5 Yıl',
  last_10_years: 'Son 10 Yıl',
  plus_10_years: 'Son +10 Yıl',
};


export const statusLabel: Record<Status, string> = {
  SCHEDULED: "Planlandı",
  COMPLETED: "Tamamlandı",
  NO_SHOW: "Gelinmedi",
  EXPIRED: "Süresi Doldu",
  BARBER_CANCELLED: "Berber İptali",
  CANCELLED: "İptal Edildi",
};

export const statusColor: Record<Status, string> = {
  SCHEDULED: "#4ade80",        // yeşil
  COMPLETED: "#22c55e",        // koyu yeşil
  NO_SHOW: "#f59e0b",          // amber
  EXPIRED: "#a855f7",          // mor
  BARBER_CANCELLED: "#ef4444", // kırmızı
  CANCELLED: "#ef4444",        // kırmızı
};
export interface Appointment {
    id: number;
    customerId?: number | null;
    barberId: number;
    shopId: number;
    appointmentStartAt: string;
    appointmentEndAt: string;
    status: Status;
    notes?: string;
    cancelReason?: string;
    createdAt: string;
    updatedAt: string;
    cancelledAt?: string | null; 
    barber?: Barber | null;
    appointmentServices?: AppointmentService[] | null;
    shop?: ShopAppt;
    reward?: Reward | null;
}

export interface AdminAppointment {
    id: number;
    customerId?: number | null;
    barberId: number;
    shopId: number;
    appointmentStartAt: string;
    appointmentEndAt: string;
    status: Status;
    notes?: string;
    cancelReason?: string;
    createdAt: string;
    updatedAt: string;
    cancelledAt?: string | null;
    barber?: Barber | null;
    customer?: Customer | null;
    appointmentServices?: AppointmentService[] | null; 
    reward?: Reward | null;
}

export interface BarberAppointment {
    id: number;
    customerId?: number | null;
    barberId: number;
    shopId: number;
    appointmentStartAt: string;
    appointmentEndAt: string;
    status: Status;
    notes?: string;
    cancelReason?: string;
    createdAt: string;
    updatedAt: string;
    cancelledAt?: string | null;
    customer?: Customer | null;
    appointmentServices?: AppointmentService[] | null;
    reward?: Reward | null;
}

export interface CampaignPreviewRequest {
    barberId: number;
    serviceIds: number[];
    appointmentStartAt: string;
    rewardId: number;
    shopSlug: string;
}

export interface CampaignPreview {
    campaign: Campaign;
    campaignServices: CampaignService[];
    totalPrice: string;
    newPrice: string;
    totalDiscount: string;
    discountedServicesPrices: DiscountedServicePrice[];
    totalDuration: number;
}

export interface DiscountedServicePrice {
    id: number;
    name: string;
    price: string;
    duration: number;
}

export interface CampaignService {
    id: number;
    campaignId: number;
    serviceId: number;
}

export interface Barber {
    id: number;
    firstName: string;
    lastName: string;
    image?: string;
}
export interface Service {
    id: number;
    name: string;
    image?: string;
    price: string;
}

export interface AppointmentService {
    id: number;
    serviceId: number;
    name: string;
    price: string;
    discountedPrice?: string | null;
    duration: number;
}

export interface ShopAppt {
    id: number;
    name: string;
}

export interface CreateAppointmentRequest {
    barberId: number;
    serviceIds: number[];
    appointmentStartAt: string;
    rewardId?: number | null;
    notes?: string;
}

export interface UpdateAppointmentRequest {
    barberId?: number;
    serviceId?: number;
    appointmentStartAt?: Date;
    notes?: string;
}

export interface CreateBreakForBarber {
    startMin: number;
    endMin: number;
}

export interface GetBreaksForBarber {
    id: number;
    startMin: number;
    endMin: number;
    workinHourId: number;
    workingHour: WorkingHour;
}

export interface BarberCancel {
    cancelReason?: string | null;
}
