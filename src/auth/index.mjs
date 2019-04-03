import bcrypt from 'bcrypt'

export async function hashPassword(plainTextPassword, saltRounds) {
    const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds)
    return hashedPassword
}

export function fetchJWTSignOptions(clientId = 'https://sidbox.info') {
    return {
        expiresIn: '12h',
        algorithm: 'HS256',
        audience: clientId
    }
}