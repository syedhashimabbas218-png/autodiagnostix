import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Page Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Slug',
      admin: {
        description: 'URL path (e.g., "about", "contact", "home")',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Page Content',
    },
    {
      name: 'metaTitle',
      type: 'text',
      label: 'SEO Title',
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      label: 'SEO Description',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero Image',
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      label: 'Published',
    },
  ],
}
