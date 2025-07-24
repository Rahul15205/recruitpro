"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  salary?: string;
  description: string;
  requirements?: string;
  customFields?: string[][];
  status: string;
  createdAt: string;
  requiresResume: boolean;
}

interface Application {
  id: string;
  status: string;
  createdAt: string;
}

const applicationSchema = z.object({
  resume: z
    .any()
    .optional()
    .refine(
      (files) =>
        !files || files?.length === 0 || files?.[0]?.type === "application/pdf",
      "Only PDF files are allowed"
    )
    .refine(
      (files) => !files || files?.length === 0 || files?.[0]?.size <= 5000000,
      "File size must be less than 5MB"
    ),
  answers: z
    .record(z.string(), z.string().min(1, "This field is required"))
    .optional(),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

export default function JobDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [existingApplication, setExistingApplication] =
    useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [jobId, setJobId] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
  });

  useEffect(() => {
    const initParams = async () => {
      const { id } = await params;
      setJobId(id);
    };
    initParams();
  }, []);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  useEffect(() => {
    if (session?.user && job) {
      checkExistingApplication();
    }
  }, [session, job]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else {
        console.error("Job not found");
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingApplication = async () => {
    try {
      const response = await fetch(`/api/applications/check/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setExistingApplication(data.application);
      }
    } catch (error) {
      console.error("Error checking application:", error);
    }
  };

  const onSubmit = async (data: ApplicationForm) => {
    setApplying(true);
    try {
      const formData = new FormData();
      formData.append("jobId", jobId);

      // Only append resume if it exists and is required
      if (data.resume && data.resume.length > 0) {
        formData.append("resume", data.resume[0]);
      }

      // Handle answers
      if (data.answers) {
        formData.append("answers", JSON.stringify(data.answers));
      }

      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setExistingApplication(result.application);
        setShowApplicationForm(false);
        alert("Application submitted successfully!");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Network error. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Job Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The job you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {job.title}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600 mb-4">
                <span>🏢 {job.department}</span>
                <span>📍 {job.location}</span>
                {job.salary && <span>💰 {job.salary}</span>}
              </div>
              <p className="text-sm text-gray-500">
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Application Status */}
            <div className="ml-6">
              {status === "loading" ? (
                <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
              ) : !session ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Sign in to apply</p>
                  <Link
                    href={`/auth/signin?redirect=/jobs/${jobId}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Sign In
                  </Link>
                </div>
              ) : existingApplication ? (
                <div className="text-center">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                      existingApplication.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : existingApplication.status === "ACCEPTED"
                        ? "bg-green-100 text-green-800"
                        : existingApplication.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {existingApplication.status}
                  </div>
                  <p className="text-xs text-gray-500">
                    Applied{" "}
                    {new Date(
                      existingApplication.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              ) : session.user.role === "ADMIN" ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600">You created this job</p>
                </div>
              ) : (
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Job Description
          </h2>
          <div className="prose max-w-none text-gray-700">
            {job.description.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Requirements
            </h2>
            <div className="prose max-w-none text-gray-700">
              {job.requirements.split("\n").map((req, index) => (
                <p key={index} className="mb-2">
                  {req}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Application Form Modal */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Apply for {job.title}
                  </h2>
                  <button
                    onClick={() => setShowApplicationForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Resume Upload */}
                  {job.requiresResume && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resume (PDF only, max 5MB) *
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        {...register("resume")}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {typeof errors.resume?.message === "string" && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.resume.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Custom Fields */}
                  {job.customFields && job.customFields.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Additional Questions
                      </h3>
                      {job.customFields.map((field, index) => (
                        <div key={index}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field[0]} *
                          </label>
                          <textarea
                            {...register(`answers.${index}`)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Your answer..."
                          />
                          {errors.answers?.[index] && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.answers[index].message}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applying}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {applying ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
