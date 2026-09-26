import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { CarFront, MapPin, Navigation2 } from 'lucide-react'
import { useTaxiStore } from '../store/useTaxiStore'
import type { Place, Trip } from '../types'

type MapPoint = Pick<Place, 'x' | 'y'>
type MapCurve = { start: MapPoint; control1: MapPoint; control2: MapPoint; end: MapPoint }

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
const driverStart = { x: 12, y: 42 }
const rideStages = ['driverApproaching', 'driverArrived', 'rideStarted', 'inProgress', 'rideCompleted', 'processingPayment', 'paymentError', 'rating']

function createCamera(points: MapPoint[], visibleHeight: number) {
  const minY = Math.min(...points.map(point => point.y))
  const maxY = Math.max(...points.map(point => point.y))
  const topPadding = 8
  const bottomPadding = 10
  const availableHeight = Math.max(8, visibleHeight - topPadding - bottomPadding)
  const sourceHeight = maxY - minY
  const scale = sourceHeight > 0 ? Math.min(1, availableHeight / sourceHeight) : 1
  const offset = topPadding + (availableHeight - sourceHeight * scale) / 2 - minY * scale

  return (point: MapPoint): MapPoint => ({ x: point.x, y: point.y * scale + offset })
}

function createCurve(start: MapPoint, end: MapPoint, bendSide: number): MapCurve {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const distance = Math.hypot(dx, dy) || 1
  const bend = Math.min(8, distance * 0.12) * bendSide
  const normalX = -dy / distance
  const normalY = dx / distance
  const control = (progress: number): MapPoint => ({
    x: start.x + dx * progress + normalX * bend,
    y: start.y + dy * progress + normalY * bend,
  })

  return { start, control1: control(1 / 3), control2: control(2 / 3), end }
}

function curvePath(curve: MapCurve) {
  const { start, control1, control2, end } = curve
  return `M${start.x} ${start.y} C${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${end.x} ${end.y}`
}

function curvePoint(curve: MapCurve, progress: number): MapPoint {
  const t = Math.max(0, Math.min(1, progress))
  const inverse = 1 - t
  const { start, control1, control2, end } = curve
  return {
    x: inverse ** 3 * start.x + 3 * inverse ** 2 * t * control1.x + 3 * inverse * t ** 2 * control2.x + t ** 3 * end.x,
    y: inverse ** 3 * start.y + 3 * inverse ** 2 * t * control1.y + 3 * inverse * t ** 2 * control2.y + t ** 3 * end.y,
  }
}

function curveAngle(curve: MapCurve, progress: number) {
  const t = Math.max(0, Math.min(1, progress))
  const inverse = 1 - t
  const { start, control1, control2, end } = curve
  const dx = 3 * inverse ** 2 * (control1.x - start.x) + 6 * inverse * t * (control2.x - control1.x) + 3 * t ** 2 * (end.x - control2.x)
  const dy = 3 * inverse ** 2 * (control1.y - start.y) + 6 * inverse * t * (control2.y - control1.y) + 3 * t ** 2 * (end.y - control2.y)
  return Math.atan2(dy, dx) * (180 / Math.PI) + 90
}

