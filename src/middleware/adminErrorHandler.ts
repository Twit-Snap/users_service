import { Request, Response, NextFunction } from 'express';
import { InvalidCredentialsError, ValidationError} from '../types/customAdminErros';
// import logger from '../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const adminErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof InvalidCredentialsError) {
        console.warn(`InvalidCredentialsError: ${err.message}`, {
            entityName: err.entityName,
            entityId: err.entityEmail
        });

        const detailMessage = err.entityName && err.entityEmail
            ? `The ${err.entityName} or ${err.entityEmail} already exists`
            : 'An error occurred with the provided credentials.';

        res.status(400).json({
            type: 'about:blank',
            title: `${err.entityName} or ${err.entityEmail} invalid`,
            status: 400,
            detail: detailMessage,
            instance: req.originalUrl
        });
    } else if (err instanceof ValidationError) {
        console.warn(`ValidationError: ${err.message}`, { field: err.field, detail: err.detail });
        res.status(400).json({
            type: 'about:blank',
            title: 'Validation Error',
            status: 400,
            detail: err.detail,
            instance: req.originalUrl,
            'custom-field': err.field
        });
    } else {
        {
            console.error(`Unexpected error: ${err.message}`, {stack: err.stack});
            res.status(500).json({
                type: 'about:blank',
                title: 'Internal Server Error',
                status: 500,
                detail: 'An unexpected error occurred.',
                instance: req.originalUrl
            });
        }
    }
};
