import { places, rideOptions } from '../mocks/data'
import { useTaxiStore } from '../store/useTaxiStore'
import { mockTaxiApi } from './mockTaxiApi'

type Tool = { name: string; title: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => Promise<unknown> }
type ModelContext = { registerTool: (tool: Tool, options?: { signal?: AbortSignal }) => void | Promise<void> }

export function registerTaxiTools() {
  const context = (document as Document & { modelContext?: ModelContext }).modelContext
  if (!context?.registerTool) return () => {}
  const lifecycle = new AbortController()
  const tools: Tool[] = [
    {
      name: 'search_demo_places', title: 'Search demo places',
      description: 'Find available demo pickup and destination locations in Baku.',
      inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'], additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      async execute(input) {
        const query = (input as { query?: unknown })?.query
        if (typeof query !== 'string') throw new Error('query must be a string')
        const results = await mockTaxiApi.searchPlaces(query)
        return results.map(({ id, name, address, distance }) => ({ id, name, address, distance }))
      },
    },
    {
      name: 'plan_demo_ride', title: 'Plan demo ride',
      description: 'Select a Baku destination and taxi tariff, then show the route confirmation in Voya.',
      inputSchema: { type: 'object', properties: { destinationId: { type: 'string' }, rideOptionId: { type: 'string' } }, required: ['destinationId', 'rideOptionId'], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        const { destinationId, rideOptionId } = input as { destinationId?: unknown; rideOptionId?: unknown }
        const destination = places.find(p => p.id === destinationId && p.id !== 'current')
        const option = rideOptions.find(o => o.id === rideOptionId)
        if (!destination || !option) throw new Error('Unknown destination or tariff')
        const state = useTaxiStore.getState()
        if (!state.user) throw new Error('Sign in to plan a ride')
        await mockTaxiApi.calculateRoute(state.pickup, destination)
        state.set({ tab: 'home', destination, rideOptionId: option.id, stage: 'confirming' })
        return { stage: 'confirming', destination: destination.name, tariff: option.name, estimatedPrice: option.price }
      },
    },
    {
      name: 'request_demo_ride', title: 'Request demo ride',
      description: 'Confirm the planned ride and start the simulated driver search.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute() {
        const state = useTaxiStore.getState()
        if (state.stage !== 'confirming' || !state.destination) throw new Error('Plan a ride before requesting it')
        const trip = await mockTaxiApi.requestRide()
        state.set({ stage: 'searchingDriver', tripId: trip.id, progress: 0 })
        return { stage: 'searchingDriver', rideId: trip.id }
      },
    },
  ]
  for (const tool of tools) {
    try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}) } catch { /* WebMCP is optional in this browser. */ }
  }
  return () => lifecycle.abort()
}
