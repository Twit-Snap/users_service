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

  constructor(field: string, detail: string) {
    super(`Validation error: ${field}`);
    this.field = field;
    this.detail = detail;
    this.name = 'ValidationError';
  }
}

export class EntityAlreadyExistsError extends Error {
  entityName: string;

  constructor(entityName: string) {
    super(`${entityName} already exists`);
    this.entityName = entityName;
    this.name = 'EntityAlreadyExistsError';
  }
}