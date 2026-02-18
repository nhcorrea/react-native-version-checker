import { z } from 'zod';

export const VersionInfoSchema = z.object({
  country: z.string().min(1),
  packageName: z.string().min(1),
  currentVersion: z.string().min(1),
  currentBuildNumber: z.union([z.string(), z.number()]).transform(String),
});

export type VersionInfo = z.infer<typeof VersionInfoSchema>;
