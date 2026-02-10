
"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import html2canvas from "html2canvas";

export default function CertificateContent() {
  const searchParams = useSearchParams();
  const [name, setName] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchParams) {
      const nameParam = searchParams.get("name");
      const dateParam = searchParams.get("date");
      
      if (nameParam) {
        setName(decodeURIComponent(nameParam));
      }
      if (dateParam) {
        setDate(decodeURIComponent(dateParam));
      }
    }
  }, [searchParams]);

  // Fallback to set imageLoaded to true after 3 seconds if onLoad doesn't fire
  useEffect(() => {
    const timer = setTimeout(() => {
      setImageLoaded(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    setIsDownloading(true);

    try {
      // Wait for everything to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 2000));

      const canvas = await html2canvas(certificateRef.current, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 0,
        removeContainer: false,
        foreignObjectRendering: false,
        width: certificateRef.current.offsetWidth,
        height: certificateRef.current.offsetHeight,
      });

      const link = document.createElement("a");
      const fileName = `Certificate_${name.replace(/\s+/g, "_")}.png`;
      link.download = fileName;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();

      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
        backgroundColor: "#ffffff",
        fontFamily: "Footlight MT Light, sans-serif"
      }}>
        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: "20px"
        }}>
          <h1 style={{
            fontSize: "clamp(24px, 5vw, 36px)",
            fontWeight: "bold",
            color: "#800020",
            marginBottom: "8px",
            margin: "0 0 8px 0"
          }}>
            Your Certificate of Participation
          </h1>
          <p style={{
            fontSize: "clamp(12px, 3vw, 16px)",
            color: "#666666",
            margin: "0"
          }}>
            Click the download button below to save your certificate
          </p>
        </div>

        {/* Certificate Container */}
        <div 
          ref={certificateRef}
          id="certificate-container"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "900px",
            marginBottom: "18px",
            boxShadow: "0 4px 12px rgba(128, 0, 32, 0.2)",
            borderRadius: "4px",
            overflow: "hidden",
            backgroundColor: "#ffffff"
          }}
        >
          {/* Certificate Background Image */}
          <img
            src="/certificate.png"
            alt="Certificate of Participation"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
            style={{
              width: "100%",
              height: "auto",
              display: "block"
            }}
            crossOrigin="anonymous"
          />

          {/* Name Overlay - Positioned on the line */}
          <div 
          style={{
            position: "absolute",
            top: "39%",
            left: "0",
            right: "0",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            padding: "0 10%"
          }}>
            <p style={{
              fontFamily: "'Footlight MT Light', 'Lucida Handwriting', cursive",
              fontWeight: "bold",
              fontSize: "clamp(20px, 4vw, 42px)",
              color: "#2B2828",
              textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
              letterSpacing: "0.02em",
              margin: "0",
              padding: "0",
              textAlign: "center",
              width: "100%",
              lineHeight: "1.2"
            }}>
              {name || "Your Name"}
            </p>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading || !imageLoaded}
          style={{
            fontSize: "clamp(14px, 3vw, 18px)",
            padding: "12px 24px",
            fontWeight: "600",
            backgroundColor: isDownloading || !imageLoaded ? "#600018" : "#800020",
            color: "#ffffff",
            border: "none",
            borderRadius: "25px",
            cursor: isDownloading || !imageLoaded ? "not-allowed" : "pointer",
            boxShadow: "0 4px 12px rgba(128, 0, 32, 0.3)",
            transition: "all 0.3s ease",
            opacity: isDownloading || !imageLoaded ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
          onMouseEnter={(e) => {
            if (!isDownloading && imageLoaded) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(128, 0, 32, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(128, 0, 32, 0.3)";
          }}
        >
          <span style={{ fontSize: "clamp(16px, 4vw, 20px)" }}></span>
          {isDownloading ? "Preparing Download..." : !imageLoaded ? "Loading..." : "Download Certificate"}
        </button>

        {/* Instruction Text */}
        <p style={{
          marginTop: "16px",
          fontSize: "clamp(11px, 2.5vw, 14px)",
          color: "#666666",
          textAlign: "center",
          margin: "16px 0 0 0",
          padding: "0 20px"
        }}>
        
        </p>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div style={{
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "clamp(20px, 5vw, 40px)",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            textAlign: "center"
          }}>
            <h2 style={{
              fontSize: "clamp(24px, 5vw, 32px)",
              fontWeight: "bold",
              color: "#800020",
              marginBottom: "16px",
              fontFamily: "Timew New Roman, sans-serif",
              margin: "0 0 16px 0"
            }}>
               Certificate Downloaded!
            </h2>
            
            <p style={{
              fontSize: "clamp(14px, 3vw, 18px)",
              fontWeight: "600",
              color: "#333333",
              fontFamily: "Times New Roman",
              marginBottom: "24px",
              margin: "0 0 24px 0"
            }}>
              Your certificate has been successfully downloaded.
            </p>

            <div style={{
              padding: "clamp(16px, 4vw, 24px)",
              backgroundColor: "#fff5f7",
              borderRadius: "8px",
              marginBottom: "24px"
            }}>
              <p style={{
                fontSize: "clamp(13px, 3vw, 16px)",
                fontWeight: "600",
                color: "#800020",
                marginBottom: "12px",
                margin: "0 0 12px 0",
                fontFamily: "Footlight MT Light, sans-serif"
              }}>
                 Share Your Achievement!
              </p>
              <p style={{
                fontSize: "clamp(11px, 2.5vw, 14px)",
                color: "#666666",
                lineHeight: "1.6",
                fontWeight: "bold",
                margin: "0",
                fontFamily: "Times New Roman" }}>
                We&apos;d love for you to share your Happiness Index journey on social media. 
                Inspire others to take the first step towards emotional wellness!
              </p>
            </div>
            <button
              onClick={() => setShowSuccessPopup(false)}
              style={{
                width: "100%",
                padding: "clamp(10px, 3vw, 14px)",
                fontSize: "clamp(13px, 3vw, 16px)",
                fontWeight: "600",
                backgroundColor: "#800020",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#600018";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#800020";
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
} 