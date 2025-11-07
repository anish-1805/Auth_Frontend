import React, { useState, useRef, useEffect } from 'react';
import './OTPInput.css';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  loading?: boolean;
  error?: string;
  autoFocus?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  loading = false,
  error = '',
  autoFocus = true,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all fields are filled
    if (newOtp.every((digit) => digit !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];

      if (otp[index]) {
        // Clear current field
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous field and clear it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus the next empty field or the last field
    const nextEmptyIndex = newOtp.findIndex((digit) => digit === '');
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
    inputRefs.current[focusIndex]?.focus();

    // Call onComplete if all fields are filled
    if (newOtp.every((digit) => digit !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const clearOtp = () => {
    setOtp(new Array(length).fill(''));
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="otp-input-container">
      <div className="otp-input-group">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={`otp-input ${error ? 'error' : ''} ${loading ? 'loading' : ''}`}
            disabled={loading}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      {error && (
        <div className="otp-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={clearOtp}
        className="otp-clear-button"
        disabled={loading || otp.every((digit) => digit === '')}
      >
        Clear
      </button>
    </div>
  );
};

export default OTPInput;
