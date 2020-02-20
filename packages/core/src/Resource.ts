export type Resource<N extends string | number | symbol, A, E = never> = {
  [name in N]: { kind: string; name: N; spec: A; events?: E };
};
