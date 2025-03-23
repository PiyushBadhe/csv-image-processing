import { Response } from "express";
import HttpStatus from "@enums/response";

export default class GenericApiResponse {
  /**
   * Sends a success response.
   */
  static sendSuccess<T>(res: Response, data: T, message?: string): void {
    res.status(HttpStatus.OK).json({
      success: true,
      message: message,
      statusCode: HttpStatus.OK,
      data,
    });
  }

  /**
   * Sends a failure response.
   */
  static sendFailure<T>(
    res: Response,
    message: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
    data?: T
  ): void {
    res.status(statusCode).json({
      success: false,
      message: message,
      statusCode,
      data,
    });
  }

  /**
   * Sends an error response.
   */
  static sendError(res: Response, error: string): void {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: `Internal Server Error: ${error}`,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
