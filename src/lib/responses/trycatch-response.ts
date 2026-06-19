/* Wraps async calls and normalizes success and error responses. */

import { successResponse, type TErrorResponse, type TResponse } from "./app-response";
import { defaultErrorResponse } from "./default-response";

const fallbackHandler = defaultErrorResponse;

export async function tryCatchResponse<T>(
  fn: () => Promise<T>,
  errorHandler: (error: unknown) => TErrorResponse = fallbackHandler,
): Promise<TResponse<T>> {
  try {
    const data = await fn();

    return successResponse(data);
  } catch (error) {
    return errorHandler(error);
  }
}
