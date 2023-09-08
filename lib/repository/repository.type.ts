export type NullablePartial<
	T,
	NK extends keyof T = { [K in keyof T]: null extends T[K] ? K : never }[keyof T],
	NP = Partial<Pick<T, NK>> & Pick<T, Exclude<keyof T, NK>>,
> = { [K in keyof NP]: NP[K] };

export type IdEntity = {
	id: string | number;
	[key: string]: unknown;
};

export type Operator = 'like' | '<' | '>' | '<=' | '>=';

export type Select<T, S extends keyof T> = Partial<Record<S, boolean>>;

export type Where<T> = Partial<{ [K in keyof T]: T[K] | { operator: Operator; value: T[K] } }>;

export type FindOptions<T, S extends keyof T> = {
	select?: Select<T, S>;
	where?: Where<T>;
	order?: Partial<Record<keyof T, 'asc' | 'desc'>>;
	skip?: number;
	take?: number;
};

export type FindOneOptions<T, S extends keyof T> = {
	select?: Select<T, S>;
	where: Where<T>;
};

export type OptionalKeys = 'id' | 'createdAt' | 'updatedAt' | 'deletedAt';
