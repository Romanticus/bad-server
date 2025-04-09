import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'
import { v4 as uuidv4 } from 'uuid';
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
        const fileName = `${process.env.UPLOAD_PATH_TEMP}/${uuidv4()}`
          
            
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
