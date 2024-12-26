import pino from 'pino';
import pinoPretty from 'pino-pretty';
import fs from 'fs';

if (fs.existsSync('log') === false) {
    fs.mkdirSync('log');
}



const errorLogStream = fs.createWriteStream('log/error.log', { flags: 'a' });

const logger = pino({
    level: 'info',
    transport: {
        targets: [
            {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: true,
                    ignore: 'pid,hostname',
                },
                level: 'info',
            },
            {
                target: 'pino/file',
                options: {
                    destination: 'log/error.log',
                },
                level: 'error',
            },
        ],
    },
});

export default logger;