'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    url: string;
    filename: string;
    onClose: () => void;
    onBack?: () => void;
    onNext?: () => void;
    backLabel?: string;
    nextLabel?: string;
}

export default function PdfViewer({
    url,
    filename,
    onClose,
    onBack,
    onNext,
    backLabel = '« Back',
    nextLabel = 'Next »',
}: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [pageInputValue, setPageInputValue] = useState<string>('1');
    const [fitWidth, setFitWidth] = useState<boolean>(true);
    const [containerWidth, setContainerWidth] = useState<number>(800);
    const [loading, setLoading] = useState<boolean>(true);
    const [viewMode, setViewMode] = useState<'paginated' | 'continuous'>('paginated');
    const containerRef = useRef<HTMLDivElement>(null);

    // Measure container width for fit-to-width mode
    useEffect(() => {
        const measure = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth - 40); // 20px padding each side
            }
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    const onDocumentLoadSuccess = useCallback(({ numPages: total }: { numPages: number }) => {
        setNumPages(total);
        setPageNumber(1);
        setPageInputValue('1');
        setLoading(false);
    }, []);

    const goToPage = useCallback((page: number) => {
        const p = Math.max(1, Math.min(page, numPages));
        setPageNumber(p);
        setPageInputValue(String(p));
    }, [numPages]);

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPageInputValue(e.target.value);
    };

    const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const val = parseInt(pageInputValue, 10);
            if (!isNaN(val)) {
                goToPage(val);
            }
        }
    };

    const handlePageInputBlur = () => {
        const val = parseInt(pageInputValue, 10);
        if (!isNaN(val)) {
            goToPage(val);
        } else {
            setPageInputValue(String(pageNumber));
        }
    };

    const zoomIn = () => {
        setFitWidth(false);
        setScale(prev => Math.min(prev + 0.25, 3.0));
    };

    const zoomOut = () => {
        setFitWidth(false);
        setScale(prev => Math.max(prev - 0.25, 0.5));
    };

    const toggleFitWidth = () => {
        setFitWidth(prev => !prev);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                goToPage(pageNumber - 1);
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                goToPage(pageNumber + 1);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [pageNumber, goToPage, onClose]);

    return (
        <div className="flex flex-col h-screen w-full bg-[#525659] overflow-hidden">
            {/* ─── Top Toolbar ─── */}
            <div className="flex items-center justify-between h-[42px] min-h-[42px] bg-[#323639] text-white text-sm px-4 select-none shrink-0">
                {/* Left: Filename */}
                <div className="flex items-center gap-2 min-w-0 flex-shrink overflow-hidden">
                    <span className="truncate text-[13px] text-gray-200 font-medium max-w-[280px]">{filename}</span>
                </div>

                {/* Center: Page Navigation */}
                <div className="flex items-center gap-1">
                    {viewMode === 'paginated' && (
                        <>
                            <button
                                onClick={() => goToPage(pageNumber - 1)}
                                disabled={pageNumber <= 1}
                                className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Previous page"
                            >
                                <span className="text-[16px]">&lt;</span>
                            </button>
                            <button
                                onClick={() => goToPage(pageNumber + 1)}
                                disabled={pageNumber >= numPages}
                                className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Next page"
                            >
                                <span className="text-[16px]">&gt;</span>
                            </button>
                            <div className="flex items-center gap-1.5 ml-2">
                                <input
                                    type="text"
                                    value={pageInputValue}
                                    onChange={handlePageInputChange}
                                    onKeyDown={handlePageInputSubmit}
                                    onBlur={handlePageInputBlur}
                                    className="w-[42px] h-[26px] bg-[#4a4d50] border border-[#6b6e71] rounded text-center text-[13px] text-white focus:outline-none focus:border-blue-400 transition-colors"
                                />
                                <span className="text-[13px] text-gray-300">of {numPages}</span>
                            </div>
                        </>
                    )}
                    <button
                        onClick={() => setViewMode(prev => prev === 'paginated' ? 'continuous' : 'paginated')}
                        className={`w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors ml-1 ${viewMode === 'continuous' ? 'bg-white/15' : ''}`}
                        title={viewMode === 'paginated' ? 'Switch to continuous view' : 'Switch to paginated view'}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {viewMode === 'paginated' ? (
                                <>
                                    <rect x="3" y="1" width="10" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
                                    <rect x="3" y="9" width="10" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
                                </>
                            ) : (
                                <rect x="3" y="1" width="10" height="14" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Right: Zoom controls + Close */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={zoomIn}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
                        title="Zoom in"
                    >
                        <span className="text-[18px] font-light">+</span>
                    </button>
                    <button
                        onClick={zoomOut}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
                        title="Zoom out"
                    >
                        <span className="text-[18px] font-light">−</span>
                    </button>
                    <button
                        onClick={toggleFitWidth}
                        className={`w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors ${fitWidth ? 'bg-white/15' : ''}`}
                        title="Fit to width"
                    >
                        <span className="text-[14px]">&lt;-&gt;</span>
                    </button>
                    <div className="w-px h-5 bg-gray-500 mx-2" />
                    <button
                        onClick={onClose}
                        className="px-3 h-7 rounded hover:bg-white/10 transition-colors text-[13px] text-gray-200 font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* ─── PDF Content Area ─── */}
            <div ref={containerRef} className="flex-1 overflow-auto flex justify-center bg-[#525659]">
                {loading && (
                    <div className="flex items-center justify-center h-full w-full">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="text-white/60 text-sm">Loading PDF...</span>
                        </div>
                    </div>
                )}
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(error) => console.error('PDF load error:', error)}
                    loading=""
                    className="py-4"
                >
                    {viewMode === 'continuous' ? (
                        Array.from({ length: numPages }, (_, i) => (
                            <Page
                                key={`page_${i + 1}`}
                                pageNumber={i + 1}
                                scale={fitWidth ? undefined : scale}
                                width={fitWidth ? containerWidth : undefined}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                className="shadow-lg mx-auto mb-4"
                                loading={
                                    <div className="flex items-center justify-center" style={{ width: containerWidth, height: 600 }}>
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    </div>
                                }
                            />
                        ))
                    ) : (
                        <Page
                            pageNumber={pageNumber}
                            scale={fitWidth ? undefined : scale}
                            width={fitWidth ? containerWidth : undefined}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            className="shadow-lg mx-auto"
                            loading={
                                <div className="flex items-center justify-center" style={{ width: containerWidth, height: 600 }}>
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                </div>
                            }
                        />
                    )}
                </Document>
            </div>

            {/* ─── Bottom Navigation Bar ─── */}
            <div className="flex items-center justify-between h-[40px] min-h-[40px] bg-[#f0f0f0] dark:bg-[#2a2d31] border-t border-gray-300 dark:border-gray-600 px-5 shrink-0">
                {onBack ? (
                    <button
                        onClick={onBack}
                        className="text-[13px] text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                        {backLabel}
                    </button>
                ) : (
                    <div />
                )}
                {onNext ? (
                    <button
                        onClick={onNext}
                        className="text-[13px] text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                        {nextLabel}
                    </button>
                ) : (
                    <div />
                )}
            </div>
        </div>
    );
}
