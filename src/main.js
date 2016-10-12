import {
  init,
  start,
  setScene,
  createMixer,
} from './stateful-web-audio';
import {createScene} from './scene';
import tracks from './tracks';

const newScene = ctx => {
  const scene = createScene();
  setScene(ctx, scene);
};

const ctx = init();
createMixer(ctx, {
  [tracks.LOW]: {gain: 0.7},
  [tracks.BELLS]: {gain: 0.2},
  [tracks.BOX]: {gain: 0.4},
  [tracks.TIN]: {gain: 0.2},
});
newScene(ctx);
start(ctx);
