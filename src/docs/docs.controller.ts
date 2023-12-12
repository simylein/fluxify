import { generateDocs } from 'lib/docs';
import { info } from 'lib/logger';
import { router } from 'lib/router';

router('/docs').get('', null, () => {
	info('generating documentation');
	return generateDocs();
});
