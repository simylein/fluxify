import { Method } from '../router/router.type';

export const purple = '\x1b[35m';
export const blue = '\x1b[34m';
export const cyan = '\x1b[36m';
export const green = '\x1b[32m';
export const yellow = '\x1b[33m';
export const red = '\x1b[31m';
export const bold = '\x1b[1m';
export const reset = '\x1b[0m';

export const coloredMethod = (method: Method): string => {
	switch (true) {
		case method === 'options':
			return `${bold}${cyan}${method}${reset}`;
		case method === 'get':
			return `${bold}${blue}${method}${reset}`;
		case method === 'post':
			return `${bold}${green}${method}${reset}`;
		case method === 'put':
			return `${bold}${yellow}${method}${reset}`;
		case method === 'patch':
			return `${bold}${yellow}${method}${reset}`;
		case method === 'delete':
			return `${bold}${red}${method}${reset}`;
		default:
			return `${bold}${method}${reset}`;
	}
};

export const coloredStatus = (status: number): string => {
	switch (true) {
		case status >= 600:
			return `${status}`;
		case status >= 500:
			return `${bold}${red}${status}${reset}`;
		case status >= 400:
			return `${bold}${yellow}${status}${reset}`;
		case status >= 300:
			return `${bold}${blue}${status}${reset}`;
		case status >= 200:
			return `${bold}${green}${status}${reset}`;
		case status >= 100:
			return `${bold}${cyan}${status}${reset}`;
		default:
			return `${status}`;
	}
};

export const coloredTime = (time: number): string => {
	switch (true) {
		case time <= 20:
			return `${bold}${cyan}${time.toFixed(2)}${reset} ms`;
		case time <= 40:
			return `${bold}${green}${time.toFixed(2)}${reset} ms`;
		case time <= 80:
			return `${bold}${yellow}${time.toFixed(2)}${reset} ms`;
		default:
			return `${bold}${red}${time.toFixed(2)}${reset} ms`;
	}
};
