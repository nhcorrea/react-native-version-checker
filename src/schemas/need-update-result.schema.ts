import { z } from 'zod';

export const NeedUpdateResultSchema = z.object({
  isNeeded: z.boolean(),
  currentVersion: z.string(),
  latestVersion: z.string(),
  storeUrl: z.string(),
});

export type NeedUpdateResult = z.infer<typeof NeedUpdateResultSchema>;
