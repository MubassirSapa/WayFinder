import type { CollectionConfig } from 'payload'

import { access } from './access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    // Uploads now come straight from the browser via clientUploads (see
    // src/plugins/storage/storage.ts) using the requester's real session,
    // instead of only ever being called by trusted server code through the
    // Local API — this is the actual authorization boundary for that path now.
    create: access.isLoggedIn,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // No image/svg+xml: SVGs can carry embedded scripts and are rendered at
    // a public, unauthenticated URL - out of scope for this allowlist.
    // image/jpg alongside image/jpeg: some clients report the non-standard
    // 'image/jpg' for .jpg files, and Payload's mimeTypes check is a strict
    // startsWith match, not extension-aware, so both are needed.
    mimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/avif'],
  },
}
