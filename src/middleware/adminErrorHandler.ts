import { Request, Response, NextFunction } from 'express';
import {
  AdminNotFoundError,
  AlreadyExistError,
  InvalidCredentialsError,
  ValidationError
} from '../types/customAdminErros';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const adminErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AlreadyExistError) {
    console.warn(`InvalidCredentialsError: ${err.message}`, {
      entityName: err.entityName,
      entityId: err.entityEmail,
      detail: err.detail
    });

    res.status(400).json({
      type: 'about:blank',
      title: `Invalid Credential`,
      status: 400,
      detail: err.detail,
      instance: req.originalUrl
    });
  } else if (err instanceof ValidationError) {
    console.warn(`ValidationError: ${err.message}`, {
      field: err.field,
      detail: err.detail
    });
    res.status(400).json({
      type: 'about:blank',
      title: 'Validation Error',
      status: 400,
      detail: err.detail,
      instance: req.originalUrl
    });
  } else if (err instanceof InvalidCredentialsError) {
    console.warn(`InvalidCredentialsError: ${err.message}`, {
      detail: err.detail
    });
    res.status(401).json({
      type: 'about:blank',
      title: 'Invalid Credential',
      status: 401,
      detail: err.detail,
      instance: req.originalUrl
    });
  } else if (err instanceof AdminNotFoundError) {
    console.warn(`NotFoundError: ${err.message}`, { entityId: err.entityId });
    res.status(404).json({
      type: 'about:blank',
      title: `Not Found`,
      status: 404,
      detail: `The user with ID ${err.entityId} was not found.`,
      instance: req.originalUrl
    });
  } else {
    {
      console.error(`Unexpected error: ${err.message}`, { stack: err.stack });
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
