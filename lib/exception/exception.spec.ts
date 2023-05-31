import { describe, expect, test } from 'bun:test';
import {
	Accepted,
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

	test('should return a http exception with custom message', () => {
		expect(Accepted('custom message')).toEqual({ status: 202, message: 'custom message' });
	});
});

describe(NoContent.name, () => {
	test('should be an instance of http exception', () => {
		expect(NoContent()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with no content', () => {
		expect(NoContent()).toEqual({ status: 204, message: 'no content' });
	});

	test('should return a http exception with custom message', () => {
		expect(NoContent('custom message')).toEqual({ status: 204, message: 'custom message' });
	});
});

describe(Unauthorized.name, () => {
	test('should be an instance of http exception', () => {
		expect(Unauthorized()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with unauthorized', () => {
		expect(Unauthorized()).toEqual({ status: 401, message: 'unauthorized' });
	});

	test('should return a http exception with custom message', () => {
		expect(Unauthorized('custom message')).toEqual({ status: 401, message: 'custom message' });
	});
});

describe(Forbidden.name, () => {
	test('should be an instance of http exception', () => {
		expect(Forbidden()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with forbidden', () => {
		expect(Forbidden()).toEqual({ status: 403, message: 'forbidden' });
	});

	test('should return a http exception with custom message', () => {
		expect(Forbidden('custom message')).toEqual({ status: 403, message: 'custom message' });
	});
});

describe(NotFound.name, () => {
	test('should be an instance of http exception', () => {
		expect(NotFound()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with not found', () => {
		expect(NotFound()).toEqual({ status: 404, message: 'not found' });
	});

	test('should return a http exception with custom message', () => {
		expect(NotFound('custom message')).toEqual({ status: 404, message: 'custom message' });
	});
});

describe(MethodNotAllowed.name, () => {
	test('should be an instance of http exception', () => {
		expect(MethodNotAllowed()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with method not allowed', () => {
		expect(MethodNotAllowed()).toEqual({ status: 405, message: 'method not allowed' });
	});

	test('should return a http exception with custom message', () => {
		expect(MethodNotAllowed('custom message')).toEqual({ status: 405, message: 'custom message' });
	});
});

describe(Conflict.name, () => {
	test('should be an instance of http exception', () => {
		expect(Conflict()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with conflict', () => {
		expect(Conflict()).toEqual({ status: 409, message: 'conflict' });
	});

	test('should return a http exception with custom message', () => {
		expect(Conflict('custom message')).toEqual({ status: 409, message: 'custom message' });
	});
});

describe(Gone.name, () => {
	test('should be an instance of http exception', () => {
		expect(Gone()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with gone', () => {
		expect(Gone()).toEqual({ status: 410, message: 'gone' });
	});

	test('should return a http exception with custom message', () => {
		expect(Gone('custom message')).toEqual({ status: 410, message: 'custom message' });
	});
});

describe(IamTeapot.name, () => {
	test('should be an instance of http exception', () => {
		expect(IamTeapot()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with iam teapot', () => {
		expect(IamTeapot()).toEqual({ status: 418, message: 'iam teapot' });
	});

	test('should return a http exception with custom message', () => {
		expect(IamTeapot('custom message')).toEqual({ status: 418, message: 'custom message' });
	});
});

describe(Locked.name, () => {
	test('should be an instance of http exception', () => {
		expect(Locked()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with locked', () => {
		expect(Locked()).toEqual({ status: 423, message: 'locked' });
	});

	test('should return a http exception with custom message', () => {
		expect(Locked('custom message')).toEqual({ status: 423, message: 'custom message' });
	});
});

describe(TooManyRequests.name, () => {
	test('should be an instance of http exception', () => {
		expect(TooManyRequests()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with too many requests', () => {
		expect(TooManyRequests()).toEqual({ status: 429, message: 'too many requests' });
	});

	test('should return a http exception with custom message', () => {
		expect(TooManyRequests('custom message')).toEqual({ status: 429, message: 'custom message' });
	});
});

describe(InternalServerError.name, () => {
	test('should be an instance of http exception', () => {
		expect(InternalServerError()).toBeInstanceOf(HttpException);
	});

	test('should return a http exception with internal server error', () => {
		expect(InternalServerError()).toEqual({ status: 500, message: 'internal server error' });
	});

	test('should return a http exception with custom message', () => {
		expect(InternalServerError('custom message')).toEqual({ status: 500, message: 'custom message' });
	});
});
