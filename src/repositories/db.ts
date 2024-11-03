/* istanbul ignore file */
// db.ts
import { Pool } from 'pg';

export class DatabasePool {
  private static instance: Pool;
  private static reconnectAttempts: number = 0;
  private static maxReconnectAttempts: number = 5;

  private constructor() {}

  public static getInstance(): Pool {
    if (!DatabasePool.instance) {
      DatabasePool.createPool();
    }

    return DatabasePool.instance;
  }

  private static createPool() {
    const databaseUrl = process.env.DATABASE_URL;
    const displayUrl = process.env.NODE_ENV === 'development' ? databaseUrl : '****';

    console.log('Creating a new database pool', displayUrl);
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    DatabasePool.instance = new Pool({
      connectionString: databaseUrl
    });

    DatabasePool.instance.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      DatabasePool.handlePoolError();
    });
  }

  private static async handlePoolError() {
    if (DatabasePool.reconnectAttempts < DatabasePool.maxReconnectAttempts) {
      DatabasePool.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (Attempt ${DatabasePool.reconnectAttempts}/${DatabasePool.maxReconnectAttempts})`
      );

      try {
        await DatabasePool.instance.end();
        DatabasePool.createPool();
        console.log('Reconnection successful');
        DatabasePool.reconnectAttempts = 0;
      } catch (error) {
        console.error('Reconnection failed:', error);
        setTimeout(() => DatabasePool.handlePoolError(), 5000); // Wait 5 seconds before trying again
      }
    } else {
      console.error(
        `Failed to reconnect after ${DatabasePool.maxReconnectAttempts} attempts. Exiting.`
      );
      process.exit(1);
    }
  }

  public static async closePool(): Promise<void> {
    if (DatabasePool.instance) {
      await DatabasePool.instance.end();
      DatabasePool.instance = null as unknown as Pool;
    }
  }
}
