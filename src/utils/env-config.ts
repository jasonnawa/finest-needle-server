import dotenv from 'dotenv'
import process from 'process'
import { container, singleton } from 'tsyringe'

dotenv.config();

@singleton()
export default class EnvConfiguration{
public readonly PORT: number = parseInt(process.env.PORT || '3000')
public readonly MONGO_URI: string = process.env.MONGO_URI
public readonly ADMIN_EMAIL: string = process.env.ADMIN_EMAIL
public readonly ADMIN_PASSWORD_HASH: string = process.env.ADMIN_PASSWORD_HASH
public readonly JWT_SECRET: string = process.env.JWT_SECRET
}

export const registerEnvConfigurationDI = () => {
    container.register(EnvConfiguration.name, { useClass: EnvConfiguration})
}