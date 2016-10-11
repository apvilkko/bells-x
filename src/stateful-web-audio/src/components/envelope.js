export const triggerEnvelope = ({
  context, param, attack = 0.01, release = 50.0, sustain = 1, mixerGain = 1
}) => {
  const now = context.currentTime;
  param.cancelScheduledValues(now);
  param.setValueAtTime(0, now);
  param.linearRampToValueAtTime(mixerGain * sustain, now + attack);
  param.linearRampToValueAtTime(0, now + attack + release);
};
