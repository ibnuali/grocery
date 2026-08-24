import { openDB, type IDBPDatabase } from 'idb'
import { Effect } from 'effect'
import { request } from './api-client'
import { PlanItemSchema } from '../domain/plan.schema'

export interface MutationItem {
  id?: number
  planId: string
  itemId: string
  isChecked: boolean
  timestamp: number
}

const DB_NAME = 'grocery_offline_db'
const STORE_NAME = 'mutation_queue'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        }
      }
    })
  }
  return dbPromise
}

export const QueueService = {
  enqueueCheck: (planId: string, itemId: string, isChecked: boolean): Effect.Effect<void, never, never> =>
    Effect.promise(async () => {
      try {
        const db = await getDB()
        await db.add(STORE_NAME, {
          planId,
          itemId,
          isChecked,
          timestamp: Date.now()
        })
      } catch {
        // ignore storage errors
      }
    }),

  flush: (): Effect.Effect<number, never, never> =>
    Effect.gen(function* () {
      const db = yield* Effect.promise(async () => {
        try {
          return await getDB()
        } catch {
          return null
        }
      })
      if (!db) return 0

      const mutations: MutationItem[] = yield* Effect.promise(async () => {
        try {
          return await db.getAll(STORE_NAME)
        } catch {
          return []
        }
      })

      if (mutations.length === 0) return 0

      let flushedCount = 0
      for (const item of mutations) {
        const patchResult = yield* request(
          `/api/v1/plans/${item.planId}/items/${item.itemId}/check`,
          {
            method: 'PATCH',
            body: JSON.stringify({ is_checked: item.isChecked })
          },
          PlanItemSchema
        ).pipe(
          Effect.catchAll(() => Effect.succeed(null))
        )

        if (patchResult && item.id !== undefined) {
          yield* Effect.promise(async () => {
            try {
              await db.delete(STORE_NAME, item.id!)
            } catch {
              // ignore
            }
          })
          flushedCount++
        }
      }

      return flushedCount
    })
}
