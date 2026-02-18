import { z } from 'zod';

export const StoreResultSchema = z.object({
  version: z.string().regex(/^\d+(\.\d+)*$/, 'Invalid version format'),
  storeUrl: z.string().min(1),
});

export type StoreResult = z.infer<typeof StoreResultSchema>;
