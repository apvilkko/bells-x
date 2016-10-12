import {commit} from './state';
import {getContext, connect, disconnect, nameFn} from './util';
import {
  createCompressor,
  createVCA,
} from './components';

export const initialState = ({
  tracks: {}
});

export const createInsertEffect = ({context, effect}) => {
  const dry = createVCA({context, gain: 1, name: `insertDry ${effect}`});
  const wet = createVCA({context, gain: 0.5, name: `insertWet ${effect}`});
  const input = createVCA({context, gain: 1, name: `insertIn ${effect}`});
  const output = createVCA({context, gain: 1, name: `insertOut ${effect}`});
  connect(input, dry);
  connect(input, effect);
  connect(effect, wet);
  connect(wet, output);
  connect(dry, output);
  return {
    dry,
    wet,
    effect,
    input,
    output,
    toString: nameFn('InsertEffect', `${effect}`)
  };
};

const createTrack = spec => ({...spec, inserts: []});

export const setNodeGain = (node, value) => {
  node.gain.value = value; // eslint-disable-line
};

export const setTrackGain = (mixer, track, value) => {
  setNodeGain(mixer[track].gain, value);
};

export const getInsert = (ctx, key, index) =>
  ctx.state.mixer.tracks[key].inserts[index].name;

export const mixBus = ctx => ctx.state.mixer.tracks.master.mixBus;
export const trackGain = (ctx, key) => ctx.state.mixer.tracks[key].gain;

export const addInsert = (ctx, key, insertEffect, index = -1) => {
  const {state: {mixer: {tracks}}} = ctx;
  const inserts = tracks[key].inserts;
  const dest = mixBus(ctx);
  const pos = index < 0 ? inserts.length : index;
  const addingToEnd = pos === inserts.length;
  if (pos > 0) {
    const next = addingToEnd ? dest : inserts[pos];
    disconnect(inserts[pos - 1], next);
    connect(inserts[pos - 1], insertEffect);
  }
  if (inserts.length === 0) {
    try {
      disconnect(tracks[key].gain, dest);
    } catch (err) {
      console.log(err); // eslint-disable-line no-console
    }
    connect(tracks[key].gain, insertEffect);
  }
  const next = pos >= (inserts.length - 1) ? dest : inserts[pos + 1];
  connect(insertEffect, next);
  commit(ctx, ['mixer', 'tracks', key, 'inserts'],
    [...inserts.slice(0, pos), insertEffect, ...inserts.slice(pos + 1)]);
};

export const createMixer = (ctx, trackSpec) => {
  const context = getContext(ctx);
  const masterGain = createVCA({
    context, gain: 1, destination: context.destination, name: 'masterGain'
  });
  const masterLimiter = createCompressor({
    context, destination: masterGain, name: 'masterLimiter'
  });
  const mixBus = createVCA({
    context, gain: 0.4, destination: masterLimiter, name: 'masterMixBus'
  });
  const tracks = {
    master: createTrack({
      gain: masterGain,
      limiter: masterLimiter,
      mixBus,
    }),
  };
  Object.keys(trackSpec).forEach(track => {
    const gainValue = trackSpec[track].gain || 0.6;
    tracks[track] = createTrack({
      gainValue,
      gain: createVCA({
        context,
        gain: gainValue,
        name: `trackGain:${track}`
      })
    });
  });

  commit(ctx, 'mixer.tracks', tracks);
};
