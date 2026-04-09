import { getPayload } from 'payload'
import config from '@/payload.config'
import VendingMachine from './VendingMachine'
import './styles.css'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs: products } = await payload.find({
    collection: 'products',
    limit: 6,
    sort: 'position',
  })

  const serialized = products.map((p) => ({
    id: String(p.id),
    name: p.name as string,
    color: p.color as string,
    price: p.price as number,
    stock: p.stock as number,
    position: p.position as number,
  }))

  return <VendingMachine initialProducts={serialized} />
}
