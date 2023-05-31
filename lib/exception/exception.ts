export class HttpException {
	constructor(status: number, message: string) {
		this.status = status;
		this.message = message;
	}
	status: number;
	message: string;
}

export const Accepted = (message?: string): HttpException => {
	return new HttpException(202, message ?? 'accepted');
};

export const NoContent = (message?: string): HttpException => {
	return new HttpException(204, message ?? 'no content');
};

export const Unauthorized = (message?: string): HttpException => {
	return new HttpException(401, message ?? 'unauthorized');
};

export const Forbidden = (message?: string): HttpException => {
	return new HttpException(403, message ?? 'forbidden');
};

export const NotFound = (message?: string): HttpException => {
	return new HttpException(404, message ?? 'not found');
};

export const MethodNotAllowed = (message?: string): HttpException => {
	return new HttpException(405, message ?? 'method not allowed');
};

export const Conflict = (message?: string): HttpException => {
	return new HttpException(409, message ?? 'conflict');
};

export const Gone = (message?: string): HttpException => {
	return new HttpException(410, message ?? 'gone');
};

export const IamTeapot = (message?: string): HttpException => {
	return new HttpException(418, message ?? 'iam teapot');
};

export const Locked = (message?: string): HttpException => {
	return new HttpException(423, message ?? 'locked');
};

export const TooManyRequests = (message?: string): HttpException => {
	return new HttpException(429, message ?? 'too many requests');
};

export const InternalServerError = (message?: string): HttpException => {
	return new HttpException(500, message ?? 'internal server error');
};
