import React, { useState, useRef, useEffect } from 'react';

interface JumboInputBarProps {
  className?: string;
}

const detectLinkType = (url: string) => {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/\.pdf($|\?)/i.test(url)) return 'pdf';
  if (/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}/i.test(url)) return 'generic';
  return null;
};

const getButtonText = (type: string | null) => {
  switch (type) {
    case 'youtube':
      return 'Fetch Video';
    case 'pdf':
      return 'Get Document';
    case 'generic':
      return 'Download File';
    default:
      return 'Paste Link';
  }
};

export const JumboInputBar: React.FC<JumboInputBarProps> = ({ className = '' }) => {
  const [value, setValue] = useState('');
  const [clipboardUrl, setClipboardUrl] = useState('');
  const [detecting, setDetecting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Try to read clipboard on mount
    if (navigator.clipboard) {
      navigator.clipboard.readText().then(text => {
        if (/https?:\/\//.test(text)) setClipboardUrl(text);
      });
    }
  }, []);

  const handlePaste = async () => {
    if (clipboardUrl) {
      setValue(clipboardUrl);
      setDetecting(true);
      setTimeout(() => setDetecting(false), 800);
    } else if (navigator.clipboard) {
      const text = await navigator.clipboard.readText();
      setValue(text);
      setDetecting(true);
      setTimeout(() => setDetecting(false), 800);
    }
  };

  const linkType = detectLinkType(value);
  const buttonText = getButtonText(linkType);

  return (
    <div
      className={`relative flex items-center bg-[#181C24] rounded-2xl shadow-lg border border-[#23272F] px-2 py-2 sm:py-3 sm:px-4 transition-all ${className}`}
      style={{ boxShadow: 'inset 0 2px 12px #00000033, 0 2px 16px #0ea5e933' }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Paste a link to download..."
        className="flex-1 bg-transparent text-lg sm:text-2xl px-3 py-2 outline-none text-white font-mono placeholder:text-gray-400"
        style={{ boxShadow: 'inset 0 1.5px 6px #00000022' }}
      />
      <button
        type="button"
        onClick={handlePaste}
        className={`absolute right-32 sm:right-40 top-1/2 -translate-y-1/2 bg-elite-gold text-elite-navy font-bold px-3 py-1.5 rounded-lg shadow transition-all border border-elite-gold/40 hover:bg-elite-gold-dark active:scale-95 ${detecting ? 'animate-pulse' : ''}`}
        aria-label="Paste Link"
      >
        Paste Link
      </button>
      <button
        type="submit"
        className={`ml-2 bg-electric-blue text-white font-bold px-5 py-2 rounded-xl shadow transition-all hover:bg-elite-gold focus:ring-2 focus:ring-elite-gold/60 active:scale-95 text-base sm:text-lg`}
        style={{ background: 'linear-gradient(90deg, #0ea5e9 60%, #C5A059 100%)' }}
      >
        {buttonText}
      </button>
      {clipboardUrl && !value && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-elite-gold animate-bounce-subtle">Link detected in clipboard!</span>
      )}
    </div>
  );
};
