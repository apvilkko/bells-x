import {randRange, sample, maybe} from './util';
import tracks from './tracks';

const TEMPO = 110;

const urlify = sample => `samples/${sample}.ogg`;

const createNote = (velocity = 0, pitch = null) => ({velocity, pitch});

const iteratePattern = ({patternLength, pitch}, iterator) =>
  Array.from({length: patternLength}).map((_, index) => iterator(index, pitch));

const empty = () => createNote();

const reverbSpec = {
  name: 'Reverb',
  params: {dry: 0.9, wet: 0.3},
  sample: urlify('impulse1')
};

const createLow = scene => {
  const notes = [0, 1, 2];
  const patternLength = randRange(100, 130);
  const shifted = sample(notes);
  const portion = Math.floor(patternLength / notes.length);
  const indexes = notes.map(i => (i * portion + randRange(0, portion - 4)));
  const pattern = iteratePattern({patternLength, pitch: 0}, empty);
  indexes.forEach((pos, i) => {
    pattern[pos] = createNote(127, shifted === i ? 12 : 0);
  });
  scene.parts[tracks.LOW] = {
    instrument: {
      name: 'Sampler',
      sampleMap: {
        12: {
          sample: urlify('low2'),
          root: -12,
        },
        rest: {
          sample: urlify('low1'),
        }
      }
    },
    pattern,
    inserts: [reverbSpec],
  };
};

const createBells = scene => {
  const patternLength = randRange(78, 82);
  const pattern = iteratePattern({patternLength, pitch: 0}, empty);
  pattern[0] = createNote(127, 0);
  scene.parts[tracks.BELLS] = {
    instrument: {
      name: 'Sampler',
      sampleMap: urlify('bells')
    },
    pattern,
    inserts: [{
      name: 'Reverb',
      params: {dry: 0.9, wet: 0.8},
      sample: urlify('impulse2')
    }],
  };
};

const createMusicBox = scene => {
  const patternLength = randRange(63, 66);
  const pattern = iteratePattern({patternLength, pitch: 0}, empty);
  const pos2 = randRange(40, 50);
  pattern[randRange(2, 7)] = createNote(127, 0);
  pattern[pos2] = createNote(100, 0);
  pattern[pos2 + randRange(2, 4)] = createNote(105, -4);
  scene.parts[tracks.BOX] = {
    instrument: {
      name: 'Sampler',
      sampleMap: urlify('musicbox')
    },
    pattern,
    inserts: [{
      name: 'Reverb',
      params: {dry: 0.9, wet: 0.8},
      sample: urlify('impulse3')
    }],
  };
};

const createTinkerBell = scene => {
  const patternLength = randRange(28, 40);
  let count = 0;
  const pattern = iteratePattern({patternLength, pitch: 0}, i => {
    if (count === i) {
      const len = maybe({75: 3, rest: 2});
      count += len;
      return createNote(randRange(100, 127), maybe({
        28: 5,
        29: -7,
        18: 0,
        rest: 3,
      }));
    }
    return createNote();
  });
  scene.parts[tracks.TIN] = {
    instrument: {
      name: 'Sampler',
      sampleMap: urlify('tinker'),
    },
    pattern,
    inserts: [{
      name: 'Delay',
      params: {dry: 1, wet: 0.2},
      delayTime: 0.66 * 60.0 / TEMPO,
    }, {
      name: 'Reverb',
      params: {dry: 0.9, wet: 0.7},
      sample: urlify('plate')
    }],
  };
};

export const createScene = () => {
  const newScene = {
    master: {},
    tempo: TEMPO,
    shufflePercentage: 0,
    parts: {}
  };
  createLow(newScene);
  createBells(newScene);
  createMusicBox(newScene);
  createTinkerBell(newScene);
  return newScene;
};
