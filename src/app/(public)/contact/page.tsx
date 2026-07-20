"use client";

import PageContainer from "@/components/layout/page-container";
import { MOCK_SHOWROOMS } from "@/constants/mock-data";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ name: "", phone: "", message: "" });
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col w-full bg-background min-h-screen py-space-6">
      <PageContainer className="flex flex-col gap-space-12">
        {/* Header */}
        <div className="flex flex-col gap-space-2 max-w-xl">
          <span className="text-label-small font-bold text-accent uppercase tracking-wider">
            Connect
          </span>
          <h1 className="text-page-title font-bold tracking-tight text-primary">
            Contact Us & Find Showrooms
          </h1>
          <p className="text-body text-foreground/60 leading-relaxed">
            Need directions, stock availability, or direct assistance? Get in touch with our showrooms or drop us an online inquiry.
          </p>
        </div>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-8 items-start">
          {/* Form */}
          <div className="lg:col-span-2 bg-card border border-border p-space-8 rounded-card shadow-soft-sm">
            <h2 className="text-section-title font-bold text-primary tracking-tight mb-2">
              Send an Inquiry
            </h2>
            <p className="text-caption text-foreground/60 mb-6">
              Looking for a specific model or size? Provide details and we will check stock across showrooms.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-space-4">
              <div className="flex flex-col gap-1">
                <label className="text-label-small font-semibold text-foreground/70 uppercase">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  className="bg-secondary/40 border border-border rounded-input px-space-4 py-space-3 outline-none focus:border-accent text-caption"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-small font-semibold text-foreground/70 uppercase">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="Your active phone number"
                  className="bg-secondary/40 border border-border rounded-input px-space-4 py-space-3 outline-none focus:border-accent text-caption"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-small font-semibold text-foreground/70 uppercase">Inquiry Details</label>
                <textarea
                  rows={4}
                  placeholder="Tell us the brand, shoe style, and size you are interested in..."
                  className="bg-secondary/40 border border-border rounded-input px-space-4 py-space-3 outline-none focus:border-accent text-caption resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-space-3 rounded-button hover:bg-accent hover:text-accent-foreground transition-all shadow-soft-sm text-caption w-full mt-2"
              >
                <Send className="h-4 w-4" />
                Submit Inquiry
              </button>

              {success && (
                <div className="mt-space-2 p-space-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-button text-caption font-medium text-center">
                  Inquiry sent successfully! Our team will contact you soon.
                </div>
              )}
            </form>
          </div>

          {/* Quick Info Sidebar */}
          <div className="flex flex-col gap-space-6 bg-secondary/30 p-space-6 rounded-card border border-border">
            <h3 className="text-body-large font-bold text-primary">General Contact</h3>
            <div className="flex flex-col gap-space-4 text-caption text-foreground/80">
              <div className="flex gap-3 items-center">
                <div className="bg-accent/10 p-2 rounded-full text-accent shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-label-small font-bold uppercase text-foreground/40 leading-none">Phone</p>
                  <span className="font-semibold">+91 98794 59303</span>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <div className="bg-accent/10 p-2 rounded-full text-accent shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-label-small font-bold uppercase text-foreground/40 leading-none">Email</p>
                  <span className="font-semibold">info@footcarebhuj.com</span>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="bg-accent/10 p-2 rounded-full text-accent shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-label-small font-bold uppercase text-foreground/40 leading-none">Support Office</p>
                  <span className="font-semibold">College Road, near Jubilee Ground, Bhuj 370001</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Showroom Cards */}
        <div className="flex flex-col gap-space-4 mt-space-4">
          <h2 className="text-section-title font-bold text-primary tracking-tight">
            Direct Showroom Lines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-6">
            {MOCK_SHOWROOMS.map((showroom) => (
              <div
                key={showroom.id}
                className="bg-card border border-border p-space-6 rounded-card shadow-soft-sm flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-body font-bold text-foreground mb-1">
                    {showroom.name}
                  </h3>
                  <p className="text-caption text-foreground/50 leading-relaxed mb-4">
                    {showroom.address}
                  </p>
                </div>
                <div className="flex flex-col gap-space-2 border-t border-border pt-space-4 mt-auto">
                  <a
                    href={`tel:${showroom.phone.replace(/\s+/g, "")}`}
                    className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-semibold py-2 rounded-button text-caption hover:bg-accent hover:text-accent-foreground transition-all"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call {showroom.phone}
                  </a>
                  <a
                    href={showroom.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 border border-border font-semibold py-2 rounded-button text-caption hover:bg-secondary transition-all"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Get Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
