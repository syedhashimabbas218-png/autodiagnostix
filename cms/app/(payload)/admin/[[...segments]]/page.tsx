import { RootPage } from '@payloadcms/next/views'
import { importMap } from '../importMap'
import configPromise from '@payload-config'

const Page = ({ params, searchParams }: {
  params: Promise<{ segments: string[] }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  return RootPage({ config: configPromise, params, searchParams: searchParams as Promise<{ [key: string]: string | string[] }>, importMap })
}

export default Page
