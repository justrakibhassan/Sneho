"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Phone,
  User,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { getErrorMessage } from "@/utils/error-handler";

interface IEmergencyContact {
  id: number;
  name: string;
  phoneNumber: string;
  relationship?: string;
}

export default function EmergencyContactManager() {
  const [contacts, setContacts] = useState<IEmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    relationship: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchContacts = async () => {
    try {
      const response = await axiosInstance.get("/emergency-contacts");
      if (response.data.success) {
        setContacts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching contacts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ name: "", phoneNumber: "", relationship: "" });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.phoneNumber) {
      toast.error("Please provide both name and phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(
        "/emergency-contacts",
        formData
      );
      if (response.data.success) {
        toast.success("Contact added successfully");
        setContacts([response.data.data, ...contacts]);
        resetForm();
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to add contact");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formData.name || !formData.phoneNumber) {
      toast.error("Name and phone number cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.put(
        `/emergency-contacts/${id}`,
        formData
      );
      if (response.data.success) {
        toast.success("Contact updated successfully");
        setContacts(
          contacts.map((c) => (c.id === id ? response.data.data : c))
        );
        resetForm();
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to update contact");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this emergency contact?"))
      return;

    try {
      const response = await axiosInstance.delete(`/emergency-contacts/${id}`);
      if (response.data.success) {
        toast.success("Contact deleted");
        setContacts(contacts.filter((c) => c.id !== id));
      }
    } catch {
      toast.error("Failed to delete contact");
    }
  };

  const startEdit = (contact: IEmergencyContact) => {
    setEditingId(contact.id);
    setFormData({
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      relationship: contact.relationship || "",
    });
    setIsAdding(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#4B9AA4]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-800">
            Emergency Contacts
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            Add up to 5 trusted contacts for emergencies.
          </p>
        </div>
        {!isAdding && contacts.length < 5 && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-[#4B9AA4] text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#3d7d85] transition-all"
          >
            <Plus size={16} /> Add Contact
          </button>
        )}
      </div>

      {/* Adding/Editing Form */}
      {(isAdding || editingId) && (
        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-[#4B9AA4]/30 space-y-4 animate-in fade-in zoom-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 focus:border-[#4B9AA4] outline-none transition-all text-sm font-bold"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. 0170000000"
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 focus:border-[#4B9AA4] outline-none transition-all text-sm font-bold"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Relationship
              </label>
              <input
                type="text"
                name="relationship"
                value={formData.relationship}
                onChange={handleInputChange}
                placeholder="e.g. Brother, Friend"
                className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 focus:border-[#4B9AA4] outline-none transition-all text-sm font-bold"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={resetForm}
              className="px-6 py-2 bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-300 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                editingId ? handleUpdate(editingId) : handleAdd()
              }
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#4B9AA4] text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#3d7d85] transition-all shadow-lg shadow-[#4B9AA4]/20"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {editingId ? "Update Contact" : "Save Contact"}
            </button>
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.length === 0 && !isAdding && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400">
            <AlertCircle size={40} className="mb-2 opacity-20" />
            <p className="font-bold">No emergency contacts added yet.</p>
          </div>
        )}
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-[#4B9AA4]/30 hover:shadow-xl hover:shadow-[#4B9AA4]/5 transition-all duration-300 relative overflow-hidden"
          >
            {/* Decal background */}
            <div className="absolute -right-4 -bottom-4 text-[#4B9AA4] opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
              <Phone size={100} />
            </div>

            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-slate-800">{contact.name}</h4>
                  {contact.relationship && (
                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-widest">
                      {contact.relationship}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                  <Phone size={14} className="text-[#4B9AA4]" />
                  {contact.phoneNumber}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(contact)}
                  className="p-2 text-slate-400 hover:text-[#4B9AA4] hover:bg-[#4B9AA4]/10 rounded-lg transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
