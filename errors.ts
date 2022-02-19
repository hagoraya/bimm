class ApiError extends Error {
  public statusCode: number;
  public message: string;
  constructor(msg: string, statusCode: number) {
    super(msg);
    this.message = msg;
    this.statusCode = statusCode;
  }
}

export { ApiError };
