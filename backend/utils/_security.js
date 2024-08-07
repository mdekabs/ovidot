import crypto from 'crypto';

export const encryptData = (data, encryptionKey) => {
    if (!data) return data;

    const iv = crypto.randomBytes(16); // Generate a random initialization vector
    const key = crypto.createHash('sha256').update(encryptionKey).digest(); // Hash the encryption key

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data.toString(), 'utf8', 'hex'); // Convert data to string to handle non-string data types
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`; // Return iv and encrypted data
};

export const decryptData = (encryptedData, encryptionKey) => {
    if (!encryptedData) return encryptedData; // If data is undefined or null, return it as is

    const [ivHex, encrypted] = encryptedData.split(':'); // Separate iv from the encrypted data
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.createHash('sha256').update(encryptionKey).digest(); // Hash the encryption key

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
