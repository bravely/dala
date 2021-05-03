import * as z from 'zod'
import { Datatypes } from '@dala/core'
import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { ZodError } from 'zod'
import { pipe } from 'fp-ts/function'
import { Pool } from 'node-postgres'

const Configuration = z.object({
  host: z.string().optional(),
  user: z.string().optional(),
  password: z.string().optional(),
  database: z.string().optional(),
  port: Datatypes.Port.optional()
})
type Configuration = z.infer<typeof Configuration>

const parseConfig = E.tryCatchK(
  Configuration.parse,
  (err: ZodError) => err.flatten().fieldErrors
)

type PostgreSQLAdapter = {
  config: Configuration
  pool: Pool
  lastConnected: Date
}

type AdapterIntializationErrors = Record<string, string[]>
type AdapterInitResult = TE.TaskEither<AdapterIntializationErrors, PostgreSQLAdapter>

export const init = (config: Record<string, unknown>): AdapterInitResult => {
  return pipe(
    config,
    parseConfig,
    E.chain(c => E.right(startPool(c))),
    TE.fromEither,
    TE.chain(testConnection)
  )
}

const startPool = (config: Configuration) => {
  const pool = new Pool(config)
  return {config, pool}
}

const testConnection = TE.tryCatchK(async (unsafeAdapter: Pick<PostgreSQLAdapter, 'config' | 'pool'>)  => {
  const res = await unsafeAdapter.pool.connect()
  res.release()
  return {...unsafeAdapter, lastConnected: new Date()}
},
(e) => ({pool: [e.toString()]}))


