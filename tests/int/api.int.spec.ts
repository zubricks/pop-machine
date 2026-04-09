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

describe('purchaseProduct', () => {
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

  it('should decrement stock and return remaining', async () => {
    const product = await payload.create({
      collection: 'products',
      data: { name: 'Test Cola', color: '#000', price: 125, stock: 3, position: 1 },
    })
    createdIDs.push(product.id)

    const { purchaseProduct } = await import('@/lib/purchaseProduct')
    const result = await purchaseProduct(payload, product.id)

    expect(result).toEqual({ success: true, remaining: 2 })

    const updated = await payload.findByID({ collection: 'products', id: product.id })
    expect(updated.stock).toBe(2)
  })

  it('should return out_of_stock when stock is 0', async () => {
    const product = await payload.create({
      collection: 'products',
      data: { name: 'Empty Cola', color: '#000', price: 125, stock: 0, position: 1 },
    })
    createdIDs.push(product.id)

    const { purchaseProduct } = await import('@/lib/purchaseProduct')
    const result = await purchaseProduct(payload, product.id)

    expect(result).toEqual({ success: false, reason: 'out_of_stock' })

    const unchanged = await payload.findByID({ collection: 'products', id: product.id })
    expect(unchanged.stock).toBe(0)
  })
})
