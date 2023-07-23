export type NullablePartial<
	T,
	NK extends keyof T = { [K in keyof T]: null extends T[K] ? K : never }[keyof T],
	NP = Partial<Pick<T, NK>> & Pick<T, Exclude<keyof T, NK>>,
> = { [K in keyof NP]: NP[K] };

export type IdEntity = {
	id: string | number;
	[key: string]: unknown;
};

export type FindManyOptions<T, S extends keyof T> = {
	select?: Partial<Record<S, boolean>>;
	where?: Partial<T>;
	order?: Partial<Record<keyof T, 'asc' | 'desc'>>;
	skip?: number;
	take?: number;
};

export type FindOneOptions<T, S extends keyof T> = {
	select?: Partial<Record<S, boolean>>;
	where: Partial<T>;
};

export type ExcludedInsertKeys = 'id' | 'createdAt' | 'updatedAt' | 'deletedAt';
