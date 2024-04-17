import * as dotenv from 'dotenv'
dotenv.config()
import { createClient } from 'redis'

const user_password = process.env.REDIS_USER_PASSWORD
const redis_host = process.env.REDIS_HOST

export async function createRedisClient() {
    try {
        const publisher = createClient({
            password: user_password,
            socket: {
                host:redis_host,
                port: 16219
            }
        });

        await publisher.connect()
        return publisher;

    } catch (error) {
        throw new Error("Cannot connect to redis client!")
    }
}
