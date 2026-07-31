/* Unwraps a TResponse, throwing on failure. For call sites that want throw/catch ergonomics. */

import type { TResponse } from "./app-response";

export function assertSuccess<T>(response: TResponse<T>): T {
  if (!response.isSuccess) {
    throw new Error(response.message);
  }

  return response.data;
}
