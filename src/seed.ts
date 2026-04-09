import { getPayload } from 'payload'
import config from './payload.config.js'

const SODAS = [
  { name: 'Coke',      color: '#E8001A', price: 125, stock: 10, position: 1 },
  { name: 'Diet Coke', color: '#7B7B7B', price: 125, stock: 10, position: 2 },
  { name: 'Sprite',    color: '#00A651', price: 125, stock: 10, position: 3 },
  { name: 'Dr Pepper', color: '#6B0018', price: 125, stock: 10, position: 4 },
  { name: 'Fanta',     color: '#FF6600', price: 125, stock: 10, position: 5 },
  { name: 'Root Beer', color: '#3D1C02', price: 125, stock: 10, position: 6 },
]

async function seed() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Clear existing products
  const existing = await payload.find({ collection: 'products', limit: 100 })
  for (const product of existing.docs) {
    await payload.delete({ collection: 'products', id: product.id })
  }

  // Create fresh
  for (const soda of SODAS) {
    await payload.create({ collection: 'products', data: soda })
    console.log(`Created: ${soda.name}`)
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
