import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';
import { TranscriptionEntry } from '../types';

type LiveSession = {
  close: () => void;
  sendRealtimeInput: (input: { media: Blob }) => void;
};

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

// Helper to encode raw audio data to base64
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// FIX: Added decode and decodeAudioData helpers to process audio output from the model, as required by the Live API guidelines.
// Helper to decode base64 audio data to raw bytes
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode raw PCM audio data into an AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


// Helper to create a Blob object for the API
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


const LiveTranscription: React.FC = () => {
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [error, setError] = useState<string | null>(null);
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [currentOutput, setCurrentOutput] = useState('');

    const sessionRef = useRef<LiveSession | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    // FIX: Added refs to manage audio output context and playback, which was missing.
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTimeRef = useRef(0);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const historyRef = useRef<HTMLDivElement>(null);
    // FIX: Added refs to track current transcription text to avoid stale state in callbacks.
    const currentInputRef = useRef('');
    const currentOutputRef = useRef('');
    
    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [transcriptionHistory, currentInput, currentOutput]);

    const cleanup = useCallback(() => {
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        // FIX: Added cleanup for output audio context.
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const handleToggleConnection = async () => {
        if (connectionState === 'connected' || connectionState === 'connecting') {
            cleanup();
            setConnectionState('disconnected');
            return;
        }

        setConnectionState('connecting');
        setError(null);
        setCurrentInput('');
        setCurrentOutput('');
        currentInputRef.current = '';
        currentOutputRef.current = '';

        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setConnectionState('connected');
                        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        // FIX: Initialize output audio context for playback.
                        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                        mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current!);
                        scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(audioContextRef.current.destination);
                    },
                    // FIX: Updated onmessage to handle audio output in addition to transcription, as required by the Live API guidelines.
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                            setCurrentOutput(prev => prev + text);
                            currentOutputRef.current += text;
                        } else if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            setCurrentInput(prev => prev + text);
                            currentInputRef.current += text;
                        }

                        if (message.serverContent?.turnComplete) {
                            setTranscriptionHistory(prev => {
                                const newHistory: TranscriptionEntry[] = [...prev];
                                const fullInput = currentInputRef.current.trim();
                                const fullOutput = currentOutputRef.current.trim();
                                if (fullInput) newHistory.push({ type: 'user', text: fullInput });
                                if (fullOutput) newHistory.push({ type: 'model', text: fullOutput });
                                return newHistory;
                            });
                            setCurrentInput('');
                            setCurrentOutput('');
                            currentInputRef.current = '';
                            currentOutputRef.current = '';
                        }
                        
                        const base64EncodedAudioString =
                          message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64EncodedAudioString && outputAudioContextRef.current) {
                          const outputAudioContext = outputAudioContextRef.current;
                          const outputNode = outputAudioContext.createGain();
                          outputNode.connect(outputAudioContext.destination);

                          nextStartTimeRef.current = Math.max(
                            nextStartTimeRef.current,
                            outputAudioContext.currentTime,
                          );
                          const audioBuffer = await decodeAudioData(
                            decode(base64EncodedAudioString),
                            outputAudioContext,
                            24000,
                            1,
                          );
                          const source = outputAudioContext.createBufferSource();
                          source.buffer = audioBuffer;
                          source.connect(outputNode);
                          source.addEventListener('ended', () => {
                            sourcesRef.current.delete(source);
                          });

                          source.start(nextStartTimeRef.current);
                          nextStartTimeRef.current += audioBuffer.duration;
                          sourcesRef.current.add(source);
                        }

                        const interrupted = message.serverContent?.interrupted;
                        if (interrupted) {
                            for (const source of sourcesRef.current.values()) {
                                source.stop();
                                sourcesRef.current.delete(source);
                            }
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('API Error:', e);
                        setError('An API error occurred. Please check the console.');
                        setConnectionState('error');
                        cleanup();
                    },
                    onclose: () => {
                        // This might be called on graceful shutdown too
                        if (connectionState !== 'disconnected') {
                           setConnectionState('disconnected');
                        }
                        cleanup();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            });
            sessionPromise.then(session => { sessionRef.current = session; });

        } catch (err: any) {
            console.error('Connection failed:', err);
            setError(err.message || 'Failed to start session. Check microphone permissions.');
            setConnectionState('error');
            cleanup();
        }
    };
    
    // Cleanup on component unmount
    useEffect(() => {
      return () => {
        cleanup();
      }
    }, [cleanup]);

    const getStatusIndicator = () => {
        switch (connectionState) {
            case 'disconnected': return <><span className="w-3 h-3 bg-gray-500 rounded-full"></span><span>Disconnected</span></>;
            case 'connecting': return <><span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span><span>Connecting...</span></>;
            case 'connected': return <><span className="w-3 h-3 bg-green-500 rounded-full"></span><span>Connected</span></>;
            case 'error': return <><span className="w-3 h-3 bg-red-500 rounded-full"></span><span>Error</span></>;
        }
    };

    return (
        <div className="fixed bottom-4 right-4 left-4 z-20 bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl max-h-[40vh] flex flex-col">
            <header className="flex items-center justify-between p-3 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-cyan-400">Live Transcription</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        {getStatusIndicator()}
                    </div>
                </div>
                <button
                    onClick={handleToggleConnection}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
                        ${connectionState === 'connected' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-cyan-600 hover:bg-cyan-500 focus:ring-cyan-500'}
                        ${connectionState === 'connecting' && 'opacity-50 cursor-not-allowed'}`}
                    disabled={connectionState === 'connecting'}
                >
                    {connectionState === 'connected' ? 'Stop Listening' : 'Start Listening'}
                </button>
            </header>
            <div ref={historyRef} className="flex-grow p-4 overflow-y-auto text-sm">
                {transcriptionHistory.length === 0 && !currentInput && !currentOutput && (
                    <div className="text-center text-gray-500 h-full flex items-center justify-center">
                        <p>Click "Start Listening" and begin speaking.</p>
                    </div>
                )}
                {transcriptionHistory.map((entry, index) => (
                    <div key={index} className={`mb-3 ${entry.type === 'user' ? 'text-gray-200' : 'text-cyan-300'}`}>
                        <strong className="capitalize">{entry.type}: </strong>{entry.text}
                    </div>
                ))}
                {currentInput && (
                     <div className="text-gray-400 italic">
                        <strong>User: </strong>{currentInput}
                    </div>
                )}
                 {currentOutput && (
                     <div className="text-cyan-400 italic">
                        <strong>Model: </strong>{currentOutput}
                    </div>
                )}
                {error && <p className="text-red-400 mt-2">Error: {error}</p>}
            </div>
        </div>
    );
};

export default LiveTranscription;