export function TaxiMap({ trip }: { trip?: Trip }) {
  const { pickup, destination, stage, progress } = useTaxiStore()
  const [visibleHeight, setVisibleHeight] = useState(64)
  const start = trip?.pickup ?? pickup
  const end = trip?.destination ?? destination
  const routeVisible = !!trip || (!!destination && stage !== 'idle' && stage !== 'selectingDestination' && stage !== 'selectingPickup')
  const vehicleTravel = rideStages.includes(stage)

  useEffect(() => {
    if (trip) {
      setVisibleHeight(100)
      return
    }

    const updateVisibleHeight = () => {
      const map = document.querySelector('.taxi-map')
      const sheet = map?.parentElement?.querySelector('.home-sheet')
      if (!map || !sheet) return
      const mapRect = map.getBoundingClientRect()
      const sheetRect = sheet.getBoundingClientRect()
      if (!mapRect.height) return
      const next = Math.max(20, Math.min(96, ((sheetRect.top - mapRect.top) / mapRect.height) * 100))
      setVisibleHeight(current => Math.abs(current - next) < 0.1 ? current : Math.round(next * 10) / 10)
    }

    updateVisibleHeight()
    const map = document.querySelector('.taxi-map')
    const sheet = map?.parentElement?.querySelector('.home-sheet')
    const observer = sheet ? new ResizeObserver(updateVisibleHeight) : null
    const motionObserver = sheet ? new MutationObserver(updateVisibleHeight) : null
    if (sheet && observer) observer.observe(sheet)
    if (sheet && motionObserver) motionObserver.observe(sheet, { attributes: true, attributeFilter: ['class', 'style'] })
    window.addEventListener('resize', updateVisibleHeight)
    return () => {
      observer?.disconnect()
      motionObserver?.disconnect()
      window.removeEventListener('resize', updateVisibleHeight)
    }
  }, [stage, trip])

  const cameraPoints = [start, ...(end ? [end] : []), ...(routeVisible && !trip ? [driverStart] : [])]
  const project = createCamera(cameraPoints, trip ? 100 : visibleHeight)
  const mapStart = project(start)
  const mapEnd = end ? project(end) : null
  const rideCurve = mapEnd ? createCurve(mapStart, mapEnd, -1) : null
  const approachCurve = stage === 'driverApproaching' && !trip ? createCurve(project(driverStart), mapStart, 1) : null
  const route = rideCurve ? curvePath(rideCurve) : ''

  let vehiclePoint: MapPoint | null = null
  let vehicleAngle = 0
  if (trip && rideCurve) {
    vehiclePoint = curvePoint(rideCurve, 0.95)
    vehicleAngle = curveAngle(rideCurve, 0.95)
  } else if (stage === 'driverApproaching' && approachCurve) {
    vehiclePoint = curvePoint(approachCurve, progress)
    vehicleAngle = curveAngle(approachCurve, progress)
  } else if (['driverArrived', 'rideStarted'].includes(stage) && rideCurve) {
    vehiclePoint = mapStart
    vehicleAngle = curveAngle(rideCurve, 0)
  } else if (vehicleTravel && rideCurve) {
    const routeProgress = ['rideCompleted', 'processingPayment', 'paymentError', 'rating'].includes(stage) ? Math.min(progress, 0.95) : progress
    vehiclePoint = curvePoint(rideCurve, routeProgress)
    vehicleAngle = curveAngle(rideCurve, routeProgress)
  }

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
    {routeVisible && rideCurve && <svg className="route-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {stage === 'driverApproaching' && approachCurve && <path d={curvePath(approachCurve)} stroke="#9cc7b5" strokeWidth="1.25" fill="none" strokeLinecap="round" strokeDasharray="1.5 2.2" />}
      <path d={route} stroke="#fff" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <motion.path d={route} stroke="#14ae87" strokeWidth="1.6" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.15, ease: 'easeInOut' }} />
    </svg>}
    <span className="map-label l1">FƏVVARƏLƏR MEYDANI</span><span className="map-label l2">SAHİL</span><span className="map-label l3">PORT BAKU</span><span className="map-label l4">XƏTAİ</span><span className="map-water-label">XƏZƏR DƏNİZİ</span>
    {staticCars.map((car, i) => <div key={i} className="map-car" style={{ left: `${car.x}%`, top: `${car.y}%` }} aria-hidden="true"><CarFront size={15} strokeWidth={2.4} style={{ transform: `rotate(${car.r}deg)` }} /></div>)}
    <div className="map-pin pickup-pin" style={{ left: `${mapStart.x}%`, top: `${mapStart.y}%` }}><span className="pin-pulse" /><Navigation2 size={18} fill="currentColor" /></div>
    {routeVisible && mapEnd && <div className="map-pin destination-anchor" style={{ left: `${mapEnd.x}%`, top: `${mapEnd.y}%` }} aria-hidden="true"><motion.span className="destination-pin" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 350, damping: 20 }}><MapPin size={23} fill="currentColor" /></motion.span></div>}
    {vehiclePoint && <motion.div className="map-car active-car" animate={{ left: `${vehiclePoint.x}%`, top: `${vehiclePoint.y}%` }} transition={{ duration: .9, ease: 'linear' }} aria-hidden="true"><CarFront size={20} strokeWidth={2.5} style={{ transform: `rotate(${vehicleAngle}deg)` }} /></motion.div>}
  </div>
}
