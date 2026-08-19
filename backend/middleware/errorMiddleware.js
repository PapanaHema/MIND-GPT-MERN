export function notFoundHandler(_request, response) {
  response.status(404).json({ error: "API route not found." });
}

export function errorHandler(error, _request, response, _next) {
  void _next;
  console.error(error);
  if (error.status === 403) {
    return response.status(403).json({
      error: "This website is not allowed to access the API.",
    });
  }
  return response.status(error.status || 500).json({
    error: error.publicMessage || "Something went wrong on the server.",
  });
}
