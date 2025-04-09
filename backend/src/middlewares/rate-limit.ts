// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-extraneous-dependencies
const rateLimit = require('express-rate-limit');

// Rate limiter для защиты от DDoS атак
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // Ограничение каждого IP до 100 запросов за windowMs
  standardHeaders: true, // Возвращает информацию о лимите в заголовках `RateLimit-*`
  legacyHeaders: false, // Отключает заголовки `X-RateLimit-*`
  message: 'Слишком много запросов с этого IP, пожалуйста, попробуйте позже',
}) 