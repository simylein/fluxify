export const data = [
	'acrylic bamboo bronze carbon clay concrete cork cotton',
	'foam fresh frozen glass granite leather marble metal',
	'plastic porcelain rubber silk soft steel wooden wool',
]
	.map((frag) => frag.split(' '))
	.flat();

export const material = (): string => {
	return data[Math.floor(Math.random() * data.length)];
};

export const materials = (amount: number): string[] => {
	const result = new Array(amount);
	for (let index = 0; index < amount; index++) {
		result[index] = data[Math.floor(Math.random() * data.length)];
	}
	return result;
};
