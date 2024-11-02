import { NextFunction, Request, Response } from 'express';
import {
  AuthenticationError,
  BlockedError,
  EntityAlreadyExistsError,
  NotFoundError,
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
      detail: `Authentication error; ${err.detail}`,
      instance: req.originalUrl
    });
  } else if (err instanceof BlockedError) {
    console.warn(`BlockedError: ${err.message}`);
    res.status(403).json({
      type: 'about:blank',
      title: 'User blocked',
      status: 403,
      detail: `Blocked error`,
      instance: req.originalUrl
    });
  }  else {
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
