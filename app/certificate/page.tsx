import { Suspense } from "react";
import CertificateContent from "./CertificateContent";

export const dynamic = 'force-dynamic';

export default function CertificatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "rgb(255, 255, 255)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "rgb(222, 15, 63)" }}></div>
          <p style={{ color: "rgb(107, 114, 128)" }}>Loading certificate...</p>
        </div>
      </div>
    }>
      <CertificateContent />
    </Suspense>
  );
}