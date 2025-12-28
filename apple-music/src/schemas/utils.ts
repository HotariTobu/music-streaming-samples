import { z, type ZodTypeAny } from "zod";

/**
 * Validates API response data using the provided Zod schema.
 * Throws ZodError if validation fails.
 */
export function validateApiResponse<T extends ZodTypeAny>(
  schema: T,
  data: unknown,
  context?: string
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`[API Validation Error] ${context ?? "Unknown"}:`, error.issues);
    }
    throw error;
  }
}

/**
 * Creates a typed API response validator function.
 */
export function createApiValidator<T extends ZodTypeAny>(schema: T) {
  return (data: unknown, context?: string): z.infer<T> =>
    validateApiResponse(schema, data, context);
}
