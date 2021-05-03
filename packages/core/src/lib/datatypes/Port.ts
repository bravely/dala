import * as z from 'zod'
import Int from './Int'

export const Port = Int.min(0).max(65535)
export type Port = z.infer<typeof Port>
export default Port
