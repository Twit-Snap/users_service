import { NextFunction, Request, Response } from 'express';
import {
  AuthenticationError,
  EntityAlreadyExistsError,
  NotFoundError,
  ServiceUnavailableError,
  ValidationError
} from '../types/customErrors';
// import logger from '../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof NotFoundError) {
    console.warn(`NotFoundError: ${err.message}`, {
      entityName: err.entityName,
      entityId: err.entityId
    });
    res.status(404).json({
      type: 'about:blank',
      title: `${err.entityName} Not Found`,
      status: 404,
      detail: `The ${err.entityName} with ID ${err.entityId} was not found.`,
      instance: req.originalUrl
    });
  } else if (err instanceof ValidationError) {
    console.warn(`ValidationError: ${err.message}`, {
      field: err.field,
      detail: err.detail
    });
    res.status(400).json({
      type: err.type,
      title: 'Validation Error',
      status: 400,
      detail: err.detail,
      instance: req.originalUrl,
      'custom-field': err.field
    });
  } else if (err instanceof EntityAlreadyExistsError) {
    console.warn(`EntityAlreadyExistsError: ${err.message}`, {
      entityName: err.entityName
    });
    res.status(409).json({
      type: 'about:blank',
      title: 'Conflict',
      status: 409,
      detail: err.detail,
      instance: req.originalUrl,
      'custom-field': err.entityName
    });
  } else if (err instanceof AuthenticationError) {
    console.warn(`AuthenticationError: ${err.message}`);
    res.status(401).json({
      type: 'about:blank',
      title: 'Unauthorized',
      status: 401,
      detail: 'Authentication error.',
      instance: req.originalUrl
    });
  } else if (err instanceof ServiceUnavailableError) {
    console.warn(`ServiceUnavailableError: ${err.message}`);
    res.status(503).json({
      title: 'Service Unavailable',
      status: 503,
      detail: 'The requested service is temporarily unavailable. Please try again later.',
      instance: req.originalUrl
    });
  } else {
    console.error(`Unexpected error: ${err.message}`, { stack: err.stack });
    res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred.',
      instance: req.originalUrl
    });
  }
};
