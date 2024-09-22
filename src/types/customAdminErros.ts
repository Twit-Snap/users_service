export class AlreadyExistError extends Error {
    entityName: string;
    entityEmail: string;
    detail: string

    constructor(entityName: string, entityEmail: string, detail: string) {

        super(`${entityName ? entityName : ''} ${entityEmail ? entityEmail : ''} already exists`);
        this.entityEmail = entityEmail;
        this.entityName = entityName;
        this.detail = detail
        this.name = 'InvalidCredentials';
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

export class InvalidCredentialsError extends Error {
    detail: string;

    constructor(detail: string) {

        super(`Email or password are incorrect`);
        this.detail = detail
        this.name = 'InvalidCredentials';
    }

}

export class NotFoundError extends Error {
    entityId: string;
    constructor(entityId: string) {
        super(`${entityId} not found`);
        this.entityId = entityId;
        this.name = 'NotFoundError';
    }
}