// Функция для расчета расстояния между вершинами по их id
export default function calculateWeight({x: x1, y: y1}, {x: x2, y: y2}) {
	const dx = x2 - x1;
	const dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}

export function calculateWeights(weight, tags = new Set()) {
	return {
		distance: weight / 4,
		steps: weight * (
			tags.has('elevator') ? 0 :
			tags.has('ladder') ? 2 :
			.75
		),
		time: weight / (
			tags.has('elevator') ? 1 :
			tags.has('ladder') ? 2 :
			6
		)
	};
}