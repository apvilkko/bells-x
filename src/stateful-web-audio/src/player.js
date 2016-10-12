import {playSample} from './components';
import {instanceName} from './scene';

export const playNote = (ctx, key, note) => {
  const {state: {scene: {parts}}} = ctx;
  const instrument = parts[key].instrument;
  const instance = ctx.runtime.instances[instanceName(instrument.name, key)];
  playSample({ctx, instance, note});
};
