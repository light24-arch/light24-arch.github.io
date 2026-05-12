import { z } from 'zod';

export const ArtworkSchema = z.object({
  title: z.string(),
  hero: z.string(),
  medium: z.string(),
  year: z.union([z.number(), z.string()]),
  slug: z.string(),
});

export const ArtworkArraySchema = z.array(ArtworkSchema);

export type ArtworkItem = z.infer<typeof ArtworkSchema>;

export function parseArtworkItems(data: unknown): ArtworkItem[] {
  return ArtworkArraySchema.parse(data);
}
