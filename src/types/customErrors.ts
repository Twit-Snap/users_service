export class NotFoundError extends Error {
  entityName: string;
  entityId: string;

  constructor(entityName: string, entityId: string) {
    super(`${entityName} not found`);
    this.entityName = entityName;
    this.entityId = entityId;
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  field: string;
  detail: string;
  type: string;

  constructor(field: string, detail: string, type: string) {
    super(`Validation error: ${field}`);
    this.field = field;
    this.detail = detail;
    this.name = 'ValidationError';
    this.type = type;
  }
}

export class EntityAlreadyExistsError extends Error {
  entityName: string;
  detail: string;

  constructor(entityName: string, detail: string) {
    super(`${entityName} already exists`);
    this.entityName = entityName;
    this.detail = detail;
    this.name = 'EntityAlreadyExistsError';
  }
}

export class AuthenticationError extends Error {
  detail: string;

  constructor(detail?: string) {
    super('Authentication error');
    this.name = 'AuthenticationError';
    this.detail = detail ? detail : '';
  }
}

export class BlockedError extends Error {
  constructor() {
    super('Blocked error');
    this.name = 'BlockedError';
  }
}

export class ServiceUnavailableError extends Error {
  constructor() {
    super('Service Unavailable Error');
    this.name = 'ServiceUnavailableError';
  }
}
