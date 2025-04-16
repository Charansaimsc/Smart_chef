import React, { useRef, useState } from 'react';
import { Mic } from 'lucide-react';

const AudioRecorder = ({ onAudioCaptured, isRecording, setIsRecording }) => {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recordingStatus, setRecordingStatus] = useState('idle');

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      // Request microphone access with specific audio constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      // Determine supported MIME types
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }
      
      // Create MediaRecorder with the best available format
      const options = { mimeType };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      console.log(`Recording started with MIME type: ${mimeType}`);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
          console.log(`Received audio chunk: ${e.data.size} bytes`);
        }
      };
      
      mediaRecorder.onstop = async () => {
        setRecordingStatus('processing');
        console.log('Recording stopped, processing audio...');
        
        // Create the audio blob with the correct MIME type
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log(`Created audio blob: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
        
        // Send the audio data to the parent component
        onAudioCaptured(audioBlob);
        setRecordingStatus('idle');
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setRecordingStatus('error');
        setIsRecording(false);
      };
      
      // Start recording with a timeslice of 1 second
      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingStatus('recording');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setRecordingStatus('error');
      alert('Unable to access microphone. Please check your permissions and ensure no other application is using the microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Determine button style based on recording status
  const getButtonClass = () => {
    switch (recordingStatus) {
      case 'recording':
        return 'icon-button recording';
      case 'processing':
        return 'icon-button processing';
      case 'error':
        return 'icon-button error';
      default:
        return 'icon-button';
    }
  };

  return (
    <div className="audio-recorder">
      <button 
        className={getButtonClass()}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={recordingStatus === 'processing'}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        <Mic size={24} />
        {recordingStatus === 'processing' ? 'Processing...' : 
         recordingStatus === 'recording' ? 'Stop' : 'Speak'}
      </button>
    </div>
  );
};

export default AudioRecorder;