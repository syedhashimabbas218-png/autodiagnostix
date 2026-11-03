/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_STRAPI_URL: string;
  readonly SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    cmsUnavailable?: boolean;
  }
}
