import pino from 'pino';
import pretty from 'pino-pretty';

export default pino(
  {
    level: 'debug',
  },
  pretty({
    colorize: true,
  }),
) as pino.Logger;
