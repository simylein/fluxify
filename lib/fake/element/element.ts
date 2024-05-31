export const data = [
	'hydrogen helium lithium beryllium boron carbon nitrogen oxygen',
	'fluorine neon sodium magnesium aluminium silicon phosphorus sulfur',
	'chlorine argon potassium calcium scandium titanium vanadium chromium',
	'manganese iron cobalt nickel copper zinc gallium germanium',
	'arsenic selenium bromine krypton rubidium strontium yttrium zirconium',
	'niobium molybdenum technetium ruthenium rhodium palladium silver cadmium',
	'indium tin antimony tellurium iodine xenon caesium barium',
	'lanthanum cerium praseodymium neodymium promethium samarium europium gadolinium',
	'terbium dysprosium holmium erbium thulium ytterbium lutetium hafnium',
	'tantalum tungsten rhenium osmium iridium platinum gold mercury',
	'thallium lead bismuth polonium astatine radon francium radium',
	'actinium thorium protactinium uranium neptunium plutonium americium curium',
	'berkelium californium einsteinium fermium mendelevium nobelium lawrencium rutherfordium',
	'dubnium seaborgium bohrium hassium meitnerium darmstadtium roentgenium copernicium',
	'nihonium flerovium moscovium livermorium tennessine oganesson',
]
	.map((frag) => frag.split(' '))
	.flat();

export const element = (): string => {
	return data[Math.floor(Math.random() * data.length)];
};

export const elements = (amount: number): string[] => {
	const result = new Array(amount);
	for (let index = 0; index < amount; index++) {
		result[index] = data[Math.floor(Math.random() * data.length)];
	}
	return result;
};
