import { bootstrap } from 'lib/core';
import './auth/auth.controller';
import './docs/docs.controller';
import { logError, logInfo, logWarn } from './log/log.service';
import { logRequest, logResponse } from './metric/metric.service';
import './todo/todo.controller';

const server = bootstrap();
server.logger({ req: logRequest, res: logResponse, info: logInfo, warn: logWarn, error: logError });
