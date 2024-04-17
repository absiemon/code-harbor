import * as dotenv from 'dotenv'
dotenv.config()
import { createClient } from 'redis'

const user_password = process.env.REDIS_USER_PASSWORD
const redis_host = process.env.REDIS_HOST

export async function createRedisClient() {
    try {
        const subscriber = createClient({
            password: user_password,
            socket: {
                host:redis_host,
                port: 16219
            }
        });

        await subscriber.connect()
        return subscriber;

    } catch (error) {
        throw new Error("Cannot connect to redis client!")
    }
}
