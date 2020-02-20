export type Link<N extends string, Eff, Evn> = {
  [k in N]: {
    effects: Eff;
    events: Evn;
  };
};
