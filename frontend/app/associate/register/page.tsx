// "use client";

// import { useState } from "react";
// import { AssociateFormModal } from "@/app/dashboard/associate/page";

// export default function PublicAssociateRegisterPage() {
//   const [submitted, setSubmitted] = useState(false);

//   if (submitted) {
//     return (
//       <div style={{
//         minHeight: "100vh", background: "#f8fafc", display: "flex",
//         flexDirection: "column", alignItems: "center", justifyContent: "center",
//         padding: 24, fontFamily: "sans-serif"
//       }}>
//         <div style={{
//           background: "#fff", borderRadius: 20, padding: "48px 36px",
//           maxWidth: 440, width: "100%", textAlign: "center",
//           boxShadow: "0 8px 40px rgba(99,102,241,0.12)", border: "1.5px solid #e0e7ff"
//         }}>
//           <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
//           <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1e293b", marginBottom: 10 }}>
//             Application Submitted!
//           </h2>
//           <p style={{ color: "#64748b", lineHeight: 1.8, marginBottom: 24, fontSize: "0.9rem" }}>
//             Thank you for registering as an <strong>NTSC Associate</strong>.<br />
//             Our team will review your application and get back to you shortly.
//           </p>
//           <div style={{
//             background: "#eef2ff", borderRadius: 12, padding: "12px 20px",
//             color: "#6366f1", fontWeight: 700, fontSize: "0.84rem", marginBottom: 16
//           }}>
//             ⏳ Status: Pending Review
//           </div>
//           <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
//             You will receive a confirmation on your registered email.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
//       <div style={{
//         padding: "14px 24px", background: "#fff",
//         borderBottom: "1.5px solid #e2e8f0", textAlign: "center",
//         boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
//       }}>
//         <h1 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#6366f1", margin: 0 }}>
//           NTSC — Associate Registration
//         </h1>
//         <p style={{ fontSize: "0.73rem", color: "#94a3b8", marginTop: 4, marginBottom: 0 }}>
//           Fill in all steps and submit your application
//         </p>
//       </div>

//       <AssociateFormModal
//         existing={null}
//         isPublic={true}
//         onClose={() => {}}
//         onSaved={() => setSubmitted(true)}
//       />
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AssociateFormModal } from "@/app/dashboard/associate/page";

export default function PublicAssociateRegisterPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{
        padding: "14px 24px", background: "#fff",
        borderBottom: "1.5px solid #e2e8f0", textAlign: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
      }}>
        <h1 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#6366f1", margin: 0 }}>
          NTSC — Associate Registration
        </h1>
        <p style={{ fontSize: "0.73rem", color: "#94a3b8", marginTop: 4, marginBottom: 0 }}>
          Fill in all steps and submit your application
        </p>
      </div>

      <AssociateFormModal
        existing={null}
        isPublic={true}
        onClose={() => {}}
        onSaved={() => setShowSuccess(true)}
      />

      {/* ✅ Success Popup */}
      {showSuccess && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: "48px 36px",
            maxWidth: 420, width: "90%", textAlign: "center",
            boxShadow: "0 8px 40px rgba(99,102,241,0.18)",
            border: "1.5px solid #e0e7ff"
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1e293b", marginBottom: 10 }}>
              Application Submitted!
            </h2>
            <p style={{ color: "#64748b", lineHeight: 1.8, marginBottom: 24, fontSize: "0.9rem" }}>
              Thank you for registering as an <strong>NTSC Associate</strong>.<br />
              Our team will review your application and get back to you shortly.
            </p>
            <div style={{
              background: "#eef2ff", borderRadius: 12, padding: "10px 20px",
              color: "#6366f1", fontWeight: 700, fontSize: "0.84rem", marginBottom: 28
            }}>
              ⏳ Status: Pending Review
            </div>
            <button
              onClick={() => router.push("/")}
              style={{
                background: "#6366f1", color: "#fff", border: "none",
                borderRadius: 10, padding: "12px 36px", fontWeight: 700,
                fontSize: "0.95rem", cursor: "pointer", width: "100%",
                boxShadow: "0 2px 8px rgba(99,102,241,0.25)"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}