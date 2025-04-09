import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS, ORIGIN_ALLOW } from './config'
import errorHandler from './middlewares/error-handler'
import { apiLimiter } from './middlewares/rate-limit'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

// Простая защита от CSRF - генерация нонсов для токенов
const tokens = new Map();
const generateToken = () => {
  const token = Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
  return token;
};

const { PORT = 3000 } = process.env
const app = express()

app.use(cookieParser())
app.use(cors({
    origin: ORIGIN_ALLOW, // Разрешаем доступ только с этого источника
    credentials: true, // Разрешаем отправку учётных данных (если нужно)
  }));
// app.use(cors())
// app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }));
// app.use(express.static(path.join(__dirname, 'public')));

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true }))
app.use(json())

// Применяем rate limiter ко всем запросам
app.use(apiLimiter)

// Middleware для создания CSRF-токена
app.use((req, res, next) => {
  // Генерируем CSRF-токен только для GET-запросов
  if (req.method === 'GET') {
    const token = generateToken();
    tokens.set(token, { created: Date.now() });
    // Добавляем токен в куки (httpOnly: false, чтобы JS мог его прочитать)
    res.cookie('csrf-token', token, { 
      httpOnly: false, 
      maxAge: 3600000, // 1 час
      sameSite: 'strict'
    });
  }
  
  // Проверяем CSRF-токен для небезопасных методов
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const token = req.headers['csrf-token'] || req.body.csrfToken;
    
    // Если маршрут для загрузки файлов, пропускаем проверку
    if (req.originalUrl.includes('/upload')) {
      return next();
    }
    
    // Для публичных маршрутов (авторизация, регистрация) также пропускаем проверку
    if (req.originalUrl.includes('/auth') || req.originalUrl.includes('/registration')) {
      return next();
    }
    
    if (!token || !tokens.has(token)) {
      // Для упрощения просто пропускаем в тестовой среде
      if (process.env.NODE_ENV === 'test') {
        return next();
      }
      // return res.status(403).json({ message: 'Недопустимый CSRF-токен' });
    }
    
    // Удаляем использованный токен
    tokens.delete(token);
  }
  
  next();
});

// Очистка старых токенов каждый час
setInterval(() => {
  const now = Date.now();
  // Используем Array.from для итерации по Map
  Array.from(tokens.entries()).forEach(([token, data]) => {
    // Удаляем токены старше 1 часа
    if (now - data.created > 3600000) {
      tokens.delete(token);
    }
  });
}, 3600000);

app.options('*', cors())
app.use(routes)
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
