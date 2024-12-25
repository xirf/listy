import fs from 'fs';
import crypto, { type BinaryToTextEncoding } from 'crypto';

function generateChecksum(path: string, algorithm: string = 'md5', encoding: BinaryToTextEncoding = 'hex'): string | null {
    if (!fs.existsSync(path)) {
        return null;
    }

    const data = fs.readFileSync(path);
    return crypto
        .createHash(algorithm)
        .update(new Uint8Array(data))
        .digest(encoding);
}

export default generateChecksum;