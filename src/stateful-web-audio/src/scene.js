import {commit} from './state';
import {connect, getContext} from './util';
import {loadSamples} from './components/sampler';
import {loadSample} from './loader';
import {createInsertEffect, addInsert, setNodeGain, trackGain} from './mixer';
import * as components from './components';

export const initialState = ({
  parts: {},
  master: {},
  shufflePercentage: 0,
  tempo: 120,
});

const addInsertEffect = (ctx, key, insert, index, insertSpec = {}) => {
  const context = getContext(ctx);
  const spec = {...insertSpec, context};
  const insertEffect = createInsertEffect({
    context,
    effect: components[`create${insert.name}`](spec)
  });
  addInsert(ctx, key, insertEffect, index);
  if (insert.params) {
    Object.keys(insert.params).forEach(param => {
      setNodeGain(insertEffect[param], insert.params[param]);
    });
  }
};

const setupInsert = (ctx, key, insert, index) => {
  if (insert.sample) {
    loadSample(ctx, insert.sample).then(() => {
      const buffers = ctx.runtime.buffers;
      addInsertEffect(ctx, key, insert, index, {buffer: buffers[insert.sample]});
    });
  } else {
    addInsertEffect(ctx, key, insert, index, insert);
  }
};

export const instanceName = (name, key) => `${name}::${key}`;

const setupInstrument = (ctx, key, instrument) => {
  loadSamples(ctx, instrument);
  const context = getContext(ctx);
  const spec = {...instrument, name: `${key}`, context};
  const inst = components[`create${instrument.name}`](spec);
  connect(inst, trackGain(ctx, key));
  ctx.runtime.instances[instanceName(instrument.name, key)] = inst;
};

const setupScene = ctx => {
  const {state: {scene: {parts}}} = ctx;
  Object.keys(parts).forEach(part => {
    setupInstrument(ctx, part, parts[part].instrument);
    if (parts[part].inserts) {
      parts[part].inserts.forEach((insert, i) => setupInsert(ctx, part, insert, i));
    }
  });
};

export const setScene = (ctx, scene) => {
  commit(ctx, 'scene', scene);
  setupScene(ctx);
};
