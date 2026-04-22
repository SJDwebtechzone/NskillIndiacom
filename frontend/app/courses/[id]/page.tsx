// app/courses/[id]/page.tsx
// Async Server Component — fetches from Express backend

import { notFound } from "next/navigation";
import CourseDetailClient from "../CourseDetailClient";

// ─── Fetch single course by slug ──────────────────────────────────────────────
async function getCourse(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/courses/slug/${slug}`,
      {
        next: { revalidate: 60 }, // re-fetch every 60 seconds (ISR)
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!res.ok) {
      console.error(`getCourse(${slug}) failed: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(`getCourse(${slug}) network error:`, err);
    return null;
  }
}

// ─── Fetch all courses for sidebar ────────────────────────────────────────────
async function getAllCourses() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/courses`,
      {
        next: { revalidate: 60 },
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!res.ok) {
      console.error(`getAllCourses() failed: ${res.status}`);
      return [];
    }
    return res.json();
  } catch (err) {
    console.error("getAllCourses() network error:", err);
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // id = slug from URL e.g. "hvac-refrigeration-basic"

  const [raw, allCourses] = await Promise.all([
    getCourse(id),
    getAllCourses(),
  ]);

  // If course not found → show Next.js 404 page
  if (!raw) return notFound();

  // ── Map DB columns to the shape CourseDetailClient expects ─────────────────
  const course = {
    ...raw,
    content:             [raw.content ?? ""],           // components use content[0]
    videos:              raw.videos ?? [],               // JSONB array
    faqs:                raw.extra_sections ?? [],       // {q, a}[] from extra_sections
    careerOpportunities: raw.career_opportunities ?? [], // text[]
    duration:            raw.duration ?? "N/A",
    certification:       raw.certification ?? "NSDC Approved",
    brochure_url:        raw.brochure_url ?? null,
  };

  // Normalise allCourses so sidebar uses slug as the link id
  const normalisedCourses = allCourses.map((c: any) => ({
    id:       c.slug,   // ← sidebar links use /courses/:slug
    title:    c.title,
    category: c.category,
  }));

  return (
    <CourseDetailClient
      course={course}
      allCourses={normalisedCourses}
      currentSlug={id}
    />
  );
}

// ─── Optional: Pre-generate static pages at build time ────────────────────────
// Uncomment this if you want full SSG (fastest possible pages)
//
// export async function generateStaticParams() {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`);
//     const courses = await res.json();
//     return courses.map((c: any) => ({ id: c.slug }));
//   } catch {
//     return [];
//   }
// }
