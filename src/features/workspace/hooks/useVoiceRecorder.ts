/**
 * useVoiceRecorder - Live-streaming voice-to-thought via OpenAI Whisper
 * 
 * Records audio in short chunks, sends each to the transcribe-voice
 * edge function, and streams text back as it arrives.
 */

import { useState, useRef, useCallback } from 'react';

const SUPABASE_URL = 'https://opjltuyirkbbpwgkavjq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wamx0dXlpcmtiYnB3Z2thdmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MjEyMjcsImV4cCI6MjA2ODI5NzIyN30.LEiJvfprvGbLk7ni4SavBQJl8SYc32ugdCQUGg8DTaQ';

// Chunk duration in ms — short for near-live feel
const CHUNK_DURATION = 3000;

interface UseVoiceRecorderOptions {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceRecorder({ onTranscript, onError }: UseVoiceRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingRequests = useRef(0);

  const sendChunk = useCallback(async (audioBlob: Blob) => {
    if (audioBlob.size < 1000) return; // Skip tiny chunks
    
    pendingRequests.current++;
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/transcribe-voice`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.text && data.text.trim()) {
        onTranscript(data.text.trim());
      }
    } catch (err) {
      console.error('Voice transcription error:', err);
      onError?.(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      pendingRequests.current--;
      if (pendingRequests.current === 0) {
        setIsProcessing(false);
      }
    }
  }, [onTranscript, onError]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Send any remaining chunks
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          chunksRef.current = [];
          sendChunk(blob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Periodically stop/restart to send chunks for "live" feel
      intervalRef.current = setInterval(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          
          // Restart after a tiny gap
          setTimeout(() => {
            if (streamRef.current && streamRef.current.active) {
              const newRecorder = new MediaRecorder(streamRef.current, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
                  ? 'audio/webm;codecs=opus' 
                  : 'audio/webm',
              });
              mediaRecorderRef.current = newRecorder;
              
              newRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                  chunksRef.current.push(e.data);
                }
              };
              
              newRecorder.onstop = () => {
                if (chunksRef.current.length > 0) {
                  const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                  chunksRef.current = [];
                  sendChunk(blob);
                }
              };
              
              newRecorder.start();
            }
          }, 50);
        }
      }, CHUNK_DURATION);
    } catch (err) {
      console.error('Microphone access error:', err);
      onError?.('Microphone access denied. Please enable microphone permissions.');
    }
  }, [sendChunk, onError]);

  const stopRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsRecording(false);
  }, []);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
  };
}
