import type { Driver, Place, RideOption } from '../types'

export const places: Place[] = [
  { id: 'current', name: 'Моё местоположение', address: 'Nizami Street, Bakı', distance: 'Сейчас', x: 28, y: 64 },
  { id: 'nizami', name: 'Nizami Street', address: 'Nizami küçəsi, Səbail', distance: '0.4 км', x: 31, y: 61 },
  { id: 'port', name: 'Port Baku Mall', address: 'Neftçilər prospekti 151', distance: '5.8 км', x: 75, y: 25 },
  { id: '28mall', name: '28 Mall', address: 'Azadlıq prospekti 15A', distance: '2.1 км', x: 52, y: 45 },
  { id: 'ganjlik', name: 'Ganjlik Mall', address: 'Fətəli Xan Xoyski 14', distance: '6.4 км', x: 70, y: 10 },
  { id: 'white', name: 'Baku White City', address: 'Ağ Şəhər, Xətai', distance: '7.2 км', x: 88, y: 42 },
  { id: 'flame', name: 'Flame Towers', address: 'Mehdi Hüseyn küçəsi 1A', distance: '3.6 км', x: 16, y: 28 },
  { id: 'heydar', name: 'Heydar Aliyev Center', address: 'Heydər Əliyev prospekti 1', distance: '5.6 км', x: 78, y: 13 },
  { id: 'boulevard', name: 'Baku Boulevard', address: 'Dənizkənarı Milli Park', distance: '1.8 км', x: 42, y: 79 },
  { id: 'fountain', name: 'Fountain Square', address: 'Nizami küçəsi 6', distance: '0.8 км', x: 35, y: 57 },
]
export const rideOptions: RideOption[] = [
  { id: 'economy', name: 'Economy', eta: 3, seats: 4, price: 4.8, kind: 'compact' },
  { id: 'comfort', name: 'Comfort', eta: 4, seats: 4, price: 6.4, kind: 'sedan' },
  { id: 'business', name: 'Business', eta: 6, seats: 4, price: 11.9, kind: 'premium' },
  { id: 'xl', name: 'XL', eta: 8, seats: 6, price: 14.5, kind: 'xl' },
]
export const drivers: Driver[] = [
  { id: 'rashad', name: 'Rashad M.', rating: '4.96', car: 'Toyota Prius', color: 'Белый', plate: '99-AB-123', initials: 'RM' },
  { id: 'elvin', name: 'Elvin A.', rating: '4.91', car: 'Mercedes C-Class', color: 'Чёрный', plate: '10-AA-707', initials: 'EA' },
  { id: 'murad', name: 'Murad H.', rating: '4.98', car: 'Hyundai Elantra', color: 'Серебристый', plate: '90-KK-515', initials: 'MH' },
]
export const money = (value: number) => `${value.toFixed(2)} ₼`
