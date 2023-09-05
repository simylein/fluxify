import { FindOneOptions, FindOptions, IdEntity } from '../repository.type';

export const orderBy = <T extends IdEntity, S extends keyof T>(
	order?: FindOptions<T, S>['order'],
): string | undefined => {
	if (order && Object.keys(order).length) {
		const keys = Object.keys(order).map((key) => `${key} ${order[key]}`);
		return `order by ${keys.join(',')}`;
	}
};

export const determineOperator = <T extends IdEntity>(where: Partial<T>, key: string): string => {
	if (
		typeof where[key] === 'string' &&
		((where[key] as string).startsWith('%') || (where[key] as string).endsWith('%'))
	) {
		return 'like';
	}
	if (where[key] === null) {
		return 'is';
	}
	return '=';
};

export const whereOne = <T extends IdEntity, S extends keyof T>(
	where: FindOneOptions<T, S>['where'],
): string[] | undefined => {
	if (where && Object.keys(where).length) {
		return Object.values(where).filter((value) => value !== undefined);
	}
};

export const whereMany = <T extends IdEntity, S extends keyof T>(
	where?: FindOneOptions<T, S>['where'],
): string[] | undefined => {
	if (where && Object.keys(where).length) {
		return Object.values(where).filter((value) => value !== undefined);
	}
};

export const paginate = <T extends IdEntity, S extends keyof T>(
	take: FindOptions<T, S>['take'],
	skip: FindOptions<T, S>['skip'],
): string => {
	if (take !== undefined && skip !== undefined) {
		return `limit ${take} offset ${skip}`;
	}
	if (take !== undefined) {
		return `limit ${take}`;
	}
	if (skip !== undefined && take === undefined) {
		return `limit -1 offset ${skip}`;
	}
	if (skip !== undefined) {
		return `offset ${skip}`;
	}
	return '';
};
