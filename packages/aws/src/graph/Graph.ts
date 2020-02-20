export interface Node<A> {
  index: number;
  payload: A;
}

export type Edge = [number, number];

export type Graph<A> = [Node<A>[], Edge[]];

export const node = <A>(index: number, payload: A): Node<A> => ({ index, payload });
