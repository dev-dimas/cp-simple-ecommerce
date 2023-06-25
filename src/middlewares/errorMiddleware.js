const errorMiddleware = (error, req, res, next) => {
  const errorMessage = {
    400: "Bad request!.",
    401: "Unauthorized!.",
    402: "Payment required!.",
    403: "Forbidden!.",
    404: "Not found!.",
    500: "Something went wrong! :(.",
  };
  const {status} = error;
  res.status(error.status || 500).json({
    message:
      error.message || errorMessage[status] || "Unknown error occured! :(.",
    status,
    error: true,
    ...(error.validation_errors && {
      validation_errors: error.validation_errors.errors,
    }),
  });
};

module.exports = errorMiddleware;
