import {connect, nameFn, getContext} from '../util';
import {createVCA} from './vca';
import {loadSample} from '../loader';
import {triggerEnvelope} from './envelope';

const getRateFromPitch = pitch => Math.pow(2, (pitch * 100) / 1200);
const normalizeVelocity = velocity => velocity / 127.0;

const getDestination = inst => {
  inst.poolIndex++;
  if (inst.poolIndex >= inst.poolSize) {
    inst.poolIndex = 0;
  }
  return inst.pool[inst.poolIndex];
};

const getSample = (inst, pitch) => inst.sampleMap[pitch] || inst.sampleMap.rest;

const getBuffer = (ctx, inst, pitch) => {
  const sample = getSample(inst, pitch);
  return ctx.runtime.buffers[sample.sample];
};

const getPitch = (inst, pitch) => {
  const sample = getSample(inst, pitch);
  return pitch + (sample.root || 0);
};

export const playSample = ({ctx, instance, note}) => {
  const context = getContext(ctx);
  const destination = getDestination(instance);
  const buffer = getBuffer(ctx, instance, note.pitch);
  if (!buffer) {
    return;
  }
  const node = context.createBufferSource();
  node.buffer = buffer;
  //connect(node, destination || context.destination);
  node.connect(destination || context.destination);
  const pitch = getPitch(instance, note.pitch);
  if (pitch !== 0) {
    node.playbackRate.value = getRateFromPitch(pitch);
  }
  node.start(0);
  triggerEnvelope({
    context,
    param: destination.gain,
    sustain: normalizeVelocity(note.velocity),
  });
};

const getSampleMap = sampleMap => (typeof sampleMap === 'string' ? {
  rest: {sample: sampleMap, root: 0}
} : sampleMap);

export const loadSamples = (ctx, instrument) => {
  Object.values(getSampleMap(instrument.sampleMap)).forEach(val => {
    loadSample(ctx, val.sample);
  });
};

export const createSampler = ({
  context, destination, polyphony = 4, sampleMap, name
}) => {
  const pool = [];
  const output = createVCA({context, gain: 1, name: 'SamplerOutput', destination});
  for (let i = 0; i < polyphony; ++i) {
    const poolVCA = createVCA({context, gain: 1, name: `SamplerPool${i}`});
    connect(poolVCA, output);
    pool.push(poolVCA);
  }
  return {
    output,
    pool,
    sampleMap: getSampleMap(sampleMap),
    poolIndex: 0,
    poolSize: polyphony,
    toString: nameFn('Sampler', name)
  };
};
