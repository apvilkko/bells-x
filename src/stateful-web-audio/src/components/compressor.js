import {connect, nameFn} from '../util';

export const createCompressor = ({context, destination, name}) => {
  const node = context.createDynamicsCompressor();
  node.threshold.value = -8;
  node.knee.value = 4;
  node.ratio.value = 10;
  //node.reduction.value = -10;
  node.attack.value = 0.005;
  node.release.value = 0.2;
  node.toString = nameFn('Compressor', name);
  if (destination) {
    connect(node, destination);
  }
  return node;
};
