import { generateDocs } from 'lib/docs';
import { info } from 'lib/logger';
import { router } from 'lib/router';

const app = router();

app.get('/docs', null, () => {
	info('generating documentation');
	return generateDocs();
});
