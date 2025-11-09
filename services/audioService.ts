
// A single AudioContext for the entire app.
// It is initialized on the first user interaction to comply with browser autoplay policies.
let audioContext: AudioContext | null = null;
let musicGainNode: GainNode | null = null;
let analyserNode: AnalyserNode | null = null;
let isAudioInitialized = false;

// Function to initialize the entire audio system on first user interaction
export const initAudio = () => {
  if (isAudioInitialized || !window.AudioContext) return;
  
  audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Music setup
  musicGainNode = audioContext.createGain();
  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 256;

  musicGainNode.connect(analyserNode);
  analyserNode.connect(audioContext.destination);
  
  createAndPlayMusicLoop();
  
  setMusicVolume(0.2); // Start with a low volume

  isAudioInitialized = true;
};

const createAndPlayMusicLoop = () => {
    if (!audioContext) return;
    
    const bassSequence = [
        { note: 'G2', duration: 0.25, time: 0 },
        { note: 'G2', duration: 0.25, time: 0.5 },
        { note: 'D3', duration: 0.25, time: 1 },
        { note: 'D3', duration: 0.25, time: 1.5 },
        { note: 'A#2', duration: 0.25, time: 2 },
        { note: 'A#2', duration: 0.25, time: 2.5 },
        { note: 'F2', duration: 0.25, time: 3 },
        { note: 'F2', duration: 0.25, time: 3.5 },
    ];
    
    const arpSequence = [
        { note: 'D4', duration: 0.125, time: 0 }, { note: 'F4', duration: 0.125, time: 0.25 },
        { note: 'A#4', duration: 0.125, time: 0.5 }, { note: 'D5', duration: 0.125, time: 0.75 },
        { note: 'F4', duration: 0.125, time: 1.0 }, { note: 'A#4', duration: 0.125, time: 1.25 },
        { note: 'D5', duration: 0.125, time: 1.5 }, { note: 'F5', duration: 0.125, time: 1.75 },
        { note: 'A#4', duration: 0.125, time: 2.0 }, { note: 'C5', duration: 0.125, time: 2.25 },
        { note: 'E5', duration: 0.125, time: 2.5 }, { note: 'G5', duration: 0.125, time: 2.75 },
        { note: 'C5', duration: 0.125, time: 3.0 }, { note: 'E5', duration: 0.125, time: 3.25 },
        { note: 'G5', duration: 0.125, time: 3.5 }, { note: 'C6', duration: 0.125, time: 3.75 },
    ];

    const noteToFreq = (note: string): number => {
        const notes: { [key: string]: number } = {
            'F2': 87.31, 'G2': 98.00, 'A#2': 116.54, 'D3': 146.83, 'D4': 293.66, 'F4': 349.23,
            'A#4': 466.16, 'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46,
            'G5': 783.99, 'C6': 1046.50
        };
        return notes[note] || 440;
    };
    
    const loopLength = 4;

    const scheduleNotes = (seq: any[], type: OscillatorType, gain: number) => {
        const now = audioContext!.currentTime;
        seq.forEach(n => {
            const osc = audioContext!.createOscillator();
            const noteGain = audioContext!.createGain();
            osc.connect(noteGain);
            noteGain.connect(musicGainNode!);

            osc.type = type;
            osc.frequency.setValueAtTime(noteToFreq(n.note), now + n.time);
            noteGain.gain.setValueAtTime(gain, now + n.time);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.duration);

            osc.start(now + n.time);
            osc.stop(now + n.time + n.duration);
        });
    };

    const playLoop = () => {
        scheduleNotes(bassSequence, 'sine', 0.5);
        scheduleNotes(arpSequence, 'triangle', 0.15);
    }
    
    playLoop();
    setInterval(playLoop, loopLength * 1000);
}

export const setMusicVolume = (level: number) => {
  if (!musicGainNode || !audioContext) return;
  musicGainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, level * 0.3), audioContext.currentTime + 0.1);
};

export const getAnalyser = (): AnalyserNode | null => {
    return analyserNode;
}

// A generic function to play a simple tone for SFX.
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
  playTone(880, 0.05, 'triangle');
};

export const playDeleteSound = () => {
  playTone(440, 0.07, 'square');
};

export const playConfirmSound = () => {
  playNoteSequence([
      { freq: 261.63, dur: 0.08, delay: 0 }, // C4
      { freq: 329.63, dur: 0.08, delay: 0.1 }, // E4
      { freq: 392.00, dur: 0.1, delay: 0.2 }, // G4
  ]);
};

export const playWinSound = () => {
  playNoteSequence([
      { freq: 523.25, dur: 0.1, delay: 0 }, // C5
      { freq: 659.25, dur: 0.1, delay: 0.12 }, // E5
      { freq: 783.99, dur: 0.1, delay: 0.24 }, // G5
      { freq: 1046.50, dur: 0.2, delay: 0.36 }, // C6
  ]);
};

export const playLoseSound = () => {
   playNoteSequence([
      { freq: 392.00, dur: 0.15, delay: 0, type: 'sawtooth' }, // G4
      { freq: 349.23, dur: 0.15, delay: 0.15, type: 'sawtooth' }, // F4
      { freq: 293.66, dur: 0.4, delay: 0.3, type: 'sawtooth' }, // D4
  ]);
};

export const playNewGameSound = () => {
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

export const playTickSound = () => {
  playTone(1200, 0.02, 'square');
};
