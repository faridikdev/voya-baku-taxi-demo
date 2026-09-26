import { drivers, places, rideOptions } from '../mocks/data'
import type { PaymentMethod, Place, RideOption, User } from '../types'

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))
export const mockTaxiApi = {
  async login(phone: string): Promise<string> { await delay(550); return phone },
  async loginWithApple(): Promise<User> { await delay(850); return { firstName: 'Farid', lastName: 'Aliyev', phone: '+994 50 123 45 67' } },
  async verifyOtp(code: string): Promise<boolean> { await delay(700); return /^\d{6}$/.test(code) },
  async searchPlaces(query: string): Promise<Place[]> { await delay(360); const q = query.toLocaleLowerCase(); return places.filter(p => p.id !== 'current' && (!q || `${p.name} ${p.address}`.toLocaleLowerCase().includes(q))) },
  async calculateRoute(pickup: Place, destination: Place) { await delay(650); return { pickup, destination, minutes: 12, distance: 5.8 } },
  async getRideOptions(): Promise<RideOption[]> { await delay(320); return rideOptions },
  async requestRide(): Promise<{ id: string }> { await delay(500); return { id: `ride-${Date.now()}` } },
  async findDriver(simulateFailure = false) { await delay(2800); if (simulateFailure) throw new Error('no-drivers'); return drivers[Math.floor(Math.random() * drivers.length)] },
  async startRide() { await delay(350); return true },
  async completeRide() { await delay(450); return true },
  async processPayment(_method: PaymentMethod, simulateFailure = false) { await delay(1500); if (simulateFailure) throw new Error('payment-failed'); return true },
  async submitRating(rating: number, comment: string) { await delay(450); return { rating, comment } },
}
