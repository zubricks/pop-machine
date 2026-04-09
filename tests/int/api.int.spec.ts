import { getPayload } from 'payload'
import type { Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterEach, expect } from 'vitest'

describe('Products collection', () => {
  let payload: Payload
  const createdIDs: string[] = []

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterEach(async () => {
    for (const id of createdIDs) {
      await payload.delete({ collection: 'products', id })
    }
    createdIDs.length = 0
  })

  it('should create and find a product', async () => {
    const product = await payload.create({
      collection: 'products',
      data: { name: 'Coke', color: '#E8001A', price: 125, stock: 10, position: 1 },
    })
    createdIDs.push(product.id)

    expect(product.name).toBe('Coke')
    expect(product.stock).toBe(10)
  })
})
