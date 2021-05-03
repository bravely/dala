import * as z from 'zod'

export const Int = z.number().int()
export default Int
export type Int = z.infer<typeof Int>
