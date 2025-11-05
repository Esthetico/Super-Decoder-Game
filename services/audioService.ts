
// A single AudioContext for the entire app.
// It is initialized on the first user interaction to comply with browser autoplay policies.
let audioContext: AudioContext | null = null;

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
};

// A generic function to play a simple tone.
const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

// A function to play a sequence of notes for more complex sounds.
const playNoteSequence = (notes: { freq: number; dur: number; type?: OscillatorType; delay?: number }[]) => {
    if (!audioContext) return;
    
    let startTime = audioContext.currentTime;

    notes.forEach(note => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = note.type || 'triangle';
        oscillator.frequency.setValueAtTime(note.freq, startTime + (note.delay || 0));
        
        gainNode.gain.setValueAtTime(0.4, startTime + (note.delay || 0));
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + (note.delay || 0) + note.dur);

        oscillator.start(startTime + (note.delay || 0));
        oscillator.stop(startTime + (note.delay || 0) + note.dur);
    });
};

export const playSelectSound = () => {
  initAudioContext();
  playTone(880, 0.05, 'triangle');
};

export const playDeleteSound = () => {
  initAudioContext();
  playTone(440, 0.07, 'square');
};

export const playConfirmSound = () => {
  initAudioContext();
  playNoteSequence([
      { freq: 261.63, dur: 0.08, delay: 0 }, // C4
      { freq: 329.63, dur: 0.08, delay: 0.1 }, // E4
      { freq: 392.00, dur: 0.1, delay: 0.2 }, // G4
  ]);
};

export const playWinSound = () => {
  initAudioContext();
  playNoteSequence([
      { freq: 523.25, dur: 0.1, delay: 0 }, // C5
      { freq: 659.25, dur: 0.1, delay: 0.12 }, // E5
      { freq: 783.99, dur: 0.1, delay: 0.24 }, // G5
      { freq: 1046.50, dur: 0.2, delay: 0.36 }, // C6
  ]);
};

export const playLoseSound = () => {
  initAudioContext();
   playNoteSequence([
      { freq: 392.00, dur: 0.15, delay: 0, type: 'sawtooth' }, // G4
      { freq: 349.23, dur: 0.15, delay: 0.15, type: 'sawtooth' }, // F4
      { freq: 293.66, dur: 0.4, delay: 0.3, type: 'sawtooth' }, // D4
  ]);
};

export const playNewGameSound = () => {
  initAudioContext();
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'square';
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

  oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};
