import { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';

import 'plyr/dist/plyr.css';
import './YouTubePlyrPlayer.css';

export interface YouTubePlyrPlayerProps {
  videoId: string;
  startSeconds?: number;
  endSeconds?: number;
}

/**
 * YouTube playback with Plyr chrome (custom controls, nocookie host) so the
 * experience matches typical LMS players instead of a raw YouTube iframe UI.
 */
export function YouTubePlyrPlayer({ videoId, startSeconds, endSeconds }: YouTubePlyrPlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const el = hostRef.current;
    if (!el || !videoId) return;

    // Reset error state when videoId changes
    setHasError(false);

    const youtube: Record<string, string | number | boolean> = {
      rel: 0,
      modestbranding: 1,
      iv_load_policy: 3,
      customControls: true,
    };
    if (startSeconds != null && startSeconds > 0) {
      youtube.start = Math.floor(startSeconds);
    }
    if (endSeconds != null && endSeconds > 0) {
      youtube.end = Math.floor(endSeconds);
    }

    const player = new Plyr(el, {
      ratio: '16:9',
      hideControls: true,
      clickToPlay: true,
      fullscreen: { enabled: true, iosNative: false },
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'settings',
        'fullscreen',
      ],
      settings: ['quality', 'speed'],
      youtube,
    });

    player.on('error', () => {
      // Plyr fires this when the YouTube IFrame API encounters an error
      // Only set error if still mounted to prevent race conditions during cleanup
      if (isMounted) {
        setHasError(true);
      }
    });

    playerRef.current = player;
    return () => {
      isMounted = false;
      try {
        player.destroy();
      } catch (e) {}
      playerRef.current = null;
    };
  }, [videoId, startSeconds, endSeconds]);

  if (hasError) {
    return (
      <div className="youtube-plyr-wrap yt-error-fallback">
        <div className="yt-error-content">
          <svg className="yt-error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3>Video Unavailable</h3>
          <p>Playback on other websites has been disabled by the video owner.</p>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="yt-watch-btn"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" className="yt-btn-icon">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Watch on YouTube
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div className="youtube-plyr-wrap" style={{ flex: 1, minHeight: 0 }}>
        <div
          ref={hostRef}
          data-plyr-provider="youtube"
          data-plyr-embed-id={videoId}
        />
      </div>
      <div style={{
        marginTop: '8px',
        padding: '12px',
        background: '#1e293b',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: '#f1f5f9',
        fontSize: '14px'
      }}>
        <span>Having trouble playing this video?</span>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="yt-watch-btn"
          style={{ margin: 0, padding: '6px 12px', fontSize: '13px' }}
        >
          <svg fill="currentColor" viewBox="0 0 24 24" className="yt-btn-icon" style={{ width: '16px', height: '16px' }}>
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          Watch on YouTube
        </a>
      </div>
    </div>
  );
}
