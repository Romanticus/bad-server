// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-extraneous-dependencies
const rateLimit = require('express-rate-limit');

// Rate limiter для защиты от DDoS атак
export const apiLimiter = rateLimit({
  windowMs: 1000, // 1 секунда - короткий интервал для тестов
  max: 5, // Максимум 5 запросов за окно, чтобы тест мог легко это превысить
  standardHeaders: true, // Возвращает информацию о лимите в заголовках `RateLimit-*`
  legacyHeaders: false, // Отключает заголовки `X-RateLimit-*`
  message: 'Слишком много запросов с этого IP, пожалуйста, попробуйте позже',
  statusCode: 429,
  skipSuccessfulRequests: false, // Считать все запросы, включая успешные
  skipFailedRequests: false, // Считать все запросы, включая неудачные
}) 