import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';

// --- Shared Components ---

const Sidebar = () => {
    const location = useLocation();
    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 bg-white border-r border-outline-variant shadow-sm flex flex-col py-lg px-md z-40 hidden lg:flex">
            <div className="flex items-center gap-sm mb-lg">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-white" style={{fontVariationSettings: "'FILL' 1"}}>analytics</span>
                </div>
                <div>
                    <h1 className="text-[20px] font-bold text-primary font-plus-jakarta-sans leading-tight">Sentimenter</h1>
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Review Management</p>
                </div>
            </div>
            
            {/* myBCA Specific Application Notice */}
            <div className="mb-lg p-sm rounded-lg bg-primary-container/10 border border-primary/20 text-center">
                <span className="text-[10px] font-bold text-primary block uppercase tracking-wider">Khusus Review Aplikasi</span>
                <span className="text-xs font-extrabold text-primary font-plus-jakarta-sans block mt-0.5">myBCA Play Store</span>
            </div>

            <nav className="flex-1 space-y-1">
                <Link to="/" className={`flex items-center px-md py-sm rounded-lg transition-all ${isActive('/') ? 'bg-surface-container-high text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-bright'}`}>
                    <span className="material-symbols-outlined mr-sm">dashboard</span>
                    <span className="text-sm">Dashboard</span>
                </Link>
                <Link to="/reviews" className={`flex items-center px-md py-sm rounded-lg transition-all ${isActive('/reviews') || isActive('/review-detail') ? 'bg-surface-container-high text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-bright'}`}>
                    <span className="material-symbols-outlined mr-sm">rate_review</span>
                    <span className="text-sm">Reviews</span>
                </Link>
                <Link to="/topics" className={`flex items-center px-md py-sm rounded-lg transition-all ${isActive('/topics') ? 'bg-surface-container-high text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-bright'}`}>
                    <span className="material-symbols-outlined mr-sm">topic</span>
                    <span className="text-sm">Topics</span>
                </Link>
            </nav>
            <div className="mt-auto pt-lg border-t border-outline-variant flex flex-col gap-sm">
                <div className="flex items-center gap-sm p-sm rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                        AD
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-xs font-bold text-on-surface truncate">Admin BCA</p>
                        <p className="text-[10px] text-on-surface-variant truncate">Administrator</p>
                    </div>
                </div>
                <button 
                    onClick={() => {
                        localStorage.removeItem("isLoggedIn");
                        localStorage.removeItem("userRole");
                        window.location.href = "/login";
                    }}
                    className="w-full py-xs px-sm border border-outline-variant hover:bg-error-container/10 hover:text-error hover:border-error/20 rounded-md text-[10px] font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-xs"
                >
                    <span className="material-symbols-outlined text-[14px]">logout</span> Logout
                </button>
            </div>
        </aside>
    );
};

const MobileNav = () => {
    const location = useLocation();
    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };
    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant px-md py-sm flex justify-around items-center z-50">
            <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-primary' : 'text-on-surface-variant'}`}>
                <span className="material-symbols-outlined">dashboard</span>
                <span className="text-[10px] font-bold">Home</span>
            </Link>
            <Link to="/reviews" className={`flex flex-col items-center gap-1 ${isActive('/reviews') || isActive('/review-detail') ? 'text-primary' : 'text-on-surface-variant'}`}>
                <span className="material-symbols-outlined">rate_review</span>
                <span className="text-[10px] font-bold">Reviews</span>
            </Link>
            <Link to="/topics" className={`flex flex-col items-center gap-1 ${isActive('/topics') ? 'text-primary' : 'text-on-surface-variant'}`}>
                <span className="material-symbols-outlined">topic</span>
                <span className="text-[10px] font-bold">Topics</span>
            </Link>
            <button 
                onClick={() => {
                    localStorage.removeItem("isLoggedIn");
                    localStorage.removeItem("userRole");
                    window.location.href = "/login";
                }} 
                className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-error"
            >
                <span className="material-symbols-outlined">logout</span>
                <span className="text-[10px] font-bold">Logout</span>
            </button>
        </nav>
    );
};

