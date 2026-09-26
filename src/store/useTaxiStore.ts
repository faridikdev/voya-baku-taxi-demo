import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { places, rideOptions } from '../mocks/data'
import type { Driver, Notice, PaymentMethod, Place, RideStage, Tab, Trip, User } from '../types'

type State = {
  onboardingDone: boolean; user: User | null; tab: Tab; stage: RideStage;
  pickup: Place; destination: Place | null; rideOptionId: string; payment: PaymentMethod;
  cardLast4: string | null; saved: { home: Place | null; work: Place | null };
  driver: Driver | null; eta: number; progress: number; tripId: string | null;
  trips: Trip[]; notices: Notice[]; simulateNoDrivers: boolean; simulatePaymentError: boolean;
  dark: boolean; language: string; notificationsEnabled: boolean; comment: string; options: string[];
  set: (patch: Partial<State>) => void; resetRide: () => void; resetApp: () => void;
  finishTrip: (rating?: number) => void;
}
const initialNotices: Notice[] = [{ id: 'offer', title: 'Поездка выгоднее', body: 'Скидка 10% на следующую поездку по Баку.', time: 'Сегодня', unread: true, type: 'offer' }]
export const useTaxiStore = create<State>()(persist((set, get) => ({
  onboardingDone: false, user: null, tab: 'home', stage: 'idle', pickup: places[0], destination: null,
  rideOptionId: rideOptions[0].id, payment: 'cash', cardLast4: null,
  saved: { home: null, work: null }, driver: null, eta: 3, progress: 0, tripId: null,
  trips: [], notices: initialNotices, simulateNoDrivers: false, simulatePaymentError: false,
  dark: false, language: 'Русский', notificationsEnabled: true, comment: '', options: [],
  set: patch => set(patch),
  resetRide: () => set({ stage: 'idle', destination: null, driver: null, eta: 3, progress: 0, tripId: null, comment: '', options: [] }),
  resetApp: () => { localStorage.removeItem('voya-app'); set({ onboardingDone: false, user: null, tab: 'home', stage: 'idle', pickup: places[0], destination: null, rideOptionId: 'economy', payment: 'cash', cardLast4: null, saved: { home: null, work: null }, driver: null, eta: 3, progress: 0, tripId: null, trips: [], notices: initialNotices, dark: false, language: 'Русский', notificationsEnabled: true, comment: '', options: [], simulateNoDrivers: false, simulatePaymentError: false }) },
  finishTrip: rating => {
    const s = get(); if (!s.destination || !s.driver) return
    const option = rideOptions.find(o => o.id === s.rideOptionId) ?? rideOptions[0]
    const trip: Trip = { id: s.tripId ?? `ride-${Date.now()}`, date: new Date().toISOString(), pickup: s.pickup, destination: s.destination, price: option.price, duration: 14, distance: 5.8, driver: s.driver, payment: s.payment, rating }
    set({ trips: [trip, ...s.trips], notices: [{ id: `complete-${trip.id}`, title: 'Поездка завершена', body: `${s.destination.name} · ${trip.price.toFixed(2)} ₼`, time: 'Сейчас', unread: true, type: 'ride' }, ...s.notices], stage: 'idle', destination: null, driver: null, progress: 0, tripId: null, tab: 'home' })
  },
}), { name: 'voya-app', partialize: s => ({ ...s, stage: ['searchingDriver','driverFound','driverApproaching','driverArrived','rideStarted','inProgress','rideCompleted','processingPayment','paymentSuccess','paymentError','rating'].includes(s.stage) ? s.stage : 'idle' }) }))
