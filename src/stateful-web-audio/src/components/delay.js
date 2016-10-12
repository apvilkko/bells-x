import {connect, nameFn} from '../util';

export const createDelay = ({context, destination, delayTime, name}) => {
  const node = context.createDelay();
  node.delayTime.value = delayTime;
  node.toString = nameFn('Delay', name);
  if (destination) {
    connect(node, destination);
  }
  return node;
};
