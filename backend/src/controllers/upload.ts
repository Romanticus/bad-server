import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    if (req.file.size < 2 * 1024) {
        return next(new BadRequestError('Размер файла должен быть больше 2KB'))
    }

    try {
        // Используем безопасное имя файла, сгенерированное middleware
        const fileName = process.env.UPLOAD_PATH_TEMP
            ? `/${process.env.UPLOAD_PATH_TEMP}/${req.file.filename}`
            : `/${req.file.filename}`
            
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file.originalname
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
