'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

const jobSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  department: z.string().min(2, "Department must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  salary: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.string().optional(),
  customFields: z.string().optional()
})

type JobForm = z.infer<typeof jobSchema>

export default function CreateJob() {
  const { register, handleSubmit, formState: { errors } } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (data: JobForm) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        router.push('/admin/dashboard')
      } else {
        console.error('Failed to create job')
      }
    } catch (error) {
      console.error('Error submitting job:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create a New Job</h1>
          <p className="text-gray-600 mt-2">Fill in the details below to post a new job opening</p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form className="p-8 space-y-8" onSubmit={handleSubmit(onSubmit)}>
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    {...register('title')}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                  {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>}
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    {...register('department')}
                    placeholder="e.g. Engineering"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                  {errors.department && <p className="mt-2 text-sm text-red-600">{errors.department.message}</p>}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    {...register('location')}
                    placeholder="e.g. New York, NY (Remote)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                  {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location.message}</p>}
                </div>

                <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    {...register('salary')}
                    placeholder="e.g. $80,000 - $120,000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                  {errors.salary && <p className="mt-2 text-sm text-red-600">{errors.salary.message}</p>}
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={6}
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-vertical"
                  />
                  {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>}
                </div>

                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements & Qualifications
                  </label>
                  <textarea
                    {...register('requirements')}
                    rows={5}
                    placeholder="List the required skills, experience, and qualifications..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-vertical"
                  />
                  {errors.requirements && <p className="mt-2 text-sm text-red-600">{errors.requirements.message}</p>}
                </div>
              </div>
            </div>

            {/* Custom Fields */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom Application Questions</h2>
              <div>
                <label htmlFor="customFields" className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Fields (Optional)
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Add custom questions for applicants. Leave empty if not needed.
                  Example: [["Why are you interested in this role?"], ["What's your expected start date?"]]
                </p>
                <textarea
                  {...register('customFields')}
                  rows={4}
                  placeholder='[["Question 1?"], ["Question 2?"], ["Question 3?"]]'
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-mono text-sm resize-vertical"
                />
                {errors.customFields && <p className="mt-2 text-sm text-red-600">{errors.customFields.message}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Job...
                  </>
                ) : (
                  'Create Job Posting'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
