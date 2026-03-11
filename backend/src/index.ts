import 'dotenv/config';
import app from './app';
import { logger } from './utils/logger';

const PORT = parseInt(process.env.PORT ?? '', 10) || 5000;

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
