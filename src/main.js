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
  [tracks.LOW1]: {gain: 0.7},
  [tracks.LOW2]: {gain: 0.7},
  [tracks.BELLS]: {gain: 0.5},
  [tracks.BOX]: {gain: 0.5},
  [tracks.TIN]: {gain: 0.1},
});
newScene(ctx);
start(ctx);
