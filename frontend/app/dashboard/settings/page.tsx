"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import {
    Layout,
    Monitor,
    PlusCircle,
    Trash2,
    CheckCircle2,
    XCircle,
    UploadCloud,
    FileImage,
    Globe
} from "lucide-react";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/settings`;

interface Banner {
    id: number;
    image_url: string;
    title: string;
    is_active: boolean;
}

interface Popup {
    id: number;
    image_url: string;
    video_url: string;
    title: string;
    description: string;
    course_id: string;
    is_active: boolean;
    manual_override: boolean;
    placement: string;
}

interface NewsItem {
    id: number;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
}

interface Accreditation {
    id: number;
    title: string;
    image_url: string;
    created_at: string;
}

function SettingsContent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState(tab === "accreditations" ? "accreditations" : tab === "popup" ? "popup" : tab === "news" ? "news" : "banner");

    // Sync tab when URL changes (sidebar navigation)
    useEffect(() => {
        if (tab === "popup") setActiveTab("popup");
        else if (tab === "news") setActiveTab("news");
        else if (tab === "accreditations") setActiveTab("accreditations");
        else setActiveTab("banner");
    }, [tab]);

    const [banners, setBanners] = useState<Banner[]>([]);
    const [popups, setPopups] = useState<Popup[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [accreditations, setAccreditations] = useState<Accreditation[]>([]);
    const [loading, setLoading] = useState(false);

    const [bannerForm, setBannerForm] = useState({
        title: "",
        image: null as File | null,
    });

    const [popupForm, setPopupForm] = useState({
        video: null as File | null,
        title: "",
        description: "",
        course_id: "",
        manual_override: false,
        placement: "Intro",
    });

    const [newsForm, setNewsForm] = useState({
        title: "",
        content: "",
        image: null as File | null,
    });

    const [accreditationsForm, setAccreditationsForm] = useState({
        title: "",
        image: null as File | null,
    });

    useEffect(() => {
        fetchBanners();
        fetchPopups();
        fetchNews();
        fetchAccreditations();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/banners`);
            setBanners(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPopups = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/popups`);
            setPopups(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchNews = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/news`);
            setNews(Object.values(res.data));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAccreditations = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/accreditations`);
            setAccreditations(Object.values(res.data));
        } catch (err) {
            console.error(err);
        }
    };

    const addBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append("title", bannerForm.title);
        if (bannerForm.image) {
            formData.append("image", bannerForm.image);
        }

        try {
            await axios.post(`${API_BASE_URL}/banners`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setBannerForm({ title: "", image: null });
            fetchBanners();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addPopup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        if (popupForm.video) formData.append("video", popupForm.video);
        formData.append("title", popupForm.title);
        formData.append("description", popupForm.description);
        formData.append("course_id", popupForm.course_id);
        formData.append("manual_override", String(popupForm.manual_override));
        formData.append("placement", popupForm.placement);

        try {
            await axios.post(`${API_BASE_URL}/popups`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setPopupForm({ video: null, title: "", description: "", course_id: "", manual_override: false, placement: "Intro" });
            fetchPopups();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleBannerStatus = async (id: number, currentStatus: boolean) => {
        await axios.put(`${API_BASE_URL}/banners/${id}/status`, { is_active: !currentStatus });
        fetchBanners();
    };

    const togglePopupStatus = async (id: number, currentStatus: boolean) => {
        await axios.put(`${API_BASE_URL}/popups/${id}/status`, { is_active: !currentStatus });
        fetchPopups();
    };

    const togglePopupOverride = async (id: number, currentOverride: boolean) => {
        await axios.put(`${API_BASE_URL}/popups/${id}/override`, { manual_override: !currentOverride });
        fetchPopups();
    };

    const deleteBanner = async (id: number) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;
        await axios.delete(`${API_BASE_URL}/banners/${id}`);
        fetchBanners();
    };

    const deletePopup = async (id: number) => {
        if (!confirm("Are you sure you want to delete this popup?")) return;
        await axios.delete(`${API_BASE_URL}/popups/${id}`);
        fetchPopups();
    };

    const addNews = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append("title", newsForm.title);
        formData.append("content", newsForm.content);
        if (newsForm.image) {
            formData.append("image", newsForm.image);
        }

        try {
            await axios.post(`${API_BASE_URL}/news`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setNewsForm({ title: "", content: "", image: null });
            fetchNews();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteNews = async (id: number) => {
        if (!confirm("Are you sure you want to delete this news item?")) return;
        await axios.delete(`${API_BASE_URL}/news/${id}`);
        fetchNews();
    };

    const addAccreditation = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append("title", accreditationsForm.title);
        if (accreditationsForm.image) {
            formData.append("image", accreditationsForm.image);
        }

        try {
            await axios.post(`${API_BASE_URL}/accreditations`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setAccreditationsForm({ title: "", image: null });
            fetchAccreditations();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteAccreditation = async (id: number) => {
        if (!confirm("Are you sure you want to delete this accreditation?")) return;
        await axios.delete(`${API_BASE_URL}/accreditations/${id}`);
        fetchAccreditations();
    };

    return (
        <div className="bg-[#f8fafc] rounded-[32px] shadow-sm border border-slate-100 overflow-hidden min-h-[700px] flex flex-col md:flex-row">
            {/* Content Area */}
            <div className="flex-1 p-10 overflow-y-auto w-full">
                {activeTab === "banner" && (
                    <div className="animate-in fade-in slide-in-from-right duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Banner Management</h1>
                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">{banners.length} Active Slots</span>
                        </div>

                        {/* Add Banner Form */}
                        <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-[24px] mb-12">
                            <form onSubmit={addBanner} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Banner Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter display title"
                                        value={bannerForm.title}
                                        onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-slate-700"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Hero Image</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.files ? e.target.files[0] : null })}
                                            className="hidden"
                                            id="banner-file"
                                            required
                                        />
                                        <label htmlFor="banner-file" className="flex items-center gap-3 w-full p-4 bg-white border border-slate-200 border-dashed rounded-2xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all font-medium text-slate-500">
                                            <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                <UploadCloud className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="truncate">{bannerForm.image ? bannerForm.image.name : "Select JPG / PNG"}</span>
                                        </label>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-2"
                                >
                                    {loading ? "Uploading..." : <><PlusCircle className="w-5 h-5" /> Push to Production</>}
                                </button>
                            </form>
                        </div>

                        {/* Banner List */}
                        <div className="grid grid-cols-1 gap-4">
                            {banners.map((banner) => (
                                <div key={banner.id} className="group flex items-center gap-6 bg-white border border-slate-100 p-5 rounded-[24px] hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                    <div className="relative h-20 w-32 rounded-xl overflow-hidden shadow-md shrink-0">
                                        <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        {!banner.is_active && <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center"><XCircle className="text-white w-6 h-6" /></div>}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Headline</p>
                                        <h3 className="font-black text-slate-800 text-lg tracking-tight truncate">{banner.title}</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleBannerStatus(banner.id, banner.is_active)}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${banner.is_active
                                                ? "bg-emerald-50 text-emerald-600 shadow-sm"
                                                : "bg-slate-100 text-slate-400"
                                                }`}
                                        >
                                            {banner.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                            {banner.is_active ? "Live" : "Draft"}
                                        </button>
                                        <button
                                            onClick={() => deleteBanner(banner.id)}
                                            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "popup" && (
                    <div className="animate-in fade-in slide-in-from-right duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Popup Management</h1>
                            <span className="px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full">Manual Override</span>
                        </div>

                        <form onSubmit={addPopup} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
                            {/* Accent line at top */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600/10"></div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Video File</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="video/mp4"
                                        onChange={(e) => setPopupForm({ ...popupForm, video: e.target.files ? e.target.files[0] : null })}
                                        className="hidden"
                                        id="popup-video"
                                        required
                                    />
                                    <label htmlFor="popup-video" className="flex items-center gap-4 w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all font-medium text-slate-500">
                                        <div className="bg-amber-50 p-2 rounded-lg group-hover:bg-amber-100 transition-colors">
                                            <UploadCloud className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <span className="truncate text-sm">{popupForm.video ? popupForm.video.name : "Select MP4 Video"}</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter Title"
                                    value={popupForm.title}
                                    onChange={(e) => setPopupForm({ ...popupForm, title: e.target.value })}
                                    className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-slate-700 text-sm"
                                    required
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Description</label>
                                <input
                                    type="text"
                                    placeholder="Enter message for users"
                                    value={popupForm.description}
                                    onChange={(e) => setPopupForm({ ...popupForm, description: e.target.value })}
                                    className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-slate-700 text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Landing Course</label>
                                <input
                                    type="text"
                                    placeholder="Global / No Specific Course"
                                    value={popupForm.course_id}
                                    onChange={(e) => setPopupForm({ ...popupForm, course_id: e.target.value })}
                                    className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-slate-700 text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Video Placement</label>
                                <input
                                    type="text"
                                    placeholder="Intro"
                                    value={popupForm.placement}
                                    onChange={(e) => setPopupForm({ ...popupForm, placement: e.target.value })}
                                    className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-slate-700 text-sm"
                                />
                            </div>

                            <div className="md:col-span-2 flex justify-start pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {loading ? "Saving..." : <><Monitor className="w-5 h-5" /> Save Video Mapping</>}
                                </button>
                            </div>
                        </form>

                        <div className="grid grid-cols-1 gap-8">
                            {popups.map((popup) => (
                                <div key={popup.id} className="group relative flex flex-col md:flex-row gap-8 bg-white border border-slate-100 p-8 rounded-[32px] hover:shadow-2xl transition-all duration-300">
                                    <div className="relative w-full md:w-64 h-40 rounded-2xl overflow-hidden shadow-inner shrink-0 bg-slate-900 flex items-center justify-center">
                                        <video
                                            src={popup.video_url}
                                            className="w-full h-full object-cover opacity-80"
                                            muted
                                            onMouseOver={(e) => e.currentTarget.play()}
                                            onMouseOut={(e) => e.currentTarget.pause()}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center flex-wrap gap-2">
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight mr-2">{popup.placement || 'Intro'}</h3>
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-lg">Course: {popup.course_id || 'Global'}</span>
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-lg">Intro</span>
                                        </div>
                                        <p className="text-slate-500 font-medium leading-relaxed">{popup.description}</p>
                                        <div className="flex items-center gap-3 pt-2">
                                            <button
                                                onClick={() => togglePopupStatus(popup.id, popup.is_active)}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${popup.is_active
                                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                    : "bg-slate-100 text-slate-400"
                                                    }`}
                                            >
                                                {popup.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                {popup.is_active ? "Active Now" : "Inactive"}
                                            </button>
                                            <button
                                                onClick={() => deletePopup(popup.id)}
                                                className="px-6 py-3 text-red-500 hover:bg-red-50 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                                            >
                                                Delete Campaign
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "news" && (
                    <div className="animate-in fade-in slide-in-from-right duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Latest News</h1>
                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">{news.length} Published</span>
                        </div>

                        {/* Add News Form */}
                        <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-[24px] mb-12">
                            <form onSubmit={addNews} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">News Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter headline"
                                        value={newsForm.title}
                                        onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-slate-700"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cover Image (Optional)</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setNewsForm({ ...newsForm, image: e.target.files ? e.target.files[0] : null })}
                                            className="hidden"
                                            id="news-file"
                                        />
                                        <label htmlFor="news-file" className="flex items-center gap-3 w-full p-4 bg-white border border-slate-200 border-dashed rounded-2xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all font-medium text-slate-500">
                                            <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                <UploadCloud className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="truncate">{newsForm.image ? newsForm.image.name : "Select JPG / PNG"}</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">News Content</label>
                                    <textarea
                                        placeholder="Enter full news content..."
                                        value={newsForm.content}
                                        onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                                        rows={4}
                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-slate-700"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-2"
                                >
                                    {loading ? "Publishing..." : <><PlusCircle className="w-5 h-5" /> Publish News</>}
                                </button>
                            </form>
                        </div>

                        {/* News List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {news.map((item) => (
                                <div key={item.id} className="group relative flex flex-col gap-4 bg-white border border-slate-100 p-6 rounded-[24px] hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                    {item.image_url && (
                                        <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-inner shrink-0 bg-slate-50">
                                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</p>
                                        <h3 className="text-lg font-black text-slate-800 tracking-tight line-clamp-1">{item.title}</h3>
                                        <p className="text-slate-500 font-medium leading-relaxed text-sm line-clamp-2">{item.content}</p>
                                        <div className="flex items-center justify-end pt-2">
                                            <button
                                                onClick={() => deleteNews(item.id)}
                                                className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "accreditations" && (
                    <div className="animate-in fade-in slide-in-from-right duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Accreditations</h1>
                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">{accreditations.length} Active</span>
                        </div>

                        {/* Add Accreditation Form */}
                        <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-[24px] mb-12">
                            <form onSubmit={addAccreditation} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter title"
                                        value={accreditationsForm.title}
                                        onChange={(e) => setAccreditationsForm({ ...accreditationsForm, title: e.target.value })}
                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-slate-700"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Logo</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setAccreditationsForm({ ...accreditationsForm, image: e.target.files ? e.target.files[0] : null })}
                                            className="hidden"
                                            id="accreditation-file"
                                            required
                                        />
                                        <label htmlFor="accreditation-file" className="flex items-center gap-3 w-full p-4 bg-white border border-slate-200 border-dashed rounded-2xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all font-medium text-slate-500">
                                            <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                <UploadCloud className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="truncate">{accreditationsForm.image ? accreditationsForm.image.name : "Select JPG / PNG"}</span>
                                        </label>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-2"
                                >
                                    {loading ? "Uploading..." : <><PlusCircle className="w-5 h-5" /> Push to Production</>}
                                </button>
                            </form>
                        </div>

                        {/* Accreditations List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {accreditations.map((item) => (
                                <div key={item.id} className="group flex flex-col items-center gap-4 bg-white border border-slate-100 p-5 rounded-[24px] hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                    <div className="relative h-24 w-full rounded-xl overflow-hidden shadow-sm shrink-0 flex items-center justify-center bg-slate-50">
                                        <img src={item.image_url} alt={item.title} className="max-w-full max-h-full object-contain p-2 group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <div className="flex w-full items-center justify-between mt-2">
                                        <h3 className="font-black text-slate-800 text-sm tracking-tight truncate flex-1">{item.title}</h3>
                                        <button
                                            onClick={() => deleteAccreditation(item.id)}
                                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-2 shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="p-10 text-slate-400">Loading settings...</div>}>
            <SettingsContent />
        </Suspense>
    );
}
