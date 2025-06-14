## Архитектура реакт приложения

### index.js

Файл index.js является точкой входа, здесь происходит инициализация реакт приложения и рендеринг основного компонента App

```js
// Корневой div с id=root внутри которого рендерится все приложение в виде основного компонента App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	React.createElement(App)
);
```

### App.jsx

Компонент App является основным компонентом, содержащим все остальные компоненты

В данном примере он содержит единственный компонент MapView, который принимает объект данных для каждого этажа в виде SVG-представления и всех данных по этажу (массивы вершин и ребер), которые передаются через оператор распространения (spread operator), что позволяет избежать необходимости перечислять массивы отдельно.

```js
<div className="App">
	<MapView
		floors={[
			{mapImage: floor0Image, ...floor0},
			{mapImage: floor1Image, ...floor1},
			{mapImage: floor2Image, ...floor2},
			{mapImage: floor3Image, ...floor3},
		]}
        // точки переходов
		passages={passages}
        // значения для стартовой и конечной точки по умолчанию
		initialStart={113}
		initialEnd={177}
	/>
</div>
```

Дополнительно передаются точки переходов passages (ребра связывающие переходы лифтов и трапов)

Веса лифтов равны 5 метрам, веса трапов 10 (что +- соответствует данным в реальной жизни), у обычных ребер не являющихся точками перехода теги отсутствуют.

```js
// Содержимое passages

edges: [
		[[0, 1], [1, 1], 5, ['elevator']],
		[[0, 11], [1, 11], 10, ['ladder']],
		[[0, 12], [1, 13], 10, ['ladder']],
		[[1, 1], [2, 1], 5, ['elevator']],
		[[1, 12], [2, 11], 10, ['ladder']],
		[[2, 1], [3, 1], 5, ['elevator']],
		[[2, 12], [3, 11], 10, ['ladder']],
		[[2, 13], [3, 12], 10, ['ladder']],
		[[2, 14], [3, 13], 10, ['ladder']],
	].map(([[fromFloor, from], [toFloor, to], weight, tags = []]) => ({
		fromFloor, from, toFloor, to, weight,
		tags: new Set(tags)
	})),
```

### MapView

При создании компонент MapView происходит:

1) Расчет весов ребер через функцию евклидово расстояния;
2) Расчет критериев (расстояние, шаги, время) на основе тега ребра, к подробным расчетам перейдем ниже;
3) Создание обратно направленных ребер (граф является неориентированным и если из ребра A можно попасть в ребро B, значит и из ребра B можно попасть в A за ту же стоимость);

```js
floors = useMemo(() => floors.map(({ edges, vertices, ...floor }) => ({
	vertices: vertices.sort((v1, v2) => v1.id - v2.id),
	edges: edges
		.map(({ from, to, tags }) => ({
			from, to,
			weights: calculateWeights(calculateWeight(
				...[from, to].map(id => vertices.find(v => v.id === id))
			), tags)
			}))

		.flatMap(edge => [
			edge,
			{ from: edge.to, to: edge.from, weights: edge.weights }
		]),
		...floor
	})), [floors]);
```

### Расчет критериев

**Расстояние**

Вес ребра = 1 метру (таким образом длина судна в приложении равна 300-350 метров, что соответствует реальной длине круизного лайнера)

Если ребро является точкой перехода для лифтов:

расстояние = вес * ноль (лифт не требует преодоления расстояния)

Если ребро является точкой перехода для трапов:

расстояние = вес * 2 (трап требует в два раза больше усилий, в сравнении с обычным путем)

Если это обычное ребро 

расстояние = вес * 1 (т.к. опять же 1 вес = 1 метру)

```js
const distance = weight * (
    tags.has('elevator') ? 0 :  // Вес ребра в случае использования лифта 0
    tags.has('ladder') ? 2 :    // трап в два раза больше
	1                           // Обычный путь
);
```

**Шаги**

Если ребро является точкой перехода для лифтов:

шаги = расстояние * 0 (лифт не требует трудозатрат)

Если ребро является точкой перехода для трапов:

шаги = расстояние * 3 (преодоление 1 метра трапа занимает три шага)

Если это обычное ребро 

шаги = расстояние * 2 (два шага на метр)

```js
steps: distance * (
    tags.has('elevator') ? 0 :    // Лифт – 0 шагов
    tags.has('ladder') ? 3 :      // Преодоление 1 метра трапа занимает три шага
    2                           // Обычный путь – 2 шага на метр
),
```

**Время**

Преодоление одного метра занимает 0.7 секунды, поэтому если это обычное ребро, вес домножаем на 0.7

Если это трап, вес домножаем на два, т.к. трап занимает в два раза больше времени в сравнении с обычным путем и еще на два, т.к. при использовании трапа 1 вес = 2 метрам

Лифт занимает в три раза больше времени в сравнении с трапом, предполагается ожидание (лифт может быть занят, долго открываться и т.д.)

```js
time: weight * (
      tags.has('elevator') ? 8.4 :  // Лифт – в 3 раз больше трапа, т.к. предполагается ожидание (лифт может быть занят, долго открываться и т.д.)
      tags.has('ladder') ? 2.8 :    // Трап – в два раза больше чем обычный путь, домножаем еще на два, т.к. при исп-и трапа 1 вес = 2 метрам
      0.7                           // Обычный путь – 0.7 сек на метр
)
```

По итогу функции расчета весов ребер и критериев выглядят следующим образом 

```js
// Функция для расчета расстояния между вершинами по их id
export default function calculateWeight({x: x1, y: y1}, {x: x2, y: y2}) {
	const dx = x2 - x1;
	const dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}


// Функция расчета критериев на основе тега (обычное ребро, лифт, трап)
export function calculateWeights(weight, tags = new Set()) {
  // 1 вес = 1 метру
  const distance = weight * (
    tags.has('elevator') ? 0 :  // Вес ребра в случае использования лифта 0
    tags.has('ladder') ? 2 :    // Трап в два раза больше
    1                           // Обычный путь
  );

  return {
    distance: distance,
    steps: distance * (
      tags.has('elevator') ? 0 :    // Лифт – 0 шагов
      tags.has('ladder') ? 3 :      // Преодоление 1 метра трапа занимает три шага
      2                           // Обычный путь – 2 шага на метр
    ),
    time: weight * (
      tags.has('elevator') ? 8.4 :  // Лифт – в 3 раз больше лестницы, т.к. предполагается ожидание (лифт может быть занят, долго открываться и т.д.)
      tags.has('ladder') ? 2.8 :    // Трап – в два раза больше чем обычный путь, домножаем еще на два, т.к. при исп-и трапа 1 вес = 2 метрам
      0.7                           // Обычный путь – 0.7 сек на метр
    )
  };
}
```
