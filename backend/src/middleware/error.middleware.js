// ═══════════════════════════════════════════════════════════════════════════
// Error Handler Middleware
// ═══════════════════════════════════════════════════════════════════════════

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[${new Date().toISOString()}] Error:`, {
    status,
    message,
    path: req.path,
    method: req.method,
    body: req.body
  });

  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

module.exports = {
  errorHandler,
  ApiError
};
