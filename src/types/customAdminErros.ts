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