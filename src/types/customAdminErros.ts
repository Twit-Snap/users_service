export class InvalidCredentialsError extends Error {
    entityName: string;
    detail: string;

    constructor(entityName: string, detail: string) {
        super(`${entityName} not found`);
        this.entityName = entityName;
        this.detail = detail;
        this.name = 'InvalidCredentials';
    }
}