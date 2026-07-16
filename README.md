# Barber Appointment Frontend

Bu repo, berber randevu platformunun mobil uygulama tarafini icerir. Uygulama
`Expo + React Native + Expo Router` ile gelistirilmistir ve 3 farkli rol akisini
destekler:

- `customer`: Musteri (randevu alma, oduller, sans carki)
- `barber`: Berber (takvim, bugunku randevular, calisma saatleri)
- `admin`: Isletme yonetimi (kampanya, hizmet, berber, dashboard)

## Icerik

- [Temel Ozellikler](#temel-ozellikler)
- [Teknoloji Yigini](#teknoloji-yigini)
- [Klasor Yapisi](#klasor-yapisi)
- [Baslangic](#baslangic)
- [API ve Ortam Degiskenleri](#api-ve-ortam-degiskenleri)
- [Calistirma Komutlari](#calistirma-komutlari)
- [Gelistirme Notlari](#gelistirme-notlari)
- [Lisans](#lisans)

## Temel Ozellikler

### Customer
- Isletme secimi ve slug bazli musteri akisi
- Randevu olusturma (berber + hizmet secimi)
- Kampanya/odul secimi ile indirim onizleme
- Sans carki modal deneyimi (kampanyadan odul kazanimi)
- `Odullerim` sayfasi
- Randevu listeleme ve detay ekranlari

### Barber
- Gunluk randevu goruntuleme
- Takvim ve randevu detaylari
- Mola/mesai duzenleme ekranlari

### Admin
- Dashboard ve randevu yonetimi
- Berber/hizmet yonetimi
- Kampanya yonetimi (olustur, guncelle, sil)
- Tatil ve ayar ekranlari

## Teknoloji Yigini

- `React Native` + `Expo`
- `Expo Router` (dosya tabanli routing)
- `@tanstack/react-query` (server state)
- `axios` (HTTP client, token refresh interceptor)
- `zustand` (global state)
- `react-hook-form` + `zod` (form + validation)
- `expo-notifications`, `expo-haptics`, `expo-av`
- `react-native-svg` (ozel cizimler, wheel vb.)

## Klasor Yapisi

```text
Barber-Appointment-Frontend/
|- mobile/
|  |- app/                  # Router ekranlari (auth/customer/barber/admin)
|  |- components/           # Ortak ve modul bazli UI bilesenleri
|  |- src/
|  |  |- api/               # API client katmani
|  |  |- hooks/             # React Query hook'lari
|  |  |- store/             # Zustand store'lari
|  |  |- types/             # TS tipleri
|  |  |- schemas/           # Zod schema'lari
|  |  `- config.ts          # API base URL
|  |- assets/               # Gorsel/ses dosyalari
|  `- package.json
|- PRIVACY_POLICY.md
`- README.md
```

## Baslangic

### 1) Gereksinimler

- Node.js `18+` (onerilen: LTS)
- npm `9+`
- Android Studio emulator veya fiziksel cihaz
- iOS icin macOS + Xcode (opsiyonel)

### 2) Kurulum

```bash
cd mobile
npm install
```

## API ve Ortam Degiskenleri

Uygulama API adresini `mobile/src/config.ts` icindeki `EXPO_PUBLIC_API_URL`
degerinden alir:

```ts
export const API_URL = process.env.EXPO_PUBLIC_API_URL;
```

Yerelde calismak icin `mobile/.env` dosyasi olustur:

```bash
EXPO_PUBLIC_API_URL=http://<LOCAL_IP>:3001/api
```

Ornek:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.15:3001/api
```

Notlar:
- Fiziksel cihazda `localhost` yerine bilgisayarinizin ayni agdaki local IP'sini kullanin.
- Backend acik degilse login, kampanya, randevu gibi tum API aksiyonlari hata verir.

## Calistirma Komutlari

Komutlar `mobile/package.json` altindan:

```bash
cd mobile

# Expo dev server
npm run start

# Platform kisayollari
npm run android
npm run ios
npm run web

# Lint
npm run lint
```

## Gelistirme Notlari

- Router yapisi `app/` altinda rol bazli ayrilir: `(auth)`, `(customer)`, `(barber)`, `(admin)`.
- API cagrilari `src/api`, query/mutation katmani `src/hooks` altindadir.
- Token yonetimi ve refresh akisi `src/api/unifiedAuthApi.ts` icindedir.
- UI tarafinda tema ve ortak component yaklasimi kullanilir.
- Kritik akislarda (randevu, kampanya, wheel) backend validasyon mesaji
  kullaniciya modal/uyari ile yansitilir.

## Guvenlik ve Gizlilik

- Gizlilik metni: `PRIVACY_POLICY.md`
- Uygulama push notification token kaydi yapar.
- Auth isteklerinde bearer token kullanilir ve 401 durumunda refresh mekanizmasi devrededir.

## Lisans

Bu proje `MIT` lisansi ile lisanslanmistir. Detaylar icin `LICENSE` dosyasina bakin.
