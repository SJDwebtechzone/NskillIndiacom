const fs = require('fs');

let content = fs.readFileSync('frontend/app/dashboard/settings/page.tsx', 'utf-8');

// 1. Add Interface
if (!content.includes('interface Advertisement')) {
    content = content.replace('interface Banner {', `interface Advertisement {
    id: number;
    image: string;
    status: string;
    created_at: string;
}

interface Banner {`);
}

// 2. Add State & Fetching
if (!content.includes('const [advertisements, setAdvertisements]')) {
    content = content.replace('const [loading, setLoading] = useState(false);', `const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
    const [advertisementForm, setAdvertisementForm] = useState({
        image: null as File | null,
    });
    const [loading, setLoading] = useState(false);`);
}

// 3. Add to useEffect
if (!content.includes('fetchAdvertisements();')) {
    content = content.replace('fetchPartners();', `fetchPartners();
        fetchAdvertisements();`);
}

// 4. Add fetch method
if (!content.includes('const fetchAdvertisements = async () => {')) {
    content = content.replace('const fetchBanners = async () => {', `const fetchAdvertisements = async () => {
        try {
            const res = await axios.get(\`\${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/advertisements\`);
            setAdvertisements(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBanners = async () => {`);
}

// 5. Add CRUD methods
if (!content.includes('const addAdvertisement = async (e: React.FormEvent) => {')) {
    content = content.replace('const addBanner = async (e: React.FormEvent) => {', `const addAdvertisement = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        if (advertisementForm.image) {
            formData.append("image", advertisementForm.image);
        }

        try {
            await axios.post(\`\${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/advertisements\`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setAdvertisementForm({ image: null });
            fetchAdvertisements();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleAdvertisementStatus = async (id: number, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
            await axios.patch(\`\${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/advertisements/\${id}/status\`, { status: newStatus });
            fetchAdvertisements();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteAdvertisement = async (id: number) => {
        if (!confirm('Are you sure you want to delete this advertisement?')) return;
        try {
            await axios.delete(\`\${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/advertisements/\${id}\`);
            fetchAdvertisements();
        } catch (err) {
            console.error(err);
        }
    };

    const addBanner = async (e: React.FormEvent) => {`);
}

// 6. Update Active Tab conditions
if (!content.includes('tab === "advertisement" ? "advertisement"')) {
    content = content.replace('tab === "accreditations" ? "accreditations"', 'tab === "advertisement" ? "advertisement" : tab === "accreditations" ? "accreditations"');
    content = content.replace('if (tab === "popup") setActiveTab("popup");', 'if (tab === "advertisement") setActiveTab("advertisement");\n        else if (tab === "popup") setActiveTab("popup");');
}

// 7. Add Sidebar Tab
if (!content.includes('>Advertisement</button>')) {
    content = content.replace('<button\n                            onClick={() => setActiveTab("accreditations")}', `<button
                            onClick={() => setActiveTab("advertisement")}
                            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 \${
                                activeTab === "advertisement" 
                                ? "bg-[#2563eb] text-white shadow-md shadow-blue-500/20" 
                                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                            }\`}
                        >
                            <Monitor size={20} className={activeTab === "advertisement" ? "text-blue-100" : "text-slate-400"} />
                            <span className="font-semibold">Advertisement</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("accreditations")}`);
}

// 8. Render Block
if (!content.includes('activeTab === "advertisement" && (\n')) {
    content = content.replace('{activeTab === "banner" && (', `{activeTab === "advertisement" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Monitor className="w-5 h-5 text-[#2563eb]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Add Advertisement</h2>
                                    <p className="text-sm text-slate-500">Upload an advertisement image for the global popup.</p>
                                </div>
                            </div>

                            <form onSubmit={addAdvertisement} className="space-y-6 max-w-2xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Advertisement Image *</label>
                                    <ValidatedFileInput
                                        accept="image/*"
                                        onChange={(e: any) => setAdvertisementForm({ ...advertisementForm, image: e.target.files[0] })}
                                        className="w-full"
                                        required
                                    />
                                    <p className="text-xs text-slate-500">Recommended: 600x800px. Max size: 2MB.</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <PlusCircle size={18} />
                                    {loading ? "Saving..." : "Add Advertisement"}
                                </button>
                            </form>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 md:p-8 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-800">Current Advertisements</h2>
                                <p className="text-sm text-slate-500 mt-1">Manage all uploaded advertisements</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-slate-500 text-sm">
                                            <th className="p-4 font-semibold whitespace-nowrap">Image</th>
                                            <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                                            <th className="p-4 font-semibold whitespace-nowrap">Date</th>
                                            <th className="p-4 font-semibold whitespace-nowrap text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {advertisements.map((ad) => (
                                            <tr key={ad.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4">
                                                    <img src={ad.image} alt="Ad" className="h-16 w-16 object-cover rounded-lg border border-slate-200" />
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => toggleAdvertisementStatus(ad.id, ad.status)}
                                                        className={\`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors \${
                                                            ad.status === 'Active' 
                                                            ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }\`}
                                                    >
                                                        {ad.status === 'Active' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                                        {ad.status}
                                                    </button>
                                                </td>
                                                <td className="p-4 text-sm text-slate-600">
                                                    {new Date(ad.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => deleteAdvertisement(ad.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === "banner" && (`);
}

fs.writeFileSync('frontend/app/dashboard/settings/page.tsx', content);
console.log('Successfully patched frontend/app/dashboard/settings/page.tsx');