const TopBar = ({ title, showSearch = true, onSearchChange = null, searchValue = "", backTo = null }) => {
    const navigate = useNavigate();
    return (
        <header className="h-16 fixed top-0 right-0 left-0 lg:left-64 z-30 bg-white border-b border-outline-variant shadow-sm flex justify-between items-center px-lg">
            <div className="flex items-center gap-lg flex-1">
                {backTo && (
                    <button onClick={() => navigate(backTo)} className="p-2 hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                )}
                {title && <h2 className="font-plus-jakarta-sans text-lg font-bold text-primary">{title}</h2>}
                {showSearch && onSearchChange && (
                    <div className="relative w-80 hidden md:block">
                        <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                        <input 
                            className="w-full bg-surface-container-low border-none rounded-full pl-xl pr-md py-xs text-sm focus:ring-2 focus:ring-primary/20 transition-all" 
                            placeholder="Search keywords..." 
                            type="text" 
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                )}
            </div>
            <div className="flex items-center gap-md">
                <button className="p-sm rounded-full hover:bg-surface-bright text-on-surface-variant">
                    <span className="material-symbols-outlined">help</span>
                </button>
            </div>
        </header>
    );
};

// --- Screen Components ---

const DashboardPage = () => {
    const navigate = useNavigate();
    const [kpi, setKpi] = useState({ total_reviews: "0", average_rating: "0.0", overall_sentiment_score: "0%" });
    const [breakdown, setBreakdown] = useState({ positive: 0, negative: 0, neutral: 0 });
    const [trends, setTrends] = useState([]);
    const [topics, setTopics] = useState([]);
    const [recentReviews, setRecentReviews] = useState([]);
    const [filter, setFilter] = useState("all");

    // Scraper States
    const [isScraping, setIsScraping] = useState(false);
    const [scrapeCount, setScrapeCount] = useState(100);
    const [scrapeResult, setScrapeResult] = useState(null);

    const loadDashboardData = () => {
        fetch('/api/dashboard/kpi')
            .then(res => res.json())
            .then(data => setKpi(data))
            .catch(err => console.error("Error fetching KPI:", err));

        fetch('/api/dashboard/sentiment-breakdown')
            .then(res => res.json())
            .then(data => setBreakdown(data))
            .catch(err => console.error("Error fetching breakdown:", err));

        fetch('/api/dashboard/trends')
            .then(res => res.json())
            .then(data => setTrends(data))
            .catch(err => console.error("Error fetching trends:", err));

        fetch('/api/dashboard/top-topics')
            .then(res => res.json())
            .then(data => setTopics(data.slice(0, 4)))
            .catch(err => console.error("Error fetching topics:", err));
    };

    const fetchRecentReviews = () => {
        let url = '/api/reviews?limit=5';
        if (filter === "positive") {
            url += '&sentiment=positif';
        } else if (filter === "negative") {
            url += '&sentiment=negatif';
        } else if (filter === "resolved") {
            url += '&resolved=true';
        } else if (filter === "flagged") {
            url += '&flagged=true';
        }
        fetch(url)
            .then(res => res.json())
            .then(data => setRecentReviews(data.reviews))
            .catch(err => console.error("Error fetching reviews feed:", err));
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    useEffect(() => {
        fetchRecentReviews();
    }, [filter]);

    const handleScrapeRun = () => {
        setIsScraping(true);
        setScrapeResult(null);
        fetch(`/api/scraper/run?count=${scrapeCount}`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                setIsScraping(false);
                if (data.status === "success") {
                    setScrapeResult(data);
                    loadDashboardData();
                    fetchRecentReviews();
                    setTimeout(() => setScrapeResult(null), 8000);
                } else {
                    alert("Gagal melakukan scraping: " + (data.detail || data.message));
                }
            })
            .catch(err => {
                setIsScraping(false);
                alert("Terjadi kesalahan koneksi saat scraping.");
                console.error(err);
            });
    };

    const donutStyle = {
        background: `conic-gradient(#6cf8bb 0% ${breakdown.positive}%, #f23d5c ${breakdown.positive}% ${breakdown.positive + breakdown.negative}%, #94a3b8 ${breakdown.positive + breakdown.negative}% 100%)`
    };

    const generateSvgPaths = () => {
        if (!trends || trends.length === 0) return { posPath: "", negPath: "" };
        const N = trends.length;
        const width = 1000;
        const height = 120;
        const step = N > 1 ? width / (N - 1) : width;
        const maxVal = Math.max(...trends.map(t => Math.max(t.positive, t.negative)), 1);

        let posPoints = [];
        let negPoints = [];

        trends.forEach((t, i) => {
            const x = i * step;
            const yPos = 170 - (t.positive / maxVal * height);
            const yNeg = 170 - (t.negative / maxVal * height);
            posPoints.push(`${x},${yPos}`);
            negPoints.push(`${x},${yNeg}`);
        });

        return {
            posPath: posPoints.length > 0 ? `M ${posPoints.join(" L ")}` : "",
            negPath: negPoints.length > 0 ? `M ${negPoints.join(" L ")}` : ""
        };
    };

    const { posPath, negPath } = generateSvgPaths();

    return (
        <div className="min-h-screen">
            <Sidebar />
            <TopBar title="Dashboard" showSearch={false} />
            <main className="lg:ml-64 pt-24 px-lg pb-24 lg:pb-lg space-y-lg max-w-[1440px] mx-auto">
                {/* Dashboard Header & Scraper Controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-lg">
                    <div>
                        <h1 className="text-3xl font-bold font-plus-jakarta-sans text-on-surface">Dashboard</h1>
                        <p className="text-on-surface-variant mt-1 text-xs">Sistem Analisis Sentimen Ulasan Aplikasi myBCA.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center bg-white border border-outline-variant rounded-lg px-3 py-1.5 shadow-sm">
                            <span className="text-xs text-on-surface-variant mr-2">Count:</span>
                            <select 
                                className="bg-transparent border-none text-xs font-bold text-primary focus:ring-0 cursor-pointer outline-none"
                                value={scrapeCount}
                                onChange={(e) => setScrapeCount(parseInt(e.target.value))}
                                disabled={isScraping}
                            >
                                <option value={50}>50 ulasan</option>
                                <option value={100}>100 ulasan</option>
                                <option value={500}>500 ulasan</option>
                                <option value={1000}>1000 ulasan</option>
                                <option value={-1}>Semua ulasan</option>
                            </select>
                        </div>
                        <button 
                            onClick={handleScrapeRun}
                            disabled={isScraping}
                            className={`px-lg py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${isScraping ? 'bg-surface-container-high text-outline cursor-not-allowed' : 'bg-primary text-white hover:opacity-90'}`}
                        >
                            <span className={`material-symbols-outlined text-[16px] ${isScraping ? 'animate-spin' : ''}`}>sync</span>
                            {isScraping ? "Scraping..." : "Tarik Ulasan Baru"}
                        </button>
                    </div>
                </div>

                {/* Scrape Result Banner */}
                {scrapeResult && (
                    <div className="bg-secondary-container/20 border border-secondary text-on-secondary-container px-lg py-md rounded-xl flex items-center justify-between gap-sm transition-all duration-300">
                        <div className="flex items-center gap-sm">
                            <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
                            <span className="text-xs font-bold">{scrapeResult.message}</span>
                        </div>
                        <button onClick={() => setScrapeResult(null)} className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer text-sm">close</button>
                    </div>
                )}

                {/* KPI Cards */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                    <div 
                        onClick={() => navigate('/reviews')}
                        className="bg-white p-lg rounded-lg shadow-sm border border-[#E2E8F0] hover:border-primary/50 hover:shadow-md cursor-pointer transition-all group"
                        title="Klik untuk melihat semua ulasan"
                    >
                        <p className="text-xs font-bold text-on-surface-variant mb-xs flex justify-between items-center">
                            <span>Total Reviews</span>
                            <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 text-primary transition-opacity">arrow_forward</span>
                        </p>
                        <div className="flex items-end justify-between">
                            <h2 className="text-3xl font-bold font-plus-jakarta-sans text-primary">{kpi.total_reviews}</h2>
                            <span className="text-secondary text-xs font-bold flex items-center bg-secondary-container/20 px-xs py-[2px] rounded">
                                <span className="material-symbols-outlined text-[14px] mr-[2px]">trending_up</span>+100%
                            </span>
                        </div>
                    </div>
                    <div 
                        onClick={() => navigate('/reviews')}
                        className="bg-white p-lg rounded-lg shadow-sm border border-[#E2E8F0] hover:border-primary/50 hover:shadow-md cursor-pointer transition-all group"
                        title="Klik untuk mengeksplorasi ulasan rating Play Store"
                    >
                        <p className="text-xs font-bold text-on-surface-variant mb-xs flex justify-between items-center">
                            <span>Average Play Store Rating</span>
                            <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 text-primary transition-opacity">arrow_forward</span>
                        </p>
                        <div className="flex items-end gap-sm">
                            <h2 className="text-3xl font-bold font-plus-jakarta-sans text-primary">{kpi.average_rating}<span className="text-on-surface-variant text-[16px] font-normal">/5</span></h2>
                            <div className="flex text-secondary-container mb-2">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                    <span key={idx} className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: idx < Math.round(parseFloat(kpi.average_rating)) ? "'FILL' 1" : "'FILL' 0"}}>star</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div 
                        onClick={() => setFilter(filter === "negative" ? "all" : "negative")}
                        className={`bg-white p-lg rounded-lg shadow-sm border border-[#E2E8F0] hover:border-primary/50 hover:shadow-md cursor-pointer transition-all group ${filter === "negative" ? "ring-2 ring-primary/20 bg-primary-container/5" : ""}`}
                        title="Klik untuk memfilter ulasan negatif di feed"
                    >
                        <p className="text-xs font-bold text-on-surface-variant mb-xs flex justify-between items-center">
                            <span>Overall Sentiment Score</span>
                            <span className="material-symbols-outlined text-[16px] text-primary">{filter === "negative" ? "filter_alt_off" : "filter_alt"}</span>
                        </p>
                        <div className="flex items-end justify-between">
                            <h2 className="text-3xl font-bold font-plus-jakarta-sans text-primary">{kpi.overall_sentiment_score}</h2>
                            <div className="flex items-center gap-xs">
                                <span className="text-secondary text-xs font-bold bg-secondary-container/20 px-xs py-[2px] rounded">Positive Bias</span>
                                <span className="material-symbols-outlined text-secondary text-[18px]">trending_up</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Charts Row */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                    <div className="lg:col-span-2 bg-white p-lg rounded-lg shadow-sm border border-[#E2E8F0]">
                        <div className="flex justify-between items-center mb-lg">
                            <h3 className="font-bold font-plus-jakarta-sans text-primary">Sentiment Trend Over Time</h3>
                            <div className="flex gap-sm">
                                <div className="flex items-center gap-xs text-xs">
                                    <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                                    <span>Positive</span>
                                </div>
                                <div className="flex items-center gap-xs text-xs">
                                    <span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
                                    <span>Negative</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-64 relative">
                            {trends.length > 0 ? (
                                <svg className="w-full h-full" viewBox="0 0 1000 200">
                                    {/* Grid Lines */}
                                    <line x1="0" y1="50" x2="1000" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                                    <line x1="0" y1="110" x2="1000" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                                    <line x1="0" y1="170" x2="1000" y2="170" stroke="#e2e8f0" strokeWidth="1.5" />
                                    
                                    {/* Lines paths */}
                                    {posPath && <path d={posPath} fill="none" stroke="#6cf8bb" strokeLinecap="round" strokeWidth="3"></path>}
                                    {negPath && <path d={negPath} fill="none" stroke="#f23d5c" strokeDasharray="4" strokeLinecap="round" strokeWidth="2"></path>}
                                    
                                    {/* Interactive Dots & Guidelines on hover */}
                                    {trends.map((t, i) => {
                                        const x = i * (1000 / (trends.length - 1));
                                        const maxVal = Math.max(...trends.map(tr => Math.max(tr.positive, tr.negative)), 1);
                                        const yPos = 170 - (t.positive / maxVal * 120);
                                        const yNeg = 170 - (t.negative / maxVal * 120);
                                        return (
                                            <g key={i} className="group/dot cursor-pointer">
                                                <line x1={x} y1={20} x2={x} y2={170} stroke="#cbd5e1" strokeWidth="1.5" className="opacity-0 group-hover/dot:opacity-100 transition-opacity" strokeDasharray="3" />
                                                <circle cx={x} cy={yPos} r="5" fill="#6cf8bb" stroke="#ffffff" strokeWidth="1.5" className="transition-transform group-hover/dot:scale-150" />
                                                <circle cx={x} cy={yNeg} r="5" fill="#f23d5c" stroke="#ffffff" strokeWidth="1.5" className="transition-transform group-hover/dot:scale-150" />
                                                <title>{`Periode: ${t.date}\nSentimen Positif: ${t.positive} ulasan\nSentimen Negatif: ${t.negative} ulasan`}</title>
                                            </g>
                                        );
                                    })}
                                </svg>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-on-surface-variant">No Trend Data</div>
                            )}
                            <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] font-bold text-on-surface-variant pt-sm uppercase tracking-wider">
                                {trends.length > 0 ? (
                                    <>
                                        <span>{trends[0].date}</span>
                                        <span>{trends[Math.floor(trends.length / 2)].date}</span>
                                        <span>{trends[trends.length - 1].date}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Start</span>
                                        <span>Middle</span>
                                        <span>End</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-lg rounded-lg shadow-sm border border-[#E2E8F0] flex flex-col">
                        <h3 className="font-bold font-plus-jakarta-sans text-primary mb-lg">Sentiment Breakdown</h3>
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div 
                                onClick={() => setFilter(filter === "positive" ? "negative" : filter === "negative" ? "all" : "positive")}
                                className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-inner cursor-pointer hover:scale-105 transition-all duration-300 group" 
                                style={donutStyle}
                                title="Klik untuk memutar filter sentimen feed"
                            >
                                <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                    <p className="text-2xl font-bold font-plus-jakarta-sans group-hover:text-primary transition-colors">
                                        {filter === "positive" ? `${breakdown.positive}%` : filter === "negative" ? `${breakdown.negative}%` : kpi.overall_sentiment_score}
                                    </p>
                                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                                        {filter === "all" ? "Positive Bias" : `${filter}`}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-lg w-full space-y-xs">
                                <div 
                                    onClick={() => setFilter(filter === "positive" ? "all" : "positive")}
                                    className={`flex justify-between items-center text-sm p-sm rounded-lg hover:bg-surface-bright cursor-pointer transition-all border border-transparent ${filter === "positive" ? "bg-primary-container/5 border-outline-variant/30 font-bold" : ""}`}
                                    title="Klik untuk menyaring ulasan positif"
                                >
                                    <div className="flex items-center gap-xs">
                                        <span className="w-3 h-3 rounded-sm bg-secondary-container"></span>
                                        <span>Positive</span>
                                    </div>
                                    <span className="font-bold text-secondary">{breakdown.positive}%</span>
                                </div>
                                <div 
                                    onClick={() => setFilter(filter === "negative" ? "all" : "negative")}
                                    className={`flex justify-between items-center text-sm p-sm rounded-lg hover:bg-surface-bright cursor-pointer transition-all border border-transparent ${filter === "negative" ? "bg-primary-container/5 border-outline-variant/30 font-bold" : ""}`}
                                    title="Klik untuk menyaring ulasan negatif"
                                >
                                    <div className="flex items-center gap-xs">
                                        <span className="w-3 h-3 rounded-sm bg-on-tertiary-container"></span>
                                        <span>Negative</span>
                                    </div>
                                    <span className="font-bold text-error">{breakdown.negative}%</span>
                                </div>
                                <div 
                                    className="flex justify-between items-center text-sm p-sm rounded-lg text-outline"
                                >
                                    <div className="flex items-center gap-xs">
                                        <span className="w-3 h-3 rounded-sm bg-outline"></span>
                                        <span>Neutral</span>
                                    </div>
                                    <span className="font-bold">{breakdown.neutral}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bottom Row */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                    <div className="bg-white p-lg rounded-lg shadow-sm border border-[#E2E8F0]">
                        <h3 className="font-bold font-plus-jakarta-sans text-primary mb-lg">Top Topics</h3>
                        <div className="space-y-md">
                            {topics.length > 0 ? (
                                topics.map((item, idx) => (
                                    <div key={idx} className="space-y-xs">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                            <span>{item.label}</span>
                                            <span>{item.value} Pos.</span>
                                        </div>
                                        <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                                            <div className={`${item.color} h-full`} style={{ width: item.value }}></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-on-surface-variant">No topics analyzed yet</p>
                            )}
                        </div>
                        <button onClick={() => navigate('/topics')} className="w-full mt-xl py-sm border border-outline-variant rounded-lg text-xs font-bold hover:bg-surface-bright transition-colors uppercase tracking-widest">View All Topics</button>
                    </div>
                    <div className="lg:col-span-2 bg-white p-lg rounded-lg shadow-sm border border-[#E2E8F0]">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-lg">
                            <h3 className="font-bold font-plus-jakarta-sans text-primary">Recent Review Feed</h3>
                            <div className="flex bg-surface-container-low p-1 rounded-lg">
                                <button onClick={() => setFilter("all")} className={`px-md py-xs rounded-md text-xs font-bold ${filter === "all" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:text-primary transition-colors"}`}>All</button>
                                <button onClick={() => setFilter("positive")} className={`px-md py-xs rounded-md text-xs font-bold ${filter === "positive" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:text-primary transition-colors"}`}>Positive</button>
                                <button onClick={() => setFilter("negative")} className={`px-md py-xs rounded-md text-xs font-bold ${filter === "negative" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:text-primary transition-colors"}`}>Negative</button>
                                <button onClick={() => setFilter("resolved")} className={`px-md py-xs rounded-md text-xs font-bold ${filter === "resolved" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:text-primary transition-colors"}`}>Resolved</button>
                                <button onClick={() => setFilter("flagged")} className={`px-md py-xs rounded-md text-xs font-bold ${filter === "flagged" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:text-primary transition-colors"}`}>Flagged</button>
                            </div>
                        </div>
                        <div className="space-y-md">
                            {recentReviews.length > 0 ? (
                                recentReviews.map((review) => (
                                    <div key={review.review_id} onClick={() => navigate(`/review-detail/${review.review_id}`)} className="p-md rounded-lg border border-outline-variant hover:border-primary/20 transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-sm">
                                            <div className="flex items-center gap-sm">
                                                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary text-[12px]">
                                                    {review.user_name ? review.user_name.substring(0, 2).toUpperCase() : "US"}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-primary">{review.user_name || "Anonymous"}</p>
                                                    <div className="flex text-secondary-container">
                                                        {Array.from({ length: 5 }).map((_, idx) => (
                                                            <span key={idx} className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: idx < review.score ? "'FILL' 1" : "'FILL' 0"}}>star</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-on-surface-variant uppercase">
                                                    {review.at ? new Date(review.at).toLocaleDateString() : "Date N/A"}
                                                </p>
                                                <p className="text-[10px] text-outline font-bold">{review.app_version || "v N/A"}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-on-surface mb-sm line-clamp-2">{review.content}</p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2">
                                                <span className={`px-sm py-[2px] rounded-full text-[10px] font-bold tracking-wider uppercase ${review.sentiment === 'positif' ? 'bg-secondary-container/10 text-on-secondary-container' : review.sentiment === 'negatif' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                                                    {review.sentiment}
                                                </span>
                                                {review.resolved && (
                                                    <span className="px-sm py-[2px] rounded-full text-[10px] font-bold tracking-wider uppercase bg-secondary/10 text-secondary flex items-center gap-0.5">
                                                        <span className="material-symbols-outlined text-[10px]">check_circle</span> Resolved
                                                    </span>
                                                )}
                                                {review.flagged && (
                                                    <span className="px-sm py-[2px] rounded-full text-[10px] font-bold tracking-wider uppercase bg-error-container text-on-error-container flex items-center gap-0.5">
                                                        <span className="material-symbols-outlined text-[10px]">flag</span> Flagged
                                                    </span>
                                                )}
                                            </div>
                                            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-primary text-xs font-bold flex items-center">
                                                Detail <span className="material-symbols-outlined text-[16px] ml-xs">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-on-surface-variant text-center py-4">No reviews found</p>
                            )}
                        </div>
                    </div>
                </section>
            </main>
            <MobileNav />
        </div>
    );
};

const ReviewDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [insights, setInsights] = useState(null);

    const fetchReviewDetails = () => {
        if (!id) return;
        fetch(`/api/reviews/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Review not found");
                return res.json();
            })
            .then(data => setReview(data))
            .catch(err => console.error(err));

        fetch(`/api/reviews/${id}/ai-insights`)
            .then(res => res.json())
            .then(data => setInsights(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchReviewDetails();
    }, [id]);



    const handleResolve = () => {
        fetch(`/api/reviews/${id}/resolve`, { method: 'POST' })
            .then(res => res.json())
            .then(data => setReview(data))
            .catch(err => console.error(err));
    };

    const handleFlag = () => {
        fetch(`/api/reviews/${id}/flag`, { method: 'POST' })
            .then(res => res.json())
            .then(data => setReview(data))
            .catch(err => console.error(err));
    };

    if (!review) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-md">
                    <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
                    <p className="text-sm font-bold text-on-surface-variant">Loading review details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Sidebar />
            <TopBar title="Review Details" backTo="/reviews" showSearch={false} />
            <main className="lg:ml-64 pt-24 pb-24 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                    <div className="lg:col-span-8 space-y-gutter">
                        <div className="bg-white rounded-xl border border-outline-variant shadow-sm p-xl">
                            <div className="flex justify-between items-start mb-lg">
                                <div className="flex gap-1 text-secondary-container">
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                        <span key={idx} className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: idx < review.score ? "'FILL' 1" : "'FILL' 0"}}>star</span>
                                    ))}
                                </div>
                                <span className={`px-sm py-1 rounded-full text-xs font-bold uppercase tracking-wider ${review.sentiment === 'positif' ? 'bg-secondary-container/20 text-on-secondary-container' : review.sentiment === 'negatif' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                                    {review.sentiment} Sentiment
                                </span>
                            </div>
                            <h3 className="text-xl font-bold font-plus-jakarta-sans text-primary mb-md">Ulasan dari {review.user_name || "Anonymous"}</h3>
                            <p className="text-md text-on-surface-variant leading-relaxed">
                                {review.content}
                            </p>



                            <div className="mt-xl pt-lg border-t border-outline-variant flex flex-wrap gap-xl text-on-surface-variant">
                                <div className="flex items-center gap-sm">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        {review.at ? new Date(review.at).toLocaleString() : "Date N/A"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-sm">
                                    <span className="material-symbols-outlined text-sm">install_mobile</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{review.app_version || "v N/A"}</span>
                                </div>
                                <div className="flex items-center gap-sm">
                                    <span className="material-symbols-outlined text-sm">devices</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{review.review_created_version || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-md">
                            <button onClick={handleResolve} disabled={review.resolved} className={`px-lg py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${review.resolved ? "bg-surface-container-high text-outline cursor-not-allowed" : "bg-white border border-outline-variant text-primary hover:bg-surface-container-low"}`}>
                                <span className="material-symbols-outlined">check_circle</span> {review.resolved ? "Resolved" : "Mark Resolved"}
                            </button>
                            <button onClick={handleFlag} disabled={review.flagged} className={`px-lg py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${review.flagged ? "bg-error-container/30 text-on-error-container cursor-not-allowed" : "bg-white border border-outline-variant text-on-tertiary-container hover:bg-error-container/10"}`}>
                                <span className="material-symbols-outlined">flag</span> {review.flagged ? "Flagged" : "Flag Team"}
                            </button>
                        </div>
                    </div>
                    <div className="lg:col-span-4 space-y-gutter">
                        <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                            <div className="bg-primary-container px-lg py-md flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white">
                                    <span className="material-symbols-outlined">smart_toy</span>
                                    <span className="font-bold font-plus-jakarta-sans">AI Insights</span>
                                </div>
                                <div className="bg-white/10 px-sm py-1 rounded text-white font-mono text-[10px]">
                                    CONFIDENCE: {insights ? insights.confidence : 0}%
                                </div>
                            </div>
                            <div className="p-lg space-y-lg">
                                <div>
                                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-sm block">Detected Keywords</label>
                                    <div className="flex flex-wrap gap-2">
                                        {insights && insights.keywords.map((kw, i) => (
                                            <span key={i} className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-lg text-xs font-bold">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-md bg-surface-variant/20 rounded-lg border border-surface-variant">
                                    <p className="text-sm text-on-surface-variant italic">
                                        "{insights ? insights.summary : "No insights generated"}"
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-outline-variant shadow-sm p-lg">
                            <div className="flex items-center gap-md mb-lg">
                                {review.user_image ? (
                                    <img className="w-16 h-16 rounded-full border border-outline-variant object-cover" src={review.user_image} alt="User Avatar" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-lg text-primary">
                                        {review.user_name ? review.user_name.substring(0, 2).toUpperCase() : "US"}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold font-plus-jakarta-sans text-primary">{review.user_name || "Anonymous"}</h4>
                                    <p className="text-xs text-on-surface-variant">Google Play Store User</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-sm">
                                <div className="p-md bg-surface-container-low rounded-xl text-center">
                                    <span className="block text-2xl font-bold font-plus-jakarta-sans text-primary">{review.thumbs_up_count}</span>
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Likes</span>
                                </div>
                                <div className="p-md bg-surface-container-low rounded-xl text-center">
                                    <span className="block text-2xl font-bold font-plus-jakarta-sans text-primary">{review.score}.0</span>
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Score</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );
};

const AllReviewsPage = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [sentiment, setSentiment] = useState("all");
    const [search, setSearch] = useState("");
    const [kpi, setKpi] = useState({ average_rating: "0.0" });

    useEffect(() => {
        fetch('/api/dashboard/kpi')
            .then(res => res.json())
            .then(data => setKpi(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        let url = `/api/reviews?page=${page}&limit=10`;
        if (sentiment !== "all") {
            url += `&sentiment=${sentiment}`;
        }
        if (search) {
            url += `&query=${encodeURIComponent(search)}`;
        }
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setReviews(data.reviews);
                setTotal(data.total);
            })
            .catch(err => console.error(err));
    }, [page, sentiment, search]);

    return (
        <div className="min-h-screen">
            <Sidebar />
            <TopBar title="Reviews Explorer" showSearch={true} searchValue={search} onSearchChange={setSearch} />
            <main className="lg:ml-64 pt-24 pb-24 px-6 space-y-6 max-w-[1440px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-plus-jakarta-sans text-on-surface">All Reviews</h1>
                        <p className="text-on-surface-variant mt-1">Analyzing {total} user entries across Play Store.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-surface-container-highest px-4 py-2 rounded-xl border border-outline-variant">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Avg Rating</p>
                            <div className="flex items-center gap-1">
                                <span className="text-xl font-bold">{kpi.average_rating}</span>
                                <span className="material-symbols-outlined text-secondary text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex-1 min-w-[200px] relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                            <input 
                                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm" 
                                placeholder="Cari ulasan..." 
                                type="text" 
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant">
                            <button onClick={() => { setSentiment("all"); setPage(1); }} className={`px-4 py-1.5 text-xs font-bold rounded-md ${sentiment === 'all' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>All</button>
                            <button onClick={() => { setSentiment("positif"); setPage(1); }} className={`px-4 py-1.5 text-xs font-bold rounded-md ${sentiment === 'positif' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Positive</button>
                            <button onClick={() => { setSentiment("netral"); setPage(1); }} className={`px-4 py-1.5 text-xs font-bold rounded-md ${sentiment === 'netral' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Neutral</button>
                            <button onClick={() => { setSentiment("negatif"); setPage(1); }} className={`px-4 py-1.5 text-xs font-bold rounded-md ${sentiment === 'negatif' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Negative</button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.review_id} className="bg-white p-6 rounded-xl border border-outline-variant hover:border-primary transition-all shadow-sm group">
                                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                                    <div className="lg:w-48 flex-shrink-0 flex items-center lg:flex-col lg:items-start gap-3">
                                        {review.user_image ? (
                                            <img src={review.user_image} className="size-12 rounded-full border-2 border-surface-container-highest object-cover" alt="Avatar" />
                                        ) : (
                                            <div className="size-12 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary">
                                                {review.user_name ? review.user_name.substring(0, 2).toUpperCase() : "US"}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-on-surface text-sm truncate max-w-[120px]">{review.user_name || "Anonymous"}</h4>
                                            <p className="text-[10px] text-on-surface-variant font-bold uppercase">{review.app_version || "Google Play"}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="flex text-secondary-container">
                                                    {Array.from({ length: 5 }).map((_, idx) => (
                                                        <span key={idx} className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: idx < review.score ? "'FILL' 1" : "'FILL' 0"}}>star</span>
                                                    ))}
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${review.sentiment === 'positif' ? 'bg-secondary-container/20 text-on-secondary-container' : review.sentiment === 'negatif' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface-variant'}`}>{review.sentiment}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                                                {review.at ? new Date(review.at).toLocaleDateString() : "Date N/A"}
                                            </span>
                                        </div>
                                        <p className="text-on-surface-variant text-sm leading-relaxed max-w-3xl">{review.content}</p>
                                    </div>
                                    <div className="lg:w-32 flex lg:justify-end">
                                        <button onClick={() => navigate(`/review-detail/${review.review_id}`)} className="w-full lg:w-auto px-4 py-2 border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest">Details</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-on-surface-variant text-center py-8">No reviews found</p>
                    )}
                </div>

                {/* Pagination */}
                {total > 10 && (
                    <div className="flex justify-between items-center pt-md border-t border-outline-variant">
                        <button 
                            onClick={() => setPage(p => Math.max(p - 1, 1))} 
                            disabled={page === 1}
                            className={`px-4 py-2 border rounded-lg text-xs font-bold ${page === 1 ? 'border-outline-variant text-outline cursor-not-allowed' : 'border-outline text-primary hover:bg-surface-container-low'}`}
                        >
                            Previous
                        </button>
                        <span className="text-xs font-bold text-on-surface-variant">Page {page} of {Math.ceil(total / 10)}</span>
                        <button 
                            onClick={() => setPage(p => (p * 10 < total ? p + 1 : p))} 
                            disabled={page * 10 >= total}
                            className={`px-4 py-2 border rounded-lg text-xs font-bold ${page * 10 >= total ? 'border-outline-variant text-outline cursor-not-allowed' : 'border-outline text-primary hover:bg-surface-container-low'}`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
            <MobileNav />
        </div>
    );
};

const TopicsPage = () => {
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [keywordsData, setKeywordsData] = useState({ keywords: [], insight: "" });
    const [selectedTopic, setSelectedTopic] = useState(null);

    useEffect(() => {
        fetch('/api/dashboard/top-topics')
            .then(res => res.json())
            .then(data => setTopics(data))
            .catch(err => console.error("Error fetching topics:", err));

        fetch('/api/dashboard/top-keywords')
            .then(res => res.json())
            .then(data => setKeywordsData(data))
            .catch(err => console.error("Error fetching keywords:", err));
    }, []);

    const mostFrequent = topics.length > 0 ? topics[0].label : "N/A";
    const frequentCount = topics.length > 0 ? topics[0].count : 0;
    
    let topNegative = "N/A";
    let negativeVal = "0%";
    if (topics.length > 0) {
        const sortedByNeg = [...topics].sort((a, b) => parseInt(a.value) - parseInt(b.value));
        topNegative = sortedByNeg[0].label;
        negativeVal = `${100 - parseInt(sortedByNeg[0].value)}%`;
    }
    
    let fastestGrowingTopic = "N/A";
    let growthRate = 0;
    if (topics.length > 0) {
        const sortedByGrowth = [...topics].sort((a, b) => b.growth - a.growth);
        fastestGrowingTopic = sortedByGrowth[0].label;
        growthRate = sortedByGrowth[0].growth;
    }

    return (
        <div className="min-h-screen">
            <Sidebar />
            <TopBar title="Topic Analysis" showSearch={false} />
            <main className="lg:ml-64 pt-24 pb-24 px-margin-desktop max-w-[1440px] mx-auto">
                <section className="mb-xl">
                    <h2 className="text-3xl font-bold font-plus-jakarta-sans text-on-surface mb-xs">Topic Analysis</h2>
                    <p className="text-on-surface-variant max-w-2xl">Temukan tema ulasan berulang yang dikelompokkan secara cerdas dari keluhan pengguna.</p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-xl">
                    <div className="bg-white p-lg rounded-xl shadow-sm border border-[#E2E8F0]">
                        <div className="flex justify-between items-start mb-md">
                            <span className="p-xs bg-surface-container rounded-lg text-primary material-symbols-outlined">trending_up</span>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Frequency</span>
                        </div>
                        <h3 className="text-xs font-bold text-on-surface-variant mb-xs">Most Frequent Topic</h3>
                        <p className="text-xl font-bold font-plus-jakarta-sans text-on-surface">{mostFrequent}</p>
                        <div className="mt-4 flex items-center gap-xs">
                            <span className="text-secondary font-bold text-sm">{frequentCount}</span>
                            <span className="text-[10px] text-on-surface-variant">ulasan total terdeteksi</span>
                        </div>
                    </div>
                    <div className="bg-white p-lg rounded-xl shadow-sm border border-[#E2E8F0]">
                        <div className="flex justify-between items-start mb-md">
                            <span className="p-xs bg-secondary-container rounded-lg text-on-secondary-container material-symbols-outlined">bolt</span>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Velocity</span>
                        </div>
                        <h3 className="text-xs font-bold text-on-surface-variant mb-xs">Fastest Growing</h3>
                        <p className="text-xl font-bold font-plus-jakarta-sans text-on-surface">{fastestGrowingTopic}</p>
                        <div className="mt-4 flex items-center gap-xs">
                            <span className={`${growthRate >= 0 ? "text-secondary" : "text-error"} font-bold text-sm`}>
                                {growthRate >= 0 ? "+" : ""}{growthRate}%
                            </span>
                            <span className="text-[10px] text-on-surface-variant">sejak minggu lalu</span>
                        </div>
                    </div>
                    <div className="bg-white p-lg rounded-xl shadow-sm border border-[#E2E8F0]">
                        <div className="flex justify-between items-start mb-md">
                            <span className="p-xs bg-tertiary-fixed rounded-lg text-on-tertiary-fixed-variant material-symbols-outlined">warning</span>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Criticality</span>
                        </div>
                        <h3 className="text-xs font-bold text-on-surface-variant mb-xs">Top Negative Issue</h3>
                        <p className="text-xl font-bold font-plus-jakarta-sans text-on-surface">{topNegative}</p>
                        <div className="mt-4 flex items-center gap-xs">
                            <span className="text-error font-bold text-sm">{negativeVal}</span>
                            <span className="text-[10px] text-on-surface-variant">ulasan negatif</span>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                    <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
                        <div className="p-lg border-b border-outline-variant flex justify-between items-center">
                            <h3 className="font-bold font-plus-jakarta-sans">Topics Overview</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-surface-container-low/50">
                                    <tr>
                                        <th className="px-lg py-md text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Topic</th>
                                        <th className="px-lg py-md text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant text-right">Vol (Count)</th>
                                        <th className="px-lg py-md text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Sentiment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant">
                                    {topics.length > 0 ? (
                                        topics.map((topic, i) => {
                                            const posVal = parseInt(topic.value);
                                            const negVal = 100 - posVal;
                                            const isSelected = selectedTopic && selectedTopic.label === topic.label;
                                            return (
                                                <tr 
                                                    key={i} 
                                                    onClick={() => setSelectedTopic(topic)}
                                                    className={`hover:bg-surface-container-lowest transition-colors cursor-pointer ${isSelected ? 'bg-primary-container/10 font-medium' : ''}`}
                                                >
                                                    <td className="px-lg py-lg">
                                                        <div className="flex items-center gap-md">
                                                            <div className={`w-2 h-2 rounded-full ${topic.color === 'bg-secondary-container' ? 'bg-secondary' : 'bg-error'}`}></div>
                                                            <span className="text-sm font-bold">{topic.label}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-lg py-lg text-right font-mono text-sm">{topic.count}</td>
                                                    <td className="px-lg py-lg min-w-[160px]">
                                                        <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-surface-container">
                                                            <div className="sentiment-bar-pos" style={{ width: `${posVal}%` }}></div>
                                                            <div className="sentiment-bar-neg" style={{ width: `${negVal}%` }}></div>
                                                        </div>
                                                        <div className="flex justify-between mt-xs text-[10px] font-bold text-on-surface-variant uppercase">
                                                            <span>{posVal}% Pos</span>
                                                            <span>{negVal}% Neg</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4 text-sm text-on-surface-variant">No topics found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-lg flex flex-col h-full">
                        <div className="mb-lg">
                            <h3 className="font-bold font-plus-jakarta-sans mb-xs">Top Keywords</h3>
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Ulasan Keseluruhan</p>
                        </div>
                        <div className="flex-1 flex flex-wrap content-start gap-sm">
                            {keywordsData.keywords.length > 0 ? (
                                keywordsData.keywords.map((kw, idx) => (
                                    <span key={idx} className={kw.style}>{kw.word}</span>
                                ))
                            ) : (
                                <span className="text-xs text-on-surface-variant">Loading keywords...</span>
                            )}
                        </div>
                        <div className="mt-xl p-md bg-surface-container-low rounded-lg border border-outline-variant/30">
                            <div className="flex items-center gap-sm mb-xs">
                                <span className="material-symbols-outlined text-primary text-[18px]">lightbulb</span>
                                <span className="text-xs font-bold text-on-surface">Insight</span>
                            </div>
                            <p className="text-[12px] text-on-surface-variant leading-relaxed">
                                {keywordsData.insight || "Loading insights..."}
                            </p>
                        </div>
                    </section>
                </div>

                {/* Topic Reviews List */}
                {selectedTopic && (
                    <section className="mt-xl bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-lg">
                        <div className="flex justify-between items-center border-b border-outline-variant pb-md mb-lg">
                            <div>
                                <h3 className="font-bold font-plus-jakarta-sans text-lg text-primary">Reviews for: {selectedTopic.label}</h3>
                                <p className="text-[11px] text-on-surface-variant mt-1">Ditemukan {selectedTopic.reviews ? selectedTopic.reviews.length : 0} ulasan yang berkaitan dengan topik ini.</p>
                            </div>
                            <button onClick={() => setSelectedTopic(null)} className="material-symbols-outlined hover:text-primary cursor-pointer text-xl text-on-surface-variant">close</button>
                        </div>
                        <div className="space-y-md max-h-[500px] overflow-y-auto pr-sm scrollbar-thin">
                            {selectedTopic.reviews && selectedTopic.reviews.length > 0 ? (
                                selectedTopic.reviews.map((r, idx) => (
                                    <div key={r.review_id || idx} className="p-md rounded-lg bg-surface-container-low/50 border border-outline-variant hover:border-primary/50 transition-all flex flex-col md:flex-row md:items-start justify-between gap-md">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-xs">
                                                <span className="text-xs font-bold text-on-surface">{r.user_name || "Anonymous"}</span>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${r.sentiment === 'positif' ? 'bg-secondary-container/20 text-on-secondary-container' : r.sentiment === 'negatif' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface-variant'}`}>{r.sentiment}</span>
                                            </div>
                                            <p className="text-xs text-on-surface-variant leading-relaxed">{r.content}</p>
                                            <div className="text-[10px] text-outline">
                                                Tanggal: {r.at ? new Date(r.at).toLocaleDateString() : "N/A"}
                                            </div>
                                        </div>
                                        <div className="flex md:flex-col items-end justify-between md:justify-start gap-sm">
                                            <div className="flex text-secondary-container">
                                                {Array.from({ length: 5 }).map((_, sIdx) => (
                                                    <span key={sIdx} className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: sIdx < r.score ? "'FILL' 1" : "'FILL' 0"}}>star</span>
                                                ))}
                                            </div>
                                            <button onClick={() => navigate(`/review-detail/${r.review_id}`)} className="px-3 py-1.5 border border-outline-variant hover:border-primary hover:text-primary rounded-md text-[9px] font-bold transition-all uppercase tracking-wider">Details</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-on-surface-variant italic">Tidak ada ulasan detail untuk topik ini.</p>
                            )}
                        </div>
                    </section>
                )}
            </main>
            <MobileNav />
        </div>
    );
};

const LoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === "admin" && password === "admin123") {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userRole", "admin");
            navigate("/");
        } else {
            setError("Username atau password salah!");
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-surface-container-low p-6">
            <div className="w-full max-w-[400px] bg-white p-8 rounded-2xl border border-outline-variant shadow-lg flex flex-col gap-6">
                <div className="text-center flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm mb-2 flex-shrink-0">
                        <span className="material-symbols-outlined text-white text-3xl">analytics</span>
                    </div>
                    <h2 className="text-2xl font-bold font-plus-jakarta-sans text-primary tracking-tight">Sentimenter AI</h2>
                    <div className="px-3 py-1 bg-primary-container/10 border border-primary/20 rounded-full">
                        <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">Khusus Review myBCA</span>
                    </div>
                </div>
                
                {error && (
                    <div className="p-3 bg-error-container text-on-error-container text-xs font-bold rounded-lg text-center border border-error/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Username</label>
                        <input 
                            type="text" 
                            className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            placeholder="Username (admin)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Password</label>
                        <input 
                            type="password" 
                            className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            placeholder="Password (admin123)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity mt-4 shadow-sm cursor-pointer">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

const ProtectedRoute = ({ children }) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const navigate = useNavigate();
    
    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
        }
    }, [isLoggedIn, navigate]);
    
    if (!isLoggedIn) return null;
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/reviews" element={<ProtectedRoute><AllReviewsPage /></ProtectedRoute>} />
                <Route path="/review-detail/:id" element={<ProtectedRoute><ReviewDetailPage /></ProtectedRoute>} />
                <Route path="/topics" element={<ProtectedRoute><TopicsPage /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
}

export default App;
