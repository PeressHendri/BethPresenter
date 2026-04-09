interface SlidePreviewProps {
  text: string;
  title?: string;
  label?: string;
  className?: string;
}

export function SlidePreview({ text, title, label, className = '' }: SlidePreviewProps) {
  return (
    <div 
      className={`relative aspect-[16/9] w-full bg-black flex items-center justify-center p-12 text-center select-none overflow-hidden rounded-lg border border-border shadow-2xl ${className}`}
    >
      {/* Background Layer (Placeholder for Image/Video) */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary to-black opacity-50"></div>
      
      {/* Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        {label && (
          <div className="absolute top-4 left-4 text-xs font-bold text-accent uppercase tracking-widest opacity-70 bg-black/40 px-2 py-1 rounded">
            {label}
          </div>
        )}
        
        <p 
          className="text-[4.5vw] leading-tight font-bold text-white text-shadow whitespace-pre-wrap"
          style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.4)' }}
        >
          {text || ' '}
        </p>
      </div>

      {title && (
        <div className="absolute bottom-4 left-4 text-[1.2vw] text-text-secondary font-medium italic opacity-60">
          {title}
        </div>
      )}
    </div>
  );
}
