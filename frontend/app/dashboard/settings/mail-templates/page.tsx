"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Edit2, Clock, CheckCircle } from "lucide-react";

type MailTemplate = {
  id?: number;
  name: string;
  subject: string;
  body: string;
  enable_reminder: boolean;
  reminder_frequency_days: number | null;
  reminder_stop_condition: string;
  reminder_start_delay_days: number;
  attached_pdf?: string;
  is_active: boolean;
};

export default function MailTemplatesSettings() {
  const [templates, setTemplates] = useState<MailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<MailTemplate | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/mail-templates`);
      setTemplates(res.data);
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setCurrentTemplate({
      name: "",
      subject: "",
      body: "",
      enable_reminder: false,
      reminder_frequency_days: 1,
      reminder_stop_condition: "Stop on Event Date",
      reminder_start_delay_days: 0,
      is_active: true,
    });
    setIsEditing(true);
  };

  const handleEdit = (t: MailTemplate) => {
    setCurrentTemplate({ ...t });
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await axios.delete(`${API}/api/mail-templates/${id}`);
      fetchTemplates();
    } catch (err) {
      console.error("Error deleting template:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplate) return;

    try {
      if (currentTemplate.id) {
        await axios.put(`${API}/api/mail-templates/${currentTemplate.id}`, currentTemplate);
      } else {
        await axios.post(`${API}/api/mail-templates`, currentTemplate);
      }
      setIsEditing(false);
      fetchTemplates();
    } catch (err) {
      console.error("Error saving template:", err);
      alert("Failed to save template.");
    }
  };

  if (loading) {
    return <div className="p-8">Loading mail templates...</div>;
  }

  if (isEditing && currentTemplate) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">
          {currentTemplate.id ? "Edit Mail Template" : "Create New Template"}
        </h1>
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Template Name (Internal)</label>
              <input
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                type="text"
                value={currentTemplate.name}
                onChange={e => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                placeholder="e.g., Job Fair Registration"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Subject</label>
              <input
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                type="text"
                value={currentTemplate.subject}
                onChange={e => setCurrentTemplate({...currentTemplate, subject: e.target.value})}
                placeholder="Subject line"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Body</label>
              <p className="text-xs text-slate-500 mb-2">Available variables: {'{{student_name}}, {{event_name}}, {{event_date}}, {{event_time}}, {{event_location}}, {{reporting_time}}, {{days_remaining}}'}</p>
              <textarea
                required
                className="w-full border border-slate-300 rounded-lg p-3 min-h-[200px] focus:ring-2 focus:ring-blue-500"
                value={currentTemplate.body}
                onChange={e => setCurrentTemplate({...currentTemplate, body: e.target.value})}
                placeholder="Hello {{student_name}}, ..."
              />
            </div>

            <div className="border-t border-slate-200 pt-6 mt-2">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" /> Reminder Settings
              </h3>
              
              <div className="flex items-center gap-3 mb-6">
                <input
                  type="checkbox"
                  id="enable_reminder"
                  className="w-5 h-5 text-blue-600 rounded"
                  checked={currentTemplate.enable_reminder}
                  onChange={e => setCurrentTemplate({...currentTemplate, enable_reminder: e.target.checked})}
                />
                <label htmlFor="enable_reminder" className="font-medium text-slate-700">Enable Automatic Reminder Emails</label>
              </div>

              {currentTemplate.enable_reminder && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reminder Start</label>
                    <select
                      className="w-full border border-slate-300 rounded-lg p-2"
                      value={currentTemplate.reminder_start_delay_days}
                      onChange={e => setCurrentTemplate({...currentTemplate, reminder_start_delay_days: parseInt(e.target.value)})}
                    >
                      <option value={0}>Immediately After Registration</option>
                      <option value={1}>1 Day After Registration</option>
                      <option value={2}>2 Days After Registration</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reminder Frequency</label>
                    <select
                      className="w-full border border-slate-300 rounded-lg p-2"
                      value={currentTemplate.reminder_frequency_days || 1}
                      onChange={e => setCurrentTemplate({...currentTemplate, reminder_frequency_days: parseInt(e.target.value)})}
                    >
                      <option value={1}>Every 1 Day</option>
                      <option value={2}>Every 2 Days</option>
                      <option value={3}>Every 3 Days</option>
                      <option value={4}>Every 4 Days</option>
                      <option value={5}>Every 5 Days</option>
                      <option value={7}>Every 7 Days</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stop Reminder</label>
                    <select
                      className="w-full border border-slate-300 rounded-lg p-2"
                      value={currentTemplate.reminder_stop_condition}
                      onChange={e => setCurrentTemplate({...currentTemplate, reminder_stop_condition: e.target.value})}
                    >
                      <option value="Stop on Event Date">Stop on Event Date</option>
                      <option value="Stop 1 Day Before">Stop 1 Day Before</option>
                      <option value="Stop 2 Days Before">Stop 2 Days Before</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Save Template
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mail Templates</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition"
        >
          <Plus size={20} />
          Add Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <div className="col-span-full text-center text-slate-500 py-12">
            No mail templates found. Create one to get started!
          </div>
        ) : (
          templates.map(t => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-slate-800">{t.name}</h3>
                  {t.enable_reminder ? (
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                      <Clock size={12} /> Auto Reminder
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded">
                      Standard
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  <span className="font-medium text-slate-800">Subject:</span> {t.subject}
                </p>
                {t.enable_reminder && (
                  <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 space-y-1 border border-blue-100">
                    <p>• Repeats: <strong>Every {t.reminder_frequency_days} day(s)</strong></p>
                    <p>• Starts: <strong>{t.reminder_start_delay_days === 0 ? 'Immediately' : `${t.reminder_start_delay_days} day(s) later`}</strong></p>
                    <p>• Stops: <strong>{t.reminder_stop_condition}</strong></p>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-between items-center">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  {t.is_active ? (
                    <><span className="w-2 h-2 rounded-full bg-green-500"></span> Active</>
                  ) : (
                    <><span className="w-2 h-2 rounded-full bg-slate-400"></span> Inactive</>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(t)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(t.id!)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
