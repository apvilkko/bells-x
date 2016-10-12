import {connect, nameFn} from '../util';

export const createVCA = ({context, gain = 0.5, destination, name}) => {
  const node = context.createGain();
  node.gain.value = gain;
  node.toString = nameFn('VCA', name);
  if (destination) {
    connect(node, destination);
  }
  return node;
};
