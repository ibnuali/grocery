import { Effect } from 'effect'
import { MasterItemSchema, MasterItemListSchema, type MasterItem } from '../domain/catalog.schema'
import { request, type ApiError, type NetworkError, type DecodeError } from './ApiClient'

export const CatalogService = {
  searchItems: (query: string, limit = 20): Effect.Effect<readonly MasterItem[], ApiError | NetworkError | DecodeError> =>
    request(
      `/api/v1/catalog/items?q=${encodeURIComponent(query)}&limit=${limit}`,
      { method: 'GET' },
      MasterItemListSchema
    ),
  createItem: (
    name: string,
    category = 'General',
    initialPrice = 0
  ): Effect.Effect<MasterItem, ApiError | NetworkError | DecodeError> =>
    request(
      '/api/v1/catalog/items',
      {
        method: 'POST',
        body: JSON.stringify({
          name,
          category,
          initial_price: initialPrice
        })
      },
      MasterItemSchema
    )
}
