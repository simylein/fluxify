export const data = [
	'bacon ball bike car chair cheese chicken chips',
	'computer fish gloves hat keyboard mouse pants pizza',
	'salad sausages shirt shoes soap table towels tuna',
]
	.map((frag) => frag.split(' '))
	.flat();

export const product = (): string => {
	return data[Math.floor(Math.random() * data.length)];
};

export const products = (amount: number): string[] => {
	const result = new Array(amount);
	for (let index = 0; index < amount; index++) {
		result[index] = data[Math.floor(Math.random() * data.length)];
	}
	return result;
};
