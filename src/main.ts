import { bootstrap } from 'lib/core';
import './auth/auth.controller';
import './docs/docs.controller';
import { logError, logInfo, logWarn } from './log/log.service';
import './todo/todo.controller';

const server = bootstrap();
server.logger({ info: logInfo, warn: logWarn, error: logError });
