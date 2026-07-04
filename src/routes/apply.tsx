import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle2 } from "lucide-react";
import campusLogo from "@/assets/campus365-logo.png";

export const Route = createFileRoute("/apply")({
  component: ApplyPage,
});

function ApplyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    fathers_name: "",
    mothers_name: "",
    institution: "",
    department: "",
    student_roll: "",
    id_type: "NID",
    id_number: "",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [signature, setSignature] = useState<File | null>(null);
  const [cv, setCv] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!photo || !signature || !cv) {
        throw new Error("Please upload all required files (Photo, Signature, CV).");
      }

      const uploadFile = async (file: File, folder: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;
        const { error } = await supabase.storage.from('applicant-files').upload(filePath, file);
        if (error) throw error;
        const { data: publicData } = supabase.storage.from('applicant-files').getPublicUrl(filePath);
        return publicData.publicUrl;
      };

      const photo_url = await uploadFile(photo, "photos");
      const signature_url = await uploadFile(signature, "signatures");
      const cv_url = await uploadFile(cv, "cvs");

      const { error: insertError } = await supabase.from("applications").insert([
        {
          ...formData,
          photo_url,
          signature_url,
          cv_url,
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0a0a12] flex flex-col items-center justify-center text-white p-4">
        {/* Background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #6b2fa8, transparent 70%)", animation: "float1 8s ease-in-out infinite" }} />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #c0392b, transparent 70%)", animation: "float2 10s ease-in-out infinite" }} />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

        <div className="relative z-10 flex max-w-md flex-col items-center space-y-4 rounded-2xl border border-white/10 bg-black/40 p-10 shadow-2xl backdrop-blur-xl text-center" style={{ animation: "fadeDown 0.8s ease both" }}>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Application Submitted!</h1>
          <p className="text-white/60">
            Thank you for applying. We have received your information and will be in touch shortly regarding your internship appointment.
          </p>
          <Button onClick={() => window.location.reload()} className="mt-6 border-white/20 bg-white/5 hover:bg-white/10 text-white" variant="outline">
            Submit Another Application
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a12] flex flex-col items-center justify-center text-white p-4">
      {/* Animated gradient background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #6b2fa8, transparent 70%)", animation: "float1 8s ease-in-out infinite" }} />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #c0392b, transparent 70%)", animation: "float2 10s ease-in-out infinite" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #1e8449, transparent 70%)", animation: "float3 12s ease-in-out infinite" }} />
      </div>

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl" style={{ animation: "fadeDown 0.8s ease both" }}>
        <div className="mb-8 text-center">
          <img src="https://cbppkbmautnwxucjtinz.supabase.co/storage/v1/object/public/logos/campus365-logo.png" alt="Campus365" className="mx-auto h-16 w-auto object-contain mb-4" />
          <h1 className="text-3xl font-bold tracking-tight text-white">Internship Application</h1>
          <p className="mt-3 text-sm text-white/60">
            Please provide your details below to apply for an internship at Skoder Technologies / Campus365.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 text-left">
            <Label htmlFor="name" className="text-white/80">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. John Doe"
              required
              value={formData.name}
              onChange={handleChange}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
            />
          </div>
          
          <div className="space-y-2 text-left">
            <Label htmlFor="email" className="text-white/80">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. john@example.com"
              required
              value={formData.email}
              onChange={handleChange}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="phone" className="text-white/80">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="e.g. +88 01..."
              required
              value={formData.phone}
              onChange={handleChange}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="institution" className="text-white/80">Institution / University</Label>
            <Input
              id="institution"
              name="institution"
              placeholder="e.g. Dhaka University"
              required
              value={formData.institution}
              onChange={handleChange}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="department" className="text-white/80">Department</Label>
            <Input
              id="department"
              name="department"
              placeholder="e.g. Computer Science and Engineering"
              required
              value={formData.department}
              onChange={handleChange}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="student_roll" className="text-white/80">Student Roll / ID</Label>
            <Input
              id="student_roll"
              name="student_roll"
              placeholder="e.g. 20-12345-1"
              required
              value={formData.student_roll}
              onChange={handleChange}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="fathers_name" className="text-white/80">Father's Name</Label>
            <Input
              id="fathers_name"
              name="fathers_name"
              placeholder="Father's Full Name"
              required
              value={formData.fathers_name}
              onChange={handleChange}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="mothers_name" className="text-white/80">Mother's Name</Label>
            <Input
              id="mothers_name"
              name="mothers_name"
              placeholder="Mother's Full Name"
              required
              value={formData.mothers_name}
              onChange={handleChange}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="address" className="text-white/80">Full Address</Label>
            <Input
              id="address"
              name="address"
              placeholder="House, Street, Area, City"
              required
              value={formData.address}
              onChange={handleChange}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
            />
          </div>

          <div className="space-y-2 text-left border border-white/10 p-4 rounded-lg bg-white/5">
            <Label className="text-white/80 mb-2 block">National ID / Birth Certificate</Label>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                <input 
                  type="radio" 
                  name="id_type" 
                  value="NID" 
                  checked={formData.id_type === "NID"} 
                  onChange={handleChange}
                  className="accent-purple-500"
                /> NID
              </label>
              <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                <input 
                  type="radio" 
                  name="id_type" 
                  value="Birth Certificate" 
                  checked={formData.id_type === "Birth Certificate"} 
                  onChange={handleChange}
                  className="accent-purple-500"
                /> Birth Certificate
              </label>
            </div>
            <Input
              id="id_number"
              name="id_number"
              placeholder={`Enter ${formData.id_type} Number`}
              required
              value={formData.id_number}
              onChange={handleChange}
              className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
            />
          </div>

          <div className="space-y-4 text-left border border-white/10 p-4 rounded-lg bg-white/5 mt-4">
            <h3 className="text-sm font-semibold text-white/90 border-b border-white/10 pb-2">Required Documents</h3>
            
            <div className="space-y-2">
              <Label className="text-white/80 text-xs">Recent Passport Size Photo (Image)</Label>
              <Input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="bg-black/20 border-white/10 text-white/70 file:text-white file:bg-white/10 file:border-0 file:mr-4 file:px-3 file:py-1 file:rounded-md cursor-pointer"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white/80 text-xs">Digital Signature (Image)</Label>
              <Input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setSignature(e.target.files?.[0] || null)}
                className="bg-black/20 border-white/10 text-white/70 file:text-white file:bg-white/10 file:border-0 file:mr-4 file:px-3 file:py-1 file:rounded-md cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80 text-xs">Resume / CV (PDF)</Label>
              <Input
                type="file"
                accept=".pdf"
                required
                onChange={(e) => setCv(e.target.files?.[0] || null)}
                className="bg-black/20 border-white/10 text-white/70 file:text-white file:bg-white/10 file:border-0 file:mr-4 file:px-3 file:py-1 file:rounded-md cursor-pointer"
              />
            </div>
          </div>

          {error && <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>}

          <Button 
            type="submit" 
            className="w-full relative overflow-hidden group border-0 text-white font-semibold transition-all duration-300 shadow-2xl hover:shadow-purple-900/40"
            style={{ background: "linear-gradient(135deg, #6b2fa8, #9b59b6)" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</span>
            ) : (
              "Submit Application"
            )}
            <span
              className="absolute inset-0 -translate-x-full opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
            />
          </Button>
        </form>
      </div>
    </div>
  );
}
