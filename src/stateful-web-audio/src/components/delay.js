import {connect} from '../util';

export const createDelay = ({context, destination, delayTime}) => {
  const node = context.createDelay();
  node.delayTime.value = delayTime;
  if (destination) {
    connect(node, destination);
  }
  return node;
};
