import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'brand', 'category', 'price', 'badge', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Slug',
      admin: {
        description: 'URL-friendly identifier (e.g., "cnc-605-pro-plus")',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Product Name',
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Summary',
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Full Description',
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      required: true,
      index: true,
      label: 'Brand',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      index: true,
      label: 'Category',
    },
    {
      name: 'badge',
      type: 'select',
      options: [
        { label: 'New', value: 'NEW' },
        { label: 'Trending', value: 'TRENDING' },
        { label: 'Discontinued', value: 'DISCONTINUED' },
      ],
      label: 'Badge',
    },
    {
      name: 'price',
      type: 'number',
      label: 'Price',
      admin: {
        placeholder: 'Leave blank if not applicable',
      },
    },
    {
      name: 'heroImages',
      type: 'array',
      label: 'Hero Images',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'features',
      type: 'array',
      label: 'Features',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'technicalTable',
      type: 'array',
      label: 'Technical Specifications',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'specs',
      type: 'array',
      label: 'Legacy Specs',
      fields: [
        {
          name: 'value',
          type: 'text',
        },
      ],
      admin: {
        description: 'Plain text spec strings (legacy format)',
      },
    },
  ],
}
