import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'stock', 'position'],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'color', type: 'text', required: true },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: { description: 'Price in cents (125 = $1.25)' },
    },
    { name: 'stock', type: 'number', required: true, defaultValue: 0 },
    {
      name: 'position',
      type: 'number',
      required: true,
      admin: { description: '1–6 slot position' },
    },
  ],
}
