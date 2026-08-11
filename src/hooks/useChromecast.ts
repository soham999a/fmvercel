import { useEffect, useState } from 'react';

// Google Cast sender SDK integration. Loads the framework script once,
// exposes cast availability and a simple castStation() action.
const CAST_SRC = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';

declare global {
  interface Window {
    __onGCastApiAvailable?: (available: boolean) => void;
    cast?: any;
    chrome?: any;
  }
}

let loaded = false;

export function useChromecast() {
  const [available, setAvailable] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (loaded) {
      setAvailable(!!window.cast?.framework);
      return;
    }
    window.__onGCastApiAvailable = (isAvailable: boolean) => {
      if (!isAvailable) return;
      const context = window.cast.framework.CastContext.getInstance();
      context.setOptions({
        receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      });
      setAvailable(true);
      context.addEventListener(
        window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        (e: any) => {
          setConnected(
            e.sessionState === window.cast.framework.SessionState.SESSION_STARTED ||
            e.sessionState === window.cast.framework.SessionState.SESSION_RESUMED
          );
        },
      );
    };
    const script = document.createElement('script');
    script.src = CAST_SRC;
    script.async = true;
    document.head.appendChild(script);
    loaded = true;
  }, []);

  async function cast(url: string, title: string, image?: string) {
    if (!window.cast?.framework) return;
    const context = window.cast.framework.CastContext.getInstance();
    try {
      await context.requestSession();
      const session = context.getCurrentSession();
      if (!session) return;
      const mediaInfo = new window.chrome.cast.media.MediaInfo(url, 'audio/mpeg');
      mediaInfo.metadata = new window.chrome.cast.media.MusicTrackMediaMetadata();
      mediaInfo.metadata.title = title;
      if (image) mediaInfo.metadata.images = [new window.chrome.cast.Image(image)];
      const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
      await session.loadMedia(request);
    } catch (e) {
      console.warn('Cast failed', e);
    }
  }

  return { available, connected, cast };
}
