export default function dijkstra(edges, start, end) {
	const distances = {};
	const previous = {}; // Для восстановления пути
	const queue = new Set(edges.flatMap(({ from, to }) => [from, to]));

	for (const id of queue)
		distances[id] = Infinity;

	distances[start] = 0;

	while (queue.size > 0) {
		// Находим вершину с минимальным расстоянием
		const minVertex = Array.from(queue).reduce((min, vertex) =>
			distances[vertex] < distances[min] ? vertex : min, Array.from(queue)[0]
		);

		if (minVertex === end) {
			const path = [];
			let current = previous[end];
			while (current !== undefined) {
				path.unshift(current);
				current = previous[current.from];
			}
			return path;
		}

		queue.delete(minVertex);

		edges.forEach(edge => {
			if (edge.from === minVertex && queue.has(edge.to)) {
				const alt = distances[minVertex] + edge.weight;
				if (alt < distances[edge.to]) {
					distances[edge.to] = alt;
					previous[edge.to] = edge;
				}
			}
		});
	}

	return [];
}