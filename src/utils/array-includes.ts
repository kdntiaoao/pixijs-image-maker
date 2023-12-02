export const arrayIncludes = <T extends unknown[]>(array: T, element: unknown): element is T[number] => {
  return array.includes(element)
}
