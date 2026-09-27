'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function GlobalInquiryModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isOpen = searchParams.has('inquire');
  const initialInterest = searchParams.get('interest') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: initialInterest,
    message: ''
  });
  
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');

  // Update initial interest when opened from different links
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, interest: initialInterest || prev.interest }));
    }
  }, [isOpen, initialInterest]);

  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('inquire');
    params.delete('interest');
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
    
    // Reset form on close after a small delay
    setTimeout(() => {
      setStatus('idle');
      setFormData({
        name: '',
        email: '',
        phone: '',
        interest: '',
        message: ''
      });
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit inquiry.');

      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message);
      setStatus('error');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={closeModal}
      />
      
      <div className="relative bg-neutral-900 border border-white/10 w-full max-w-xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button 
          onClick={closeModal}
          className="absolute top-6 right-6 text-neutral-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-light text-white mb-2 uppercase tracking-widest">Private Inquiry</h2>
        <p className="text-neutral-400 text-sm mb-8 font-mono">Contact the studio for acquisitions and commissions.</p>

        {status === 'success' ? (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl text-white mb-2">Inquiry Received</h3>
            <p className="text-neutral-400 font-mono text-sm mb-8">We will be in touch shortly.</p>
            <button 
              onClick={closeModal}
              className="bg-white text-black px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-neutral-400 font-mono">Name *</label>
                <input 
                  required
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-neutral-400 font-mono">Email *</label>
                <input 
                  required
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-neutral-400 font-mono">Phone</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-neutral-400 font-mono">Interest</label>
                <input 
                  type="text" 
                  name="interest"
                  value={formData.interest}
                  onChange={handleChange}
                  placeholder="e.g. Artwork Title"
                  className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-white/50 transition-colors placeholder:text-neutral-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-400 font-mono">Message</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-white/50 transition-colors resize-none"
              />
            </div>

            {status === 'error' && (
              <div className="text-red-400 text-sm font-mono bg-red-400/10 p-3 border border-red-400/20">
                {errorMessage}
              </div>
            )}

            <button 
              type="submit" 
              disabled={status === 'submitting'}
              className="w-full bg-white text-black py-4 text-sm font-semibold uppercase tracking-[0.2em] hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
