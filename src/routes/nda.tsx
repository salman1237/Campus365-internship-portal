import { useEffect, useState } from "react";
import { createFileRoute, redirect, Navigate } from "@tanstack/react-router";
import { Printer, RefreshCcw, FileText, FileDown } from "lucide-react";
import { generateNDADocx } from "@/lib/generateDocx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export const Route = createFileRoute("/nda")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && localStorage.getItem("isAdmin") !== "true") {
      throw redirect({ to: "/admin" });
    }
  },
  head: () => ({
    meta: [
      { title: "Non-Disclosure Agreement — Campus365" },
      { name: "description", content: "Editable NDA pad template for Campus365." },
    ],
  }),
  component: NDAPage,
});

const initialState = {
  date: "",
  internName: "[Intern Name]",
  internAddress: "[Intern Address]",
  companySignatoryName: "[Signatory Name]",
  companySignatoryTitle: "[Designation]",
  signatoryImage: "",
  companySealImage: "",
  stationeryImage: "",
};

function formatDateStr(dateStr: string, fallback: string) {
  if (!dateStr) return fallback;
  if (dateStr.startsWith("[")) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

function NDAPage() {
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
        internName: name || initialState.internName,
        internAddress: institution || initialState.internAddress,
      };
    }
    return initialState;
  });

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

  let dateDay = "_________";
  let dateMonth = "_________";
  let dateYear = "2025";
  if (fields.date) {
    const d = new Date(fields.date);
    if (!isNaN(d.getTime())) {
      dateDay = d.getDate().toString();
      dateMonth = d.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
      dateYear = d.getFullYear().toString();
    }
  }

  const handlePrint = () => window.print();
  const [docxLoading, setDocxLoading] = useState(false);
  const handleDocx = async () => {
    setDocxLoading(true);
    try {
      await generateNDADocx(fields);
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
          <h1 className="text-lg font-semibold tracking-tight text-foreground">NDA Template</h1>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          Fill in the fields below to preview the Non-Disclosure Agreement.
        </p>

        <div className="space-y-4">
          <Field label="Date" type="date" value={fields.date} onChange={(v) => updateField("date", v)} />
          <Field label="Intern name" value={fields.internName} onChange={(v) => updateField("internName", v)} />
          <Field label="Intern address" value={fields.internAddress} onChange={(v) => updateField("internAddress", v)} />
          <Separator className="my-4" />
          <Field label="Signatory name" value={fields.companySignatoryName} onChange={(v) => updateField("companySignatoryName", v)} />
          <Field label="Signatory title" value={fields.companySignatoryTitle} onChange={(v) => updateField("companySignatoryTitle", v)} />
          <FileField label="Upload Signatory Image" onChange={(v) => updateField("signatoryImage", v)} />
          <FileField label="Upload Company Seal" onChange={(v) => updateField("companySealImage", v)} />
          <FileField label="Upload Stationery/Logo" onChange={(v) => updateField("stationeryImage", v)} />
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
            .nda-text {
              font-family: "Calibri", "Segoe UI", sans-serif;
              text-align: justify;
              font-size: 0.95rem;
              line-height: 1.5;
              color: black;
            }
            .nda-text h2 {
              font-weight: bold;
              font-size: 1.25rem;
              text-align: center;
              margin-bottom: 1.5rem;
            }
            .nda-text h3 {
              font-weight: bold;
              margin-top: 1.25rem;
              margin-bottom: 0.75rem;
              font-size: 0.95rem;
            }
            .nda-text p {
              margin-bottom: 1rem;
            }
            .nda-text ul {
              list-style-type: disc;
              padding-left: 2rem;
              margin-bottom: 1rem;
            }
            .nda-text li {
              margin-bottom: 0.25rem;
            }
            .signature-line {
              display: inline-block;
              border-bottom: 1px solid black;
              min-width: 250px;
              text-align: center;
              padding: 0 8px;
              transform: translateY(2px);
            }
          `}</style>
          <table className="w-full">
            <thead>
              <tr>
                <td>
                  {/* Letterhead */}
                  <header className="mb-8 border-b border-dashed border-foreground/30 pb-4">
                    <div className="flex items-start justify-between gap-6">
                      {fields.stationeryImage ? (
                        <img src={fields.stationeryImage} alt="Stationery" className="h-16 w-auto object-contain" />
                      ) : (
                        <DynamicLogo
                          logoKey="campus365-logo.png"
                          fallbackSrc={campusLogo}
                          alt="Campus365 — Digital Space for Universities"
                          className="h-16 w-auto object-contain"
                        />
                      )}
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
                  <div className="flex-1 nda-text">
                    <h2>Non-Disclosure Agreement (NDA)</h2>
                    
                    <p>
                      <strong>This Nondisclosure Agreement</strong> is entered into on this {dateDay} day of {dateMonth}, {dateYear}, by and between:
                    </p>

                    <p>
                      <strong>The Company: Campus365</strong>, located at E-14/X, ICT Tower (14th Floor), Agargaon, Dhaka - 1207, Bangladesh.
                    </p>

                    <p>
                      <strong>The Intern:</strong> {fields.internName}, residing at {fields.internAddress}.
                    </p>

                    <h3>1. Definition of Confidential Information</h3>
                    <p>
                      "Confidential Information" refers to any data or information that is proprietary to the Company and not generally known to the public, whether in tangible or intangible form. This includes, but is not limited to:
                    </p>
                    <ul>
                      <li>Technical data, software code, and product designs.</li>
                      <li>Business plans, marketing strategies, and financial information.</li>
                      <li>Customer lists, vendor details, and employee records.</li>
                      <li>Any information marked "Confidential" or which the Intern should reasonably understand to be confidential.</li>
                    </ul>

                    <h3>2. Obligations of the Intern</h3>
                    <p>The Intern agrees to:</p>
                    <ul>
                      <li>Hold all Confidential Information in strict confidence.</li>
                      <li>Use the information <strong>solely</strong> for the purpose of performing their internship duties.</li>
                      <li>Not disclose, publish, or communicate any Confidential Information to any third party without prior written consent from the Company.</li>
                      <li>Take all reasonable precautions to prevent unauthorized disclosure (e.g., locking devices, not using public Wi-Fi for sensitive work).</li>
                    </ul>

                    <h3>3. Exclusions</h3>
                    <p>Confidential Information does not include information that:</p>
                    <ul>
                      <li>Is or becomes public knowledge through no fault of the Intern.</li>
                      <li>Was rightfully in the Intern's possession before the internship began.</li>
                      <li>Is independently developed by the Intern without the use of Company information.</li>
                    </ul>

                    <h3>4. Ownership of Work Product</h3>
                    <p>
                      The Intern agrees that any inventions, improvements, designs, or "work product" created during the internship period related to the Company's business are the <strong>sole property of the Company</strong>. The Intern hereby assigns all rights, including intellectual property rights, to the Company.
                    </p>

                    <h3>5. Term and Termination</h3>
                    <p>
                      This Agreement remains in effect during the internship and shall survive for a period of <strong>1 year</strong> after the internship ends. Upon termination of the internship, the Intern must immediately return or destroy all documents, devices, and files containing Confidential Information.
                    </p>

                    <h3>6. Remedies</h3>
                    <p>
                      The Intern acknowledges that any breach of this Agreement may cause irreparable harm to the Company for which monetary damages may be inadequate. Therefore, the Company shall be entitled to seek injunctive relief in addition to any other legal remedies.
                    </p>

                    <h3>Signatures</h3>
                    
                    <div className="mt-4">
                      <div>
                        <p className="mb-4">
                          <strong>For the Company:</strong> By: {fields.signatoryImage ? (
                            <img src={fields.signatoryImage} alt="Signature" className="inline-block h-12 w-auto ml-2 align-bottom" />
                          ) : (
                            <span className="signature-line"></span>
                          )}
                          <span className="ml-4">Name : {fields.companySignatoryName !== "[Signatory Name]" ? fields.companySignatoryName : ""}</span>
                        </p>
                        <p className="mb-8">
                          Title: <span className="signature-line">{fields.companySignatoryTitle !== "[Designation]" ? fields.companySignatoryTitle : ""}</span> 
                          <span className="ml-4">Date:</span> <span className="signature-line">{fields.date ? formatDateStr(fields.date, "") : ""}</span>
                        </p>
                        
                        <p className="mb-4">
                          <strong>The Intern:</strong> By: <span className="signature-line"></span>
                        </p>
                        <p className="mb-8">
                          Name: <span className="signature-line">{fields.internName !== "[Intern Name]" ? fields.internName : ""}</span> 
                          <span className="ml-4">Date:</span> <span className="signature-line">{fields.date ? formatDateStr(fields.date, "") : ""}</span>
                        </p>
                      </div>

                      {/* Company Seal */}
                      <div className="mt-8 flex flex-col items-center justify-center">
                        {fields.companySealImage && (
                          <img src={fields.companySealImage} alt="Company Seal" className="h-28 w-28 object-contain mix-blend-multiply opacity-90" />
                        )}
                      </div>
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

function FileField({
  label,
  onChange,
  accept = "image/*",
}: {
  label: string;
  onChange: (value: string) => void;
  accept?: string;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm">{label}</Label>
      <Input
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onChange(URL.createObjectURL(file));
          } else {
            onChange("");
          }
        }}
        className="cursor-pointer file:cursor-pointer"
      />
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
    return supabase.storage.from("logos").getPublicUrl(logoKey).data.publicUrl;
  });

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        if (src !== fallbackSrc) {
          setSrc(fallbackSrc);
        }
      }}
    />
  );
}
