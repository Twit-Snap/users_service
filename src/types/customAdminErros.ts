export class InvalidCredentialsError extends Error {
    entityName: string;
    entityEmail: string;

    constructor(entityName: string, entityEmail: string) {

        super(`${entityName ? entityName : ''} ${entityEmail ? entityEmail : ''} already exists`);
        this.entityEmail = entityEmail;
        this.entityName = entityName;
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