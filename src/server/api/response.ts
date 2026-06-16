import { NextResponse } from "next/server";
import { ErrorCode } from "@/server/errors/error.types";

type SuccessBody<T> = {
  success: true;
  message: string;
  data: T;
};

type ErrorBody = {
  success: false;
  message: string;
  error_code: ErrorCode;
  errors?: string;
};

export const ok = <T>(data: T, message = "Success") =>
  NextResponse.json<SuccessBody<T>>({ success: true, message, data }, { status: 200 });

export const created = <T>(data: T, message = "Created") =>
  NextResponse.json<SuccessBody<T>>({ success: true, message, data }, { status: 201 });

export const noContent = () => new Response(null, { status: 204 });

export const errorResponse = (
  message: string,
  errorCode: ErrorCode,
  status: number,
  errors?: string,
) =>
  NextResponse.json<ErrorBody>(
    { success: false, message, error_code: errorCode, ...(errors && { errors }) },
    { status },
  );
