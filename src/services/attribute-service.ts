import apiClient from '@/lib/api-client';
import {
  AssignCategoryAttributeRequest,
  AttributeDefinition,
  CategoryAttributeDefinition,
  CreateAttributeDefinitionRequest,
  ProductAttributeValue,
  ResolvedCategoryAttribute,
} from '@/types/attribute';
import { Category } from '@/types/category';

export class AttributeService {
  // ---------- Attribute definitions (global dictionary) ----------
  static async getAll(): Promise<AttributeDefinition[]> {
    const response = await apiClient.get<AttributeDefinition[]>('/api/Attribute/attributes');
    return response.data ?? [];
  }

  static async getById(id: number): Promise<AttributeDefinition> {
    const response = await apiClient.get<AttributeDefinition>(`/api/Attribute/attributes/${id}`);
    return response.data;
  }

  static async create(data: CreateAttributeDefinitionRequest): Promise<AttributeDefinition> {
    const response = await apiClient.post<AttributeDefinition>('/api/Attribute/attributes', data);
    return response.data;
  }

  static async update(
    id: number,
    data: CreateAttributeDefinitionRequest
  ): Promise<AttributeDefinition> {
    const response = await apiClient.put<AttributeDefinition>(
      `/api/Attribute/attributes/${id}`,
      data
    );
    return response.data;
  }

  static async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/Attribute/attributes/${id}`);
  }

  // ---------- Category ↔ attribute assignments ----------
  static async getCategoryAttributes(categoryId: number): Promise<CategoryAttributeDefinition[]> {
    const response = await apiClient.get<CategoryAttributeDefinition[]>(
      `/api/Category/categories/${categoryId}/attributes`
    );
    return response.data ?? [];
  }

  static async assignCategoryAttribute(
    categoryId: number,
    data: AssignCategoryAttributeRequest
  ): Promise<CategoryAttributeDefinition> {
    const response = await apiClient.post<CategoryAttributeDefinition>(
      `/api/Category/categories/${categoryId}/attributes`,
      data
    );
    return response.data;
  }

  static async updateCategoryAttribute(
    categoryId: number,
    id: number,
    data: Partial<AssignCategoryAttributeRequest>
  ): Promise<CategoryAttributeDefinition> {
    const response = await apiClient.put<CategoryAttributeDefinition>(
      `/api/Category/categories/${categoryId}/attributes/${id}`,
      data
    );
    return response.data;
  }

  static async removeCategoryAttribute(categoryId: number, id: number): Promise<void> {
    await apiClient.delete(`/api/Category/categories/${categoryId}/attributes/${id}`);
  }

  /**
   * Resolve the full attribute set for a category, including every attribute
   * inherited from its ancestors. Child assignments override parent ones.
   */
  static async resolveCategoryAttributes(
    categoryId: number,
    categories: Category[]
  ): Promise<ResolvedCategoryAttribute[]> {
    const byId = new Map(categories.map((c) => [c.id, c]));

    // Build the chain root → ... → category
    const chain: Category[] = [];
    let current = byId.get(categoryId);
    const guard = new Set<number>();
    while (current && !guard.has(current.id)) {
      guard.add(current.id);
      chain.unshift(current);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
    if (chain.length === 0) {
      chain.push({ id: categoryId } as Category);
    }

    const results = await Promise.all(
      chain.map(async (cat) => {
        try {
          const rows = await AttributeService.getCategoryAttributes(cat.id);
          return { cat, rows };
        } catch {
          return { cat, rows: [] as CategoryAttributeDefinition[] };
        }
      })
    );

    const merged = new Map<number, ResolvedCategoryAttribute>();
    for (const { cat, rows } of results) {
      for (const row of rows) {
        if (!row.attributeDefinition) continue;
        merged.set(row.attributeDefinitionId, {
          ...row,
          attributeDefinition: row.attributeDefinition,
          inheritedFrom:
            cat.id === categoryId ? undefined : { id: cat.id, name: cat.name },
        });
      }
    }

    return Array.from(merged.values()).sort(
      (a, b) =>
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
        (a.attributeDefinition.sortOrder ?? 0) - (b.attributeDefinition.sortOrder ?? 0) ||
        a.attributeDefinition.name.localeCompare(b.attributeDefinition.name)
    );
  }

  // ---------- Product attribute values ----------
  static async getProductAttributeValues(productId: number): Promise<ProductAttributeValue[]> {
    const response = await apiClient.get<ProductAttributeValue[]>(
      `/api/Product/products/${productId}/attribute-values`
    );
    return response.data ?? [];
  }

  static async saveProductAttributeValues(
    productId: number,
    values: ProductAttributeValue[]
  ): Promise<void> {
    await apiClient.put(`/api/Product/products/${productId}/attribute-values`, values);
  }
}
