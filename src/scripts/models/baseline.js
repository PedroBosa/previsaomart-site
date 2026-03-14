export function predictBaseline(train, test) {
  const tail = train.slice(-12);
  const avg = tail.length
    ? tail.reduce((acc, item) => acc + item.value, 0) / tail.length
    : 0;

  return test.map(() => avg);
}
