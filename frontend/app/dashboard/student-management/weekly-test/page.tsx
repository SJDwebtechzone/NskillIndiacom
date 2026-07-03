'use client';
import { useState, useRef, useEffect } from 'react';
import { UploadCloud, File, Video, CheckCircle2, X, Clock, FileText } from 'lucide-react';
import { ValidatedFileInput } from "@/components/ValidatedFileInput";

interface PosttestQuestion {
  id: number;
  course_name: string;
  question: string;
  is_upload: boolean;
  upload_type: 'document' | 'video' | 'both';
}

interface AttemptStatus {
  attempted: boolean;
  score?: number;
  total?: number;
  passed?: boolean;
  file_url?: string;
  file_type?: string;
  status?: string;
  review_note?: string;
}

export default function StudentWeeklyTestUploadPage() {
  const [courseName, setCourseName] = useState('');
  const [uploadRequest, setUploadRequest] = useState<PosttestQuestion | null>(null);
  const [attemptStatus, setAttemptStatus] = useState<AttemptStatus | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Upload states
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Get Course
      const courseRes = await fetch(`${API}/api/admin/posttest/student/course`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!courseRes.ok) throw new Error('Could not fetch student course');
      const courseData = await courseRes.json();
      setCourseName(courseData.course_name);

      // 2. Get Questions to see if there's an upload request
      const questionsRes = await fetch(`${API}/api/admin/posttest/${courseData.course_name}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (questionsRes.ok) {
        const questionsData = await questionsRes.json();
        const uploadQ = questionsData.questions?.find((q: any) => q.is_upload);
        if (uploadQ) setUploadRequest(uploadQ);
      }

      // 3. Get Attempt Status
      const attemptRes = await fetch(`${API}/api/admin/posttest/student/attempt-status?course_name=${encodeURIComponent(courseData.course_name)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (attemptRes.ok) {
        const attemptData = await attemptRes.json();
        setAttemptStatus(attemptData);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setUploadError('');
    if (!uploadRequest) return;

    const isVideo = selectedFile.type.startsWith('video/');
    const isValidVideo = ['video/mp4', 'video/webm', 'video/quicktime'].includes(selectedFile.type);
    const isValidDoc = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ].includes(selectedFile.type);

    if (uploadRequest.upload_type === 'video' && !isVideo) {
      setUploadError('This test requires a video upload.');
      return;
    }
    if (uploadRequest.upload_type === 'document' && isVideo) {
      setUploadError('This test requires a document upload.');
      return;
    }
    if (!isValidVideo && !isValidDoc) {
      setUploadError('Please upload a valid Document or Video format.');
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!file || !uploadRequest) return;
    setUploading(true);
    setUploadError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('weekly_test_file', file);
      formData.append('course_name', courseName);
      
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.open("POST", `${API}/api/admin/posttest/student/submit`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(JSON.parse(xhr.responseText).error || "Failed to upload"));
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });

      setUploadSuccess('Your test was submitted successfully!');
      setTimeout(() => {
        setUploadSuccess('');
        setFile(null);
        fetchData();
      }, 2000);
    } catch (err: any) {
      setUploadError(err.message || 'An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 bg-red-50 rounded-xl m-6 border border-red-100">{error}</div>;
  }

  if (!uploadRequest) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 min-h-screen bg-slate-50/50">
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-slate-500 font-bold text-lg">No weekly test requested yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 min-h-screen bg-slate-50/50">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-2">
          <UploadCloud size={28} className="text-purple-600" />
          My Weekly Test
        </h1>
        <p className="text-slate-500 font-medium">
          Requested Format: <span className="font-bold text-slate-700 capitalize">{uploadRequest.upload_type}</span>
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8">
        
        {/* Trainer Instructions */}
        <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
          <h3 className="font-bold text-purple-900 mb-1">Trainer's Request:</h3>
          <p className="text-purple-700 text-sm">{uploadRequest.question}</p>
        </div>

        {/* Previous Submission Status */}
        {attemptStatus?.attempted && attemptStatus.file_url && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={20} />
              Your Current Submission
            </h3>
            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
              <a href={`${API}${attemptStatus.file_url}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 font-bold hover:underline text-sm">
                {attemptStatus.file_type === 'video' ? <Video size={16} /> : <FileText size={16} />}
                View Uploaded {attemptStatus.file_type}
              </a>
              <span className={`px-2 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${
                attemptStatus.status === 'reviewed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {attemptStatus.status === 'reviewed' ? 'Reviewed' : 'Pending Review'}
              </span>
            </div>
            {attemptStatus.review_note && (
              <div className="mt-3 bg-amber-50 text-amber-800 p-3 rounded-xl text-sm border border-amber-200">
                <span className="font-bold block mb-1">Trainer's Note:</span>
                {attemptStatus.review_note}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-3 text-center">Uploading a new file below will replace your current submission.</p>
          </div>
        )}

        {/* Upload Area */}
        {uploadSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
            <CheckCircle2 size={64} className="text-emerald-500" />
            <h2 className="text-2xl font-bold text-slate-800">{uploadSuccess}</h2>
          </div>
        ) : (
          <>
            {uploadError && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100 text-sm flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <p className="mt-0.5">{uploadError}</p>
              </div>
            )}

            <div 
              className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
                file ? 'border-purple-200 bg-purple-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 cursor-pointer'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <ValidatedFileInput 
                fileType="any"
                ref={fileInputRef as any} 
                onChange={handleFileChange} 
                className="hidden" 
              />

              {!file ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400">
                    <UploadCloud size={32} />
                  </div>
                  <div>
                    <p className="text-slate-800 font-bold text-lg">Click or drag file to upload</p>
                    <p className="text-slate-500 font-medium text-sm mt-1">Please ensure the file matches the requested format.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-purple-100 shadow-sm relative group cursor-default" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                      {file.type.startsWith('video/') ? <Video size={24} /> : <File size={24} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button onClick={removeFile} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            {uploading && uploadProgress > 0 && (
              <div className="w-full">
                <div className="flex justify-between text-xs text-slate-500 mb-1 font-bold">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={handleSubmit}
                disabled={!file || uploading}
                className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                  !file || uploading 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 active:scale-95'
                }`}
              >
                {uploading ? 'Uploading...' : 'Submit Test'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}