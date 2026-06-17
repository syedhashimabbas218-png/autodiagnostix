import React from 'react'
import type { Metadata } from 'next'
import { RootLayout } from '@payloadcms/next/layouts'
import configPromise from '@payload-config'
import { importMap } from './admin/importMap'
import { serverFunction } from './serverFunction'

import '@payloadcms/next/css'

export const metadata: Metadata = {
  title: 'Autodiagnostix CMS',
  description: 'Content management for Autodiagnostix',
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(RootLayout, {
    config: configPromise,
    serverFunction,
    importMap,
    children,
  })
}

export default Layout
