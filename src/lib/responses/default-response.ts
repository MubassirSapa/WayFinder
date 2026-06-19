/* Converts unknown runtime errors into a default app response. */

import { TErrorResponse, errorResponse } from "./app-response";

export function defaultErrorResponse(error: unknown): TErrorResponse {
  if (error instanceof Error) {
    return errorResponse(
      [
        {
          name: error.name,
          message: error.message,
          status: 500,
        },
      ],
      error.message,
    );
  }

  return errorResponse(
    [
      {
        message: "Something went wrong.",
        status: 500,
      },
    ],
    "Something went wrong.",
  );
}
