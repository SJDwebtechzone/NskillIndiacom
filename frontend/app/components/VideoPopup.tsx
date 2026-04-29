"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Minimize2, Maximize2, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoPopupProps {
    videoUrl?: string;
    courseTitle?: string;
}

const VideoPopup: React.FC<VideoPopupProps> = ({
    videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-mechanical-parts-working-together-42790-large.mp4",
    courseTitle
}) => {
    const [status, setStatus] = useState<'open' | 'minimized' | 'closed'>('closed');
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setStatus('open');
            if (videoRef.current) {
                videoRef.current.play().catch(e => {
                   
                    setIsPlaying(false);
                });
            }
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        setStatus('closed');
        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    const handleMinimize = (e: React.MouseEvent) => {
        e.stopPropagation();
        setStatus('minimized');
    };

    const handleRestore = (e: React.MouseEvent) => {
        if (status === 'minimized') {
            setStatus('open');
        }
    };

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    if (status === 'closed') return null;

    return (
        <>
            {/* Background Overlay (Only when open) */}
            <div
                className={`fixed inset-0 bg-[#0b1f3a]/80 backdrop-blur-md z-[999] transition-all duration-300 ease-in-out ${status === 'open' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={handleMinimize}
            ></div>

            {/* Video Container (The persistent element) */}
            <div
                className={`fixed z-[1000] transition-all duration-700 ease-[cubic-bezier(0.19, 1, 0.22, 1)] group overflow-hidden bg-black shadow-2xl ${status === 'open'
                        ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] md:w-[70vw] lg:w-[60vw] aspect-video rounded-3xl'
                        : 'bottom-6 left-6 w-52 md:w-80 aspect-video rounded-2xl cursor-pointer ring-1 ring-blue-500/20 hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.3)]'
                    }`}
                onClick={handleRestore}
            >
                {/* Video Logic */}
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted={isMuted}
                    playsInline
                    loop
                    onClick={togglePlay}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                >
                    <source src={videoUrl} type="video/mp4" />
                </video>

                {/* Overlays / Controls */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${status === 'open' ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                    }`}>
                    {/* Top Right Controls */}
                    <div className="absolute top-3 right-3 md:top-5 md:right-5 flex items-center gap-2">
                        <button
                            onClick={toggleMute}
                            className="p-2 md:p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all hover:scale-110"
                        >
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>

                        {status === 'open' ? (
                            <button
                                onClick={handleMinimize}
                                className="p-2 md:p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all hover:scale-110"
                                title="Minimize"
                            >
                                <Minimize2 size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); setStatus('open'); }}
                                className="p-1.5 md:p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full"
                                title="Restore"
                            >
                                <Maximize2 size={14} />
                            </button>
                        )}

                        <button
                            onClick={handleClose}
                            className={`p-2 md:p-2.5 backdrop-blur-md text-white rounded-full transition-all hover:scale-110 ${status === 'open' ? 'bg-red-500/80 hover:bg-red-600' : 'bg-black/60 hover:bg-red-500'
                                }`}
                            title="Close"
                        >
                            <X size={status === 'open' ? 18 : 12} />
                        </button>
                    </div>

                    {/* Content Section (Only open) */}
                    <div className={`absolute bottom-0 left-0 right-0 p-4 md:p-8 transition-all duration-500 transform ${status === 'open' ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
                        }`}>
                        <div className="flex flex-col gap-1">
                            <span className="text-blue-400 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em]">Course Spotlight</span>
                            <h4 className="text-white font-bold text-lg md:text-2xl drop-shadow-lg">{courseTitle || "Course Intro"}</h4>
                            <div className="flex items-center gap-4 mt-1 opacity-60">
                                <span className="text-white text-[10px] md:text-xs">Featured Training Program</span>
                            </div>
                        </div>
                    </div>

                    {/* Center Play Button (On hover if playing, or always if paused) */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${!isPlaying || (status === 'open' && isPlaying) ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
                        }`}>
                        <button
                            onClick={togglePlay}
                            className="p-4 md:p-6 bg-blue-600/90 hover:bg-blue-500 text-white rounded-full shadow-2xl backdrop-blur-sm transition-transform hover:scale-110 active:scale-90"
                        >
                            {isPlaying ? <Pause size={status === 'open' ? 32 : 20} /> : <Play size={status === 'open' ? 32 : 20} fill="white" className="ml-0.5 md:ml-1" />}
                        </button>
                    </div>
                </div>

                {/* Progress bar (Visual only) */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 md:h-1 bg-white/10 overflow-hidden">
                    <div className="h-full bg-blue-500 w-1/3 animate-pulse"></div>
                </div>
            </div>
        </>
    );
};

export default VideoPopup;
