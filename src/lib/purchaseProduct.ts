import type { Payload } from 'payload'

type PurchaseResult =
  | { success: true; remaining: number }
  | { success: false; reason: 'out_of_stock' | 'not_found' }

export async function purchaseProduct(payload: Payload, productId: string): Promise<PurchaseResult> {
  let product

  try {
    product = await payload.findByID({
      collection: 'products',
      id: productId,
    })
  } catch {
    return { success: false, reason: 'not_found' }
  }

  if (product.stock <= 0) {
    return { success: false, reason: 'out_of_stock' }
  }

  const updated = await payload.update({
    collection: 'products',
    id: productId,
    data: { stock: product.stock - 1 },
  })

  return { success: true, remaining: updated.stock as number }
}
