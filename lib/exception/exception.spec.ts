import { describe, expect, test } from 'bun:test';
import {
	Accepted,
	BadRequest,
	Conflict,
	Forbidden,
	Gone,
	HttpException,
	IamTeapot,
	InternalServerError,
	Locked,
	MethodNotAllowed,
	NoContent,
	NotFound,
	TooManyRequests,
	Unauthorized,
} from './exception';

describe(Accepted.name, () => {
	test('should be an instance of http exception', () => {
		expect(Accepted()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with accepted', () => {
		expect(Accepted()).toEqual({ status: 202, message: 'accepted' });
	});

	test('should return a http exception with more details', () => {
		expect(Accepted('more details')).toEqual({ status: 202, message: 'accepted', detail: 'more details' });
	});
});

describe(NoContent.name, () => {
	test('should be an instance of http exception', () => {
		expect(NoContent()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with no content', () => {
		expect(NoContent()).toEqual({ status: 204, message: 'no content' });
	});

	test('should return a http exception with more details', () => {
		expect(NoContent('more details')).toEqual({ status: 204, message: 'no content', detail: 'more details' });
	});
});

describe(BadRequest.name, () => {
	test('should be an instance of http exception', () => {
		expect(BadRequest()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with bad request', () => {
		expect(BadRequest()).toEqual({ status: 400, message: 'bad request' });
	});

	test('should return a http exception with more details', () => {
		expect(BadRequest('more details')).toEqual({ status: 400, message: 'bad request', detail: 'more details' });
	});
});

describe(Unauthorized.name, () => {
	test('should be an instance of http exception', () => {
		expect(Unauthorized()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with unauthorized', () => {
		expect(Unauthorized()).toEqual({ status: 401, message: 'unauthorized' });
	});

	test('should return a http exception with more details', () => {
		expect(Unauthorized('more details')).toEqual({ status: 401, message: 'unauthorized', detail: 'more details' });
	});
});

describe(Forbidden.name, () => {
	test('should be an instance of http exception', () => {
		expect(Forbidden()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with forbidden', () => {
		expect(Forbidden()).toEqual({ status: 403, message: 'forbidden' });
	});

	test('should return a http exception with more details', () => {
		expect(Forbidden('more details')).toEqual({ status: 403, message: 'forbidden', detail: 'more details' });
	});
});

describe(NotFound.name, () => {
	test('should be an instance of http exception', () => {
		expect(NotFound()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with not found', () => {
		expect(NotFound()).toEqual({ status: 404, message: 'not found' });
	});

	test('should return a http exception with more details', () => {
		expect(NotFound('more details')).toEqual({ status: 404, message: 'not found', detail: 'more details' });
	});
});

describe(MethodNotAllowed.name, () => {
	test('should be an instance of http exception', () => {
		expect(MethodNotAllowed()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with method not allowed', () => {
		expect(MethodNotAllowed()).toEqual({ status: 405, message: 'method not allowed' });
	});

	test('should return a http exception with more details', () => {
		expect(MethodNotAllowed('more details')).toEqual({
			status: 405,
			message: 'method not allowed',
			detail: 'more details',
		});
	});
});

describe(Conflict.name, () => {
	test('should be an instance of http exception', () => {
		expect(Conflict()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with conflict', () => {
		expect(Conflict()).toEqual({ status: 409, message: 'conflict' });
	});

	test('should return a http exception with more details', () => {
		expect(Conflict('more details')).toEqual({ status: 409, message: 'conflict', detail: 'more details' });
	});
});

describe(Gone.name, () => {
	test('should be an instance of http exception', () => {
		expect(Gone()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with gone', () => {
		expect(Gone()).toEqual({ status: 410, message: 'gone' });
	});

	test('should return a http exception with more details', () => {
		expect(Gone('more details')).toEqual({ status: 410, message: 'gone', detail: 'more details' });
	});
});

describe(IamTeapot.name, () => {
	test('should be an instance of http exception', () => {
		expect(IamTeapot()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with iam teapot', () => {
		expect(IamTeapot()).toEqual({ status: 418, message: 'iam teapot' });
	});

	test('should return a http exception with more details', () => {
		expect(IamTeapot('more details')).toEqual({ status: 418, message: 'iam teapot', detail: 'more details' });
	});
});

describe(Locked.name, () => {
	test('should be an instance of http exception', () => {
		expect(Locked()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with locked', () => {
		expect(Locked()).toEqual({ status: 423, message: 'locked' });
	});

	test('should return a http exception with more details', () => {
		expect(Locked('more details')).toEqual({ status: 423, message: 'locked', detail: 'more details' });
	});
});

describe(TooManyRequests.name, () => {
	test('should be an instance of http exception', () => {
		expect(TooManyRequests()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with too many requests', () => {
		expect(TooManyRequests()).toEqual({ status: 429, message: 'too many requests' });
	});

	test('should return a http exception with more details', () => {
		expect(TooManyRequests('more details')).toEqual({
			status: 429,
			message: 'too many requests',
			detail: 'more details',
		});
	});
});

describe(InternalServerError.name, () => {
	test('should be an instance of http exception', () => {
		expect(InternalServerError()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with internal server error', () => {
		expect(InternalServerError()).toEqual({ status: 500, message: 'internal server error' });
	});

	test('should return a http exception with more details', () => {
		expect(InternalServerError('more details')).toEqual({
			status: 500,
			message: 'internal server error',
			detail: 'more details',
		});
	});
});
