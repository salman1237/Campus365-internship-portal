import { useEffect, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Printer, RefreshCcw, FileText, FileDown } from "lucide-react";
import { generateAppointmentLetterDocx } from "@/lib/generateDocx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";

import campusLogo from "@/assets/campus365-logo.png";
import whatsappIcon from "@/assets/whatsapp.png";
import webIcon from "@/assets/web.png";
import pinIcon from "@/assets/pin.png";
import skoderLogo from "@/assets/skoder.png";
import ibmLogo from "@/assets/ibm.png";
import msStartupsLogo from "@/assets/ms-startups.png";
import googleStartupsLogo from "@/assets/google-startups.png";
import ideaLogo from "@/assets/idea.png";
import acceleratingBangladeshLogo from "@/assets/accelerating-bangladesh.png";

export const Route = createFileRoute("/appointment-letter")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && localStorage.getItem("isAdmin") !== "true") {
      throw redirect({ to: "/admin" });
    }
  },
  head: () => ({
    meta: [
      { title: "Appointment Letter Template — Campus365" },
      { name: "description", content: "Editable internship appointment letter pad template for Campus365 / Skoder Technologies." },
      { property: "og:title", content: "Appointment Letter Template — Campus365" },
      { property: "og:description", content: "Editable internship appointment letter pad template for Campus365 / Skoder Technologies." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AppointmentLetterPage,
});

const initialState = {
  date: "",
  recipientName: "[Recipient Name]",
  recipientInstitution: "[Institution / Address]",
  subject: "Internship Appointment Letter",
  position: "Intern",
  department: "[Department]",
  startDate: "",
  endDate: "",
  workHours: "9 AM to 5 PM",
  workDays: "Sunday to Thursday",
  compensation: "Unpaid Internship",
  responsibilities:
    "assist with assigned projects, maintain confidentiality, and comply with company policies and professional standards",
  signatoryName: "[Authorized Signatory Name]",
  signatoryDesignation: "[Designation]",
};

function formatDateStr(dateStr: string, fallback: string) {
  if (!dateStr) return fallback;
  if (dateStr.startsWith("[")) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

function AppointmentLetterPage() {
  if (typeof window !== "undefined" && localStorage.getItem("isAdmin") !== "true") {
    return <Navigate to="/admin" replace />;
  }

  const [fields, setFields] = useState(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const name = searchParams.get("name");
      const institution = searchParams.get("institution");
      return {
        ...initialState,
        recipientName: name || initialState.recipientName,
        recipientInstitution: institution || initialState.recipientInstitution,
      };
    }
    return initialState;
  });

  // Set today's date on client only to avoid SSR hydration mismatch
  useEffect(() => {
    setFields((prev) =>
      prev.date
        ? prev
        : {
            ...prev,
            date: new Date().toISOString().split("T")[0],
          },
    );
  }, []);

  const updateField = (key: keyof typeof fields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handlePrint = () => window.print();
  const [docxLoading, setDocxLoading] = useState(false);
  const handleDocx = async () => {
    setDocxLoading(true);
    try {
      await generateAppointmentLetterDocx(fields);
    } finally {
      setDocxLoading(false);
    }
  };
  const handleReset = () =>
    setFields({
      ...initialState,
      date: new Date().toISOString().split("T")[0],
    });

  return (
    <div className="min-h-screen bg-muted print:bg-white">
      {/* Editor sidebar — hidden when printing */}
      <aside className="no-print fixed left-0 top-0 z-10 h-screen w-80 overflow-y-auto border-r bg-card p-5 shadow-sm">
        <div className="mb-6 flex items-center gap-2 text-brand">
          <FileText className="h-5 w-5" />
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Pad Template</h1>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          Fill in the fields below to preview the appointment letter. Use the print button to save as PDF.
        </p>

        <div className="space-y-4">
          <Field label="Date" type="date" value={fields.date} onChange={(v) => updateField("date", v)} />
          <Field label="Recipient name" value={fields.recipientName} onChange={(v) => updateField("recipientName", v)} />
          <Field label="Recipient institution / address" value={fields.recipientInstitution} onChange={(v) => updateField("recipientInstitution", v)} />
          <Field label="Subject" value={fields.subject} onChange={(v) => updateField("subject", v)} />
          <Field label="Position / role" value={fields.position} onChange={(v) => updateField("position", v)} />
          <Field label="Department" value={fields.department} onChange={(v) => updateField("department", v)} />
          <Field label="Start date" type="date" value={fields.startDate} onChange={(v) => updateField("startDate", v)} />
          <Field label="End date" type="date" value={fields.endDate} onChange={(v) => updateField("endDate", v)} />
          <Field label="Working hours" value={fields.workHours} onChange={(v) => updateField("workHours", v)} />
          <Field label="Working days" value={fields.workDays} onChange={(v) => updateField("workDays", v)} />
          <Field label="Compensation / status" value={fields.compensation} onChange={(v) => updateField("compensation", v)} />
          <div>
            <Label className="mb-1.5 block text-sm">Responsibilities</Label>
            <Textarea
              value={fields.responsibilities}
              onChange={(e) => updateField("responsibilities", e.target.value)}
              rows={3}
            />
          </div>
          <Separator className="my-4" />
          <Field label="Signatory name" value={fields.signatoryName} onChange={(v) => updateField("signatoryName", v)} />
          <Field label="Signatory designation" value={fields.signatoryDesignation} onChange={(v) => updateField("signatoryDesignation", v)} />
        </div>

        <div className="mt-8 flex flex-col gap-2">
          <Button onClick={handlePrint} className="w-full gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </Button>
          <Button onClick={handleDocx} disabled={docxLoading} variant="outline" className="w-full gap-2 border-blue-500/40 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30">
            <FileDown className="h-4 w-4" />
            {docxLoading ? "Generating..." : "Save as DOCX"}
          </Button>
          <Button onClick={handleReset} variant="outline" className="w-full gap-2">
            <RefreshCcw className="h-4 w-4" />
            Reset fields
          </Button>
        </div>
      </aside>

      {/* Letter preview */}
      <main className="ml-80 flex min-h-screen justify-center p-8 print:m-0 print:p-0">
        <article className="letter-paper flex flex-col text-foreground">
          <style>{`
            @media print {
              @page {
                size: A4;
                margin: 0.5in;
              }
            }
          `}</style>
          <table className="w-full">
            <thead>
              <tr>
                <td>
                  {/* Letterhead */}
                  <header className="mb-8 border-b border-dashed border-foreground/30 pb-4">
            <div className="flex items-start justify-between gap-6">
              <DynamicLogo
                logoKey="campus365-logo.png"
                fallbackSrc={campusLogo}
                alt="Campus365 — Digital Space for Universities"
                className="h-16 w-auto object-contain"
              />
              <div className="text-right">
                <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "#6b2fa8" }}>
                  Campus365
                </h1>
                <p className="text-sm font-medium" style={{ color: "#c0392b" }}>
                  A Skoder Technologies Concern
                </p>
                <p className="mt-1 text-xs">
                  <span style={{ color: "#c0392b" }} className="font-semibold">BIN# 002855793-0401</span>
                  <span className="mx-2 text-muted-foreground">·</span>
                  <span style={{ color: "#1e8449" }} className="font-semibold">Trade# DNCC-056205/2022</span>
                </p>
              </div>
            </div>
                  </header>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {/* Body */}
                  <div className="flex-1">
            {/* Date & recipient */}
            <section className="mb-6 text-sm leading-relaxed">
              <p className="font-semibold">Campus365</p>
              <p>ICT Tower: E-14/X, Agargaon, Dhaka 1207</p>
              <p className="mt-2">
                <span className="font-semibold">Date:</span>{" "}
                <span suppressHydrationWarning>{formatDateStr(fields.date, "[Date]")}</span>
              </p>
              <div className="mt-5">
                <p className="font-semibold">To:</p>
                <p>{fields.recipientName}</p>
                <p>{fields.recipientInstitution}</p>
              </div>
              <p className="mt-4">
                <span className="font-semibold">Subject: {fields.subject}</span>
              </p>
            </section>

            {/* Salutation & body */}
            <section className="space-y-4 text-justify text-sm leading-relaxed">
              <p>Dear {fields.recipientName},</p>
              <p>
                We are pleased to inform you that you have been appointed as a{" "}
                <span className="font-semibold">{fields.position}</span> at{" "}
                <span className="font-semibold">Campus365</span>, effective{" "}
                <span className="font-semibold">{formatDateStr(fields.startDate, "[Start Date]")}</span> to{" "}
                <span className="font-semibold">{formatDateStr(fields.endDate, "[End Date]")}</span>.
              </p>
              <p>
                Your working hours will be <span className="font-semibold">{fields.workHours}</span>, from{" "}
                <span className="font-semibold">{fields.workDays}</span>, and this is a{" "}
                <span className="font-semibold">{fields.compensation}</span>. During your internship, you are expected to{" "}
                {fields.responsibilities}.
              </p>
              <p>
                All materials, data, and information accessed during the internship remain the property of{" "}
                <span className="font-semibold">Campus365</span>, and must not be disclosed to any third party.
              </p>
              <p>
                Upon successful completion of the internship, you will be awarded an{" "}
                <span className="font-semibold">Internship Completion Certificate</span>.
              </p>
              <p>
                We welcome you to <span className="font-semibold">Campus365</span> and look forward to your valuable contributions.
              </p>
              <p>Warm regards,</p>
            </section>

            {/* Signatory */}
            <div className="mt-10 text-sm">
              <p className="font-semibold">For Campus365</p>
              <p className="mt-6">Authorized Signatory:</p>
              <p className="mt-8">
                <span className="font-semibold">Name:</span> {fields.signatoryName}
              </p>
              <p>
                <span className="font-semibold">Designation:</span> {fields.signatoryDesignation}
              </p>
            </div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>
                  {/* Footer */}
                  <footer className="mt-10 border-t border-dashed border-foreground/30 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <DynamicLogo logoKey="whatsapp.png" fallbackSrc={whatsappIcon} alt="" className="h-4 w-4 object-contain" />
                <span style={{ color: "#1e8449" }} className="font-semibold">+88 01750 726094</span>
              </span>
              <span className="flex items-center gap-1.5">
                <DynamicLogo logoKey="web.png" fallbackSrc={webIcon} alt="" className="h-4 w-4 object-contain" />
                <span style={{ color: "#2874a6" }} className="font-semibold">www.campus365.net</span>
              </span>
              <span className="flex items-center gap-1.5">
                <DynamicLogo logoKey="pin.png" fallbackSrc={pinIcon} alt="" className="h-4 w-4 object-contain" />
                <span style={{ color: "#1e8449" }} className="font-semibold">
                  IDEA Project, ICT Tower, Agargaon, Dhaka-1207
                </span>
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <DynamicLogo logoKey="skoder.png" fallbackSrc={skoderLogo} alt="Skoder" className="h-6 w-auto object-contain" />
              <DynamicLogo logoKey="ibm.png" fallbackSrc={ibmLogo} alt="IBM" className="h-5 w-auto object-contain" />
              <DynamicLogo logoKey="ms-startups.png" fallbackSrc={msStartupsLogo} alt="Microsoft for Startups" className="h-6 w-auto object-contain" />
              <DynamicLogo logoKey="google-startups.png" fallbackSrc={googleStartupsLogo} alt="Google for Startups" className="h-5 w-auto object-contain" />
              <DynamicLogo logoKey="idea.png" fallbackSrc={ideaLogo} alt="IDEA" className="h-6 w-auto object-contain" />
              <DynamicLogo logoKey="accelerating-bangladesh.png" fallbackSrc={acceleratingBangladeshLogo} alt="Accelerating Bangladesh" className="h-6 w-auto object-contain" />
            </div>
                  </footer>
                </td>
              </tr>
            </tfoot>
          </table>
        </article>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function DynamicLogo({
  logoKey,
  fallbackSrc,
  alt,
  className,
}: {
  logoKey: string;
  fallbackSrc: string;
  alt?: string;
  className?: string;
}) {
  const [src, setSrc] = useState(() => {
    // Attempt to load from Supabase Storage
    return supabase.storage.from("logos").getPublicUrl(logoKey).data.publicUrl;
  });

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        // If the custom image doesn't exist in Supabase (404), fall back to local asset
        if (src !== fallbackSrc) {
          setSrc(fallbackSrc);
        }
      }}
    />
  );
}
