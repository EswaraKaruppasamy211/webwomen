'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  ShieldCheck,
  Trash2,
  Edit2,
  CheckCircle2,
  Send,
  Sparkles,
  AlertCircle,
  Bell,
  Check,
} from 'lucide-react';
import { api } from '../../../services/api';
import { EmergencyContact } from '../../../types';
import DisclaimerBanner from '../../../components/ui/DisclaimerBanner';
import { audioAlerts } from '../../../services/audioAlerts';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('Mother');
  const [notifyOnSOS, setNotifyOnSOS] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      const res = await api.getContacts();
      setContacts(res.contacts);
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const openAddModal = () => {
    setEditingContact(null);
    setName('');
    setPhone('');
    setEmail('');
    setRelationship('Family');
    setNotifyOnSOS(true);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setPhone(contact.phone);
    setEmail(contact.email || '');
    setRelationship(contact.relationship);
    setNotifyOnSOS(contact.notifyOnSOS);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (editingContact) {
        await api.updateContact(editingContact.id, {
          name,
          phone,
          email,
          relationship,
          notifyOnSOS,
        });
      } else {
        await api.addContact({
          name,
          phone,
          email,
          relationship,
          notifyOnSOS,
        });
      }
      setModalOpen(false);
      audioAlerts.playClick(700, 0.1);
      fetchContacts();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save contact');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this emergency contact?')) return;
    try {
      await api.deleteContact(id);
      audioAlerts.playClick(400, 0.1);
      fetchContacts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete contact');
    }
  };

  const handleTestAlert = async (id: string, contactName: string) => {
    try {
      const res = await api.testContactAlert(id);
      setTestResult(`✅ Test Alert Verified: Delivered to ${contactName} at ${new Date().toLocaleTimeString()}`);
      audioAlerts.playClick(800, 0.15);
      setTimeout(() => setTestResult(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to send test alert');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="bg-safeNavy-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-4 h-4" />
            <span>Emergency Guardians & Contacts</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Emergency Contacts Directory</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            When you activate SOS or a safety check-in expires, these verified guardians receive instant SMS alerts with
            your live GPS tracking link.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold py-3 px-5 rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Guardian Contact</span>
        </button>
      </div>

      {/* Success / Test Notification Banner */}
      {testResult && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold p-4 rounded-2xl flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{testResult}</span>
        </div>
      )}

      {/* Contacts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading emergency contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="bg-safeNavy-900 border border-slate-800 rounded-3xl p-8 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-base text-white">No Emergency Contacts Added Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Please add at least 1 trusted guardian or family member so they can be notified immediately during an SOS
              emergency.
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
            >
              + Add First Emergency Contact
            </button>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-safeNavy-900/90 border border-slate-800 hover:border-slate-700 p-5 rounded-3xl transition-all shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-indigo-500/20 border border-slate-700 flex items-center justify-center text-rose-300 font-bold text-sm uppercase">
                  {contact.name.charAt(0)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{contact.name}</span>
                    <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full font-medium">
                      {contact.relationship}
                    </span>
                    {contact.verified && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1.5 font-mono">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      {contact.phone}
                    </span>
                    {contact.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {contact.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleTestAlert(contact.id, contact.name)}
                  className="flex items-center gap-1 bg-safeNavy-950 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                  title="Send simulated test SMS to this contact"
                >
                  <Send className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Test Alert</span>
                </button>

                <button
                  onClick={() => openEditModal(contact)}
                  className="p-2 bg-safeNavy-950 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl transition-colors"
                  title="Edit contact"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-2 bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 text-red-400 rounded-xl transition-colors"
                  title="Delete contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Contact Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-safeNavy-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold mb-1">
              {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Guardian Contact'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter valid contact details for emergency SMS & live location link dispatches.
            </p>

            {formError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Jenkins"
                  className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-4481"
                  className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guardian@example.com"
                  className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full bg-safeNavy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Partner / Spouse">Partner / Spouse</option>
                  <option value="Close Friend / Roommate">Close Friend / Roommate</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="notifyCheck"
                  checked={notifyOnSOS}
                  onChange={(e) => setNotifyOnSOS(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 bg-safeNavy-950 border-slate-700 focus:ring-rose-500"
                />
                <label htmlFor="notifyCheck" className="text-xs text-slate-300">
                  Notify immediately upon SOS trigger and Check-in expiration
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-safeNavy-800 hover:bg-safeNavy-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-rose-600/30"
                >
                  {editingContact ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
}
