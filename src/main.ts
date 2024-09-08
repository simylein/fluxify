import { bootstrap } from 'lib/core';
import './auth/auth.controller';
import './docs/docs.controller';
import './todo/todo.controller';
await import('../.env' as string).catch(() => void 0);

bootstrap();
