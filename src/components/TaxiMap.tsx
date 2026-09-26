import { motion } from 'motion/react'
import { CarFront, MapPin, Navigation2 } from 'lucide-react'
import { useTaxiStore } from '../store/useTaxiStore'
import type { Trip } from '../types'

const roads = [
  'M-30 120 C150 110 210 120 440 80', 'M-20 225 C120 212 270 218 460 172', 'M-20 330 C120 310 240 325 460 280',
  'M25 -20 C40 120 80 210 96 460', 'M142 -20 C150 130 185 210 188 460', 'M267 -20 C272 100 288 210 305 460', 'M390 -20 C380 100 420 225 430 460',
  'M-30 370 C110 335 270 260 450 165', 'M-20 55 C90 85 235 58 460 25',
]
const minorRoads = [
  'M-20 167 C120 145 270 160 460 120', 'M-20 277 C120 270 270 267 460 230', 'M-20 385 C120 370 270 380 460 345',
  'M70 -20 C75 105 110 220 130 460', 'M210 -20 C215 105 235 220 247 460', 'M328 -20 C340 110 350 250 365 460',
]
const staticCars = [{ x: 19, y: 28, r: -12 }, { x: 58, y: 34, r: 5 }, { x: 81, y: 65, r: -18 }, { x: 25, y: 78, r: 22 }, { x: 64, y: 83, r: -16 }]

export function TaxiMap({ trip }: { trip?: Trip }) {
  const { pickup, destination, stage, progress } = useTaxiStore()
  const start = trip?.pickup ?? pickup
  const end = trip?.destination ?? destination
  const routeVisible = !!trip || (!!destination && stage !== 'idle' && stage !== 'selectingDestination' && stage !== 'selectingPickup')
  const vehicleTravel = ['driverApproaching','driverArrived','rideStarted','inProgress','rideCompleted','processingPayment','paymentError','rating'].includes(stage)
  const carX = stage === 'driverApproaching' ? 12 + (pickup.x - 12) * progress : ['driverArrived','rideStarted'].includes(stage) ? pickup.x : vehicleTravel && destination ? pickup.x + (destination.x - pickup.x) * progress : 45
  const carY = stage === 'driverApproaching' ? 42 + (pickup.y - 42) * progress : ['driverArrived','rideStarted'].includes(stage) ? pickup.y : vehicleTravel && destination ? pickup.y + (destination.y - pickup.y) * progress : 35
  const route = end ? `M${start.x} ${start.y} C${start.x + 16} ${start.y - 18}, ${end.x - 18} ${end.y + 19}, ${end.x} ${end.y}` : ''
  return <div className={`taxi-map ${routeVisible ? 'route-active' : ''}`} aria-label="Демонстрационная карта Баку">
    <svg className="map-grid" viewBox="0 0 410 470" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="410" height="470" fill="#eaece8" />
      <path d="M-20 410 Q130 375 240 460 L410 510 V470 H-20" fill="#dce9e8" />
      <path d="M-30 120 Q90 80 220 100 Q300 95 450 40 M-40 335 Q140 320 235 340 Q330 345 460 300" stroke="#dce3d7" strokeWidth="43" fill="none" />
      {minorRoads.map((d, i) => <path key={`m${i}`} d={d} stroke="#fff" strokeWidth="11" fill="none" />)}
      {roads.map((d, i) => <path key={i} d={d} stroke="#fff" strokeWidth="20" fill="none" />)}
      {roads.map((d, i) => <path key={`l${i}`} d={d} stroke="#d9deda" strokeWidth="1" fill="none" />)}
      <path d="M-20 415 Q140 375 260 460" stroke="#f5f6f2" strokeWidth="4" fill="none" strokeDasharray="5 6" />
    </svg>
    {routeVisible && <svg className="route-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d={route} stroke="#fff" strokeWidth="2.8" fill="none" strokeLinecap="round" /><motion.path d={route} stroke="#14ae87" strokeWidth="1.6" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.15, ease: 'easeInOut' }} /></svg>}
    <span className="map-label l1">FƏVVARƏLƏR MEYDANI</span><span className="map-label l2">SAHİL</span><span className="map-label l3">PORT BAKU</span><span className="map-label l4">XƏTAİ</span><span className="map-water-label">XƏZƏR DƏNİZİ</span>
    {staticCars.map((car, i) => <motion.div key={i} className="map-car" style={{ left: `${car.x}%`, top: `${car.y}%`, rotate: car.r }} animate={{ x: [0, i % 2 ? 9 : -8, 0], y: [0, i % 2 ? -4 : 5, 0] }} transition={{ duration: 9 + i * 2, repeat: Infinity, ease: 'easeInOut' }}><CarFront size={15} strokeWidth={2.5} /></motion.div>)}
    <div className="map-pin pickup-pin" style={{ left: `${start.x}%`, top: `${start.y}%` }}><span className="pin-pulse" /><Navigation2 size={18} fill="currentColor" /></div>
    {routeVisible && end && <motion.div className="map-pin destination-pin" style={{ left: `${end.x}%`, top: `${end.y}%` }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 350, damping: 20 }}><MapPin size={23} fill="currentColor" /></motion.div>}
    {vehicleTravel && !trip && <motion.div className="map-car active-car" animate={{ left: `${carX}%`, top: `${carY}%` }} transition={{ duration: .9, ease: 'linear' }}><CarFront size={20} strokeWidth={2.5} /></motion.div>}
  </div>
}
