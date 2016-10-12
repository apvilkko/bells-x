import {DEBUG} from './debug';

export const getContext = ctx => ctx.runtime.instances.context;

const log = (from, to, disconnect) => {
  if (!DEBUG) return;
  const str = `${disconnect ? 'disconnect' : 'connect'} ${from} => ${to}`;
  console.log(str); // eslint-disable-line
};

const output = from => (from.output ? from.output : from);
const input = to => (to.input ? to.input : to);

export const connect = (from, to) => {
  log(from, to);
  output(from).connect(input(to));
};

export const disconnect = (node, from) => {
  const src = output(node);
  const dest = input(from);
  if (from) {
    log(node, from, true);
    src.disconnect(dest);
    return;
  }
  log(node, null, true);
  src.disconnect();
};

export const nameFn = (name1, name2) => () => `[${name1} ${name2}]`;
