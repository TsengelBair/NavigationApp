// Функция для расчета расстояния между вершинами по их id
export default function calculateWeight({x: x1, y: y1}, {x: x2, y: y2}) {
	const dx = x2 - x1;
	const dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}


// Функция расчета критериев на основе тега (обычное ребро, лифт, лестница)
export function calculateWeights(weight, tags = new Set()) {
  // 1 вес = 1 метру
  const distance = weight * (
    tags.has('elevator') ? 0 :  // Вес ребра в случае использования лифта 0
    tags.has('ladder') ? 2 :    // Лестница в два раза больше
    1                           // Обычный путь
  );

  return {
    distance: distance,
    steps: distance * (
      tags.has('elevator') ? 0 :    // Лифт – 0 шагов
      tags.has('ladder') ? 3 :      // Преодоление 1 метра лестницы занимает три шага
      2                           // Обычный путь – 2 шага на метр
    ),
    time: weight * (
      tags.has('elevator') ? 8.4 :  // Лифт – в 3 раз больше лестницы, т.к. предполагается ожидание (лифт может быть занят, долго открываться и т.д.)
      tags.has('ladder') ? 2.8 :    // Лестница – в два раза больше чем обычный путь, домножаем еще на два, т.к. при исп-и лестницы 1 вес = 2 метрам
      0.7                           // Обычный путь – 0.7 сек на метр
    )
  };
}
