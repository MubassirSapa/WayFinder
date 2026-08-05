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
  upload: true,
}
