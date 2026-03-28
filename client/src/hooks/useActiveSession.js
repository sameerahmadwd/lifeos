import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const IDLE_TIMEOUT = 60 * 1000; // 60 seconds of no activity
const HEARTBEAT_INTERVAL = 15 * 1000; // 15 seconds
const MASTER_TIMEOUT = 20 * 1000; // 20 seconds to consider a tab inactive

const getLocalDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const useActiveSession = (user) => {
  const [isActive, setIsActive] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  
  const idleTimerRef = useRef(null);
  const heartbeatTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const tabId = useRef(Math.random().toString(36).substr(2, 9)).current;

  const stopSession = useCallback(async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/sessions/stop`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setIsActive(false);
    } catch (err) {
      console.error('Failed to stop session:', err);
    }
  }, [user?.token]);

  const sendHeartbeat = useCallback(async () => {
    // Multi-tab check: only send if this tab is the "master" or no master exists
    const now = Date.now();
    const lastGlobalHeartbeat = parseInt(localStorage.getItem('lifeos_last_heartbeat') || '0');
    const globalMasterId = localStorage.getItem('lifeos_master_tab_id');

    // If another tab sent a heartbeat recently, don't send one from here
    if (globalMasterId && globalMasterId !== tabId && (now - lastGlobalHeartbeat) < MASTER_TIMEOUT) {
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/sessions/heartbeat`, { date: getLocalDateStr() }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSessionData(res.data);
      localStorage.setItem('lifeos_last_heartbeat', now.toString());
      localStorage.setItem('lifeos_master_tab_id', tabId);
    } catch (err) {
      if (err.response?.status === 404) {
        // Session might have been auto-closed or not started
        startSession();
      }
    }
  }, [user?.token, tabId]);

  const startSession = useCallback(async () => {
    if (!user?.token) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/sessions/start`, { date: getLocalDateStr() }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSessionData(res.data);
      setIsActive(true);
      setIsIdle(false);
      localStorage.setItem('lifeos_last_heartbeat', Date.now().toString());
      localStorage.setItem('lifeos_master_tab_id', tabId);
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  }, [user?.token, tabId]);

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (isIdle) {
      setIsIdle(false);
      startSession(); // Resume or check session
    }

    if (!isActive) {
      startSession();
    }

    // Reset idle timer
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
      // We don't explicitly call stopSession here, the heartbeat will just stop
    }, IDLE_TIMEOUT);
  }, [isIdle, isActive, startSession]);

  useEffect(() => {
    if (!user?.token) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleActivity));

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsIdle(true);
        if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      } else {
        handleActivity();
        if (!heartbeatTimerRef.current) {
          heartbeatTimerRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial Start
    handleActivity();
    heartbeatTimerRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    };
  }, [user?.token, handleActivity, sendHeartbeat]);

  return { isActive, isIdle, sessionData, totalToday: sessionData?.duration || 0 };
};

export default useActiveSession;
