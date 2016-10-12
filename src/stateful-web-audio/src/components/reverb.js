import {connect, nameFn} from '../util';

export const createReverb = ({context, destination, buffer, name}) => {
  const node = context.createConvolver();
  node.toString = nameFn('Reverb', name);
  if (destination) {
    connect(node, destination);
  }
  node.buffer = buffer;
  return node;
};
