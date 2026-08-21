import { prisma } from '../db/client.js';
import slugify from 'slugify';
import { ROUND_TYPES_PRESETS, RoundTypeDTO } from '@placeprep/shared';

export class RoundTypeRepository {
  async getAll(): Promise<RoundTypeDTO[]> {
    // 1. Start with system defaults
    const presetItems: RoundTypeDTO[] = ROUND_TYPES_PRESETS.map((p) => ({
      name: p.label,
      value: p.value,
      isCustom: false,
    }));

    try {
      // 2. Fetch any custom round types added by users from database
      const customItems = await prisma.customRoundType.findMany({
        orderBy: { name: 'asc' },
      });

      const formattedCustom: RoundTypeDTO[] = customItems.map((c) => ({
        id: c.id,
        name: c.name,
        value: c.slug,
        isCustom: true,
      }));

      // Combine presets and custom types, avoiding duplicate values
      const existingValues = new Set(presetItems.map((p) => p.value.toUpperCase()));
      const combined = [...presetItems];

      for (const custom of formattedCustom) {
        if (!existingValues.has(custom.value.toUpperCase()) && !existingValues.has(custom.name.toUpperCase())) {
          combined.push(custom);
        }
      }

      return combined;
    } catch (err) {
      console.warn('Could not query custom_round_types table, falling back to presets:', err);
      return presetItems;
    }
  }

  async create(name: string, description?: string): Promise<RoundTypeDTO> {
    const slug = slugify(name, { lower: true, strict: true }) || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Check if it already exists as a preset
    const preset = ROUND_TYPES_PRESETS.find(
      (p) => p.value.toLowerCase() === slug.toLowerCase() || p.label.toLowerCase() === name.toLowerCase()
    );
    if (preset) {
      return {
        name: preset.label,
        value: preset.value,
        isCustom: false,
      };
    }

    try {
      const existing = await prisma.customRoundType.findFirst({
        where: {
          OR: [
            { name: { equals: name, mode: 'insensitive' } },
            { slug: { equals: slug, mode: 'insensitive' } },
          ],
        },
      });

      if (existing) {
        return {
          id: existing.id,
          name: existing.name,
          value: existing.slug,
          isCustom: true,
        };
      }

      const created = await prisma.customRoundType.create({
        data: {
          name: name.trim(),
          slug,
          description: description || null,
        },
      });

      return {
        id: created.id,
        name: created.name,
        value: created.slug,
        isCustom: true,
      };
    } catch (err) {
      console.warn('Error saving custom round type to DB, returning in-memory representation:', err);
      return {
        name: name.trim(),
        value: slug,
        isCustom: true,
      };
    }
  }
}

export const roundTypeRepository = new RoundTypeRepository();
