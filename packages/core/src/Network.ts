export type Edges<N extends string> = {
  [name in N]: any;
};

export type Vertices<N extends string> = {
  [name in N]: any;
};

export type Links<V extends Vertices<any>> = {
  [k in keyof V]?: any;
};

export type Names<N extends string | number | symbol> = {
  [k in N]: any;
};

export interface Network<V extends Vertices<any>, E extends Edges<any>, L extends Links<V>, N extends Names<any>> {
  resources: E;
  lambdas: V;
  links: L;
  names: N;
}
