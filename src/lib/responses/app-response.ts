/* Shared app response types and helper factories. */

/// _____ Types ____ ///
export type TError = { name?: string; message: string; status?: number; code?: string };

export type TSuccessResponse<T> = {
  isSuccess: true;
  data: T;
  message?: string;
};

export type TErrorResponse = {
  isSuccess: false;
  message: string;
  errors: TError[];
};

/// _____ Discriminated union pattern ____ ///
export type TResponse<T> = TSuccessResponse<T> | TErrorResponse;

/// _____ Helpers ____ ///
export function successResponse<T>(data: T, message = "Success"): TSuccessResponse<T> {
  return {
    isSuccess: true,
    data,
    message,
  };
}

export function errorResponse(errors: TError[] = [], message = "Error"): TErrorResponse {
  return {
    isSuccess: false,
    errors,
    message,
  };
}
