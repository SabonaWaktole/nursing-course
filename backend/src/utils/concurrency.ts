import { Request, Response, NextFunction } from 'express';

/**
 * Lightweight concurrency limiter for Express route handlers.
 * Zero external dependencies — uses a simple in-flight counter.
 *
 * When the maximum number of concurrent executions is reached,
 * new requests receive HTTP 503 (Service Unavailable) with a Retry-After header.
 *
 * Usage:
 *   router.get('/heavy', withConcurrencyLimit(3), heavyHandler);
 */

export function withConcurrencyLimit(maxConcurrent: number) {
  let inFlight = 0;

  return (req: Request, res: Response, next: NextFunction): void => {
    if (inFlight >= maxConcurrent) {
      res.set('Retry-After', '2');
      res.status(503).json({
        message: 'Server is busy, please try again shortly.',
      });
      return;
    }

    inFlight++;

    // Hook into response finish to decrement counter
    const onFinish = () => {
      inFlight--;
      res.removeListener('finish', onFinish);
      res.removeListener('close', onFinish);
    };

    res.on('finish', onFinish);
    res.on('close', onFinish);

    next();
  };
}
