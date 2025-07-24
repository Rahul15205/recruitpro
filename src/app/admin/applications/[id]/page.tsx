'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Briefcase,
  FileText,
  MessageSquare,
  Edit
} from 'lucide-react';

interface ApplicationDetail {
  id: string;
  jobId: string;
  jobTitle: string;
  jobDepartment: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateLocation: string;
  appliedAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'on_hold';
  resume?: string;
  coverLetter?: string;
  experience: string;
  previousRole?: string;
  currentCompany?: string;
  expectedSalary?: string;
  availabilityDate?: string;
  customResponses?: Array<{
    question: string;
    answer: string;
  }>;
  notes?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: string;
  }>;
  resumePreviewUrl?: string; // Added for resume preview
}

const statusConfig = {
  pending: { 
    label: 'Pending Review', 
    icon: Clock, 
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    buttonColor: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
  },
  accepted: { 
    label: 'Accepted', 
    icon: CheckCircle, 
    color: 'text-green-600 bg-green-50 border-green-200',
    buttonColor: 'bg-green-100 text-green-800 hover:bg-green-200'
  },
  rejected: { 
    label: 'Rejected', 
    icon: XCircle, 
    color: 'text-red-600 bg-red-50 border-red-200',
    buttonColor: 'bg-red-100 text-red-800 hover:bg-red-200'
  },
  on_hold: { 
    label: 'On Hold', 
    icon: Clock, 
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    buttonColor: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  }
};

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [applicationId, setApplicationId] = useState<string>('');
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Extract applicationId from params
  useEffect(() => {
    const extractParams = async () => {
      const resolvedParams = await params;
      setApplicationId(resolvedParams.id);
    };
    extractParams();
  }, [params]);

  // Fetch application details from API
  useEffect(() => {
    if (!applicationId) return;

    const fetchApplication = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/admin/applications/${applicationId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setApplication(null);
            return;
          }
          throw new Error('Failed to fetch application');
        }
        
        const applicationData = await response.json();
        setApplication(applicationData);
        
      } catch (error) {
        console.error('Error fetching application:', error);
        setApplication(null);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  const handleStatusUpdate = async (newStatus: ApplicationDetail['status']) => {
    if (!application) return;
    
    setUpdatingStatus(true);
    try {
      // API call to update status
      const response = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: application.id,
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      const result = await response.json();
      
      // Update local state
      setApplication(prev => prev ? { ...prev, status: newStatus } : null);
      
      // Show success message (optional)
      console.log('Application status updated successfully');
      
    } catch (error) {
      console.error('Failed to update application status:', error);
      // You could add a toast notification here
      alert('Failed to update application status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !application) return;

    try {
      // API call to save note
      const response = await fetch(`/api/admin/applications/${application.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newNote.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      const result = await response.json();
      
      // Update local state with the new note
      setApplication(prev => prev ? {
        ...prev,
        notes: [...(prev.notes || []), result.note]
      } : null);

      setNewNote('');
      setShowNoteForm(false);
      
    } catch (error) {
      console.error('Failed to add note:', error);
      alert('Failed to add note. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadResume = async () => {
    if (!application) return;
    
    try {
      const response = await fetch(`/api/admin/applications/${application.id}/resume`);
      
      if (!response.ok) {
        if (response.status === 404) {
          alert('No resume found for this application.');
          return;
        }
        throw new Error('Failed to download resume');
      }
      
      // Get the filename from the response headers
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${application.candidateName}_Resume.txt`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Application not found</h3>
          <p className="text-gray-600 mb-8">The job you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button
            onClick={() => router.push('/admin/applications')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[application.status].icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {application.candidateName}
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Applied for {application.jobTitle}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Status Badge */}
                <div className={`flex items-center px-3 py-2 rounded-lg border ${statusConfig[application.status].color}`}>
                  <StatusIcon className="w-4 h-4 mr-2" />
                  <span className="font-medium">{statusConfig[application.status].label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Candidate Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-3" />
                      <span>{application.candidateEmail}</span>
                    </div>
                    {application.candidatePhone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-3" />
                        <span>{application.candidatePhone}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-3" />
                      <span>{application.candidateLocation}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-3" />
                      <span>Applied on {formatDate(application.appliedAt)}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Experience</span>
                      <p className="text-gray-900">{application.experience}</p>
                    </div>
                    {application.currentCompany && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Current Company</span>
                        <p className="text-gray-900">{application.currentCompany}</p>
                      </div>
                    )}
                    {application.expectedSalary && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Expected Salary</span>
                        <p className="text-gray-900">{application.expectedSalary}</p>
                      </div>
                    )}
                    {application.availabilityDate && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Available From</span>
                        <p className="text-gray-900">
                          {new Date(application.availabilityDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            {application.coverLetter && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Cover Letter
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {application.coverLetter}
                  </p>
                </div>
              </div>
            )}

            {/* Custom Questions */}
            {application.customResponses && application.customResponses.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Additional Questions
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {application.customResponses.map((response, index) => (
                    <div key={index}>
                      <h3 className="font-medium text-gray-900 mb-2">
                        {response.question}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {response.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Edit className="w-5 h-5 mr-2" />
                    Internal Notes
                  </h2>
                  <button
                    onClick={() => setShowNoteForm(!showNoteForm)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Add Note
                  </button>
                </div>
              </div>
              <div className="p-6">
                {/* Add Note Form */}
                {showNoteForm && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add your note here..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        onClick={() => {
                          setShowNoteForm(false);
                          setNewNote('');
                        }}
                        className="px-3 py-1.5 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>
                )}

                {/* Notes List */}
                <div className="space-y-4">
                  {application.notes && application.notes.length > 0 ? (
                    application.notes.map((note) => (
                      <div key={note.id} className="border-l-4 border-blue-200 pl-4">
                        <p className="text-gray-700 mb-2">{note.content}</p>
                        <div className="text-sm text-gray-500">
                          By {note.author} on {formatDate(note.createdAt)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No notes added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Job Details
                </h2>
              </div>
              <div className="p-6 space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Position</span>
                  <p className="text-gray-900">{application.jobTitle}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Department</span>
                  <p className="text-gray-900">{application.jobDepartment}</p>
                </div>
              </div>
            </div>

            {/* Resume */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Resume</h2>
              </div>
              <div className="p-6">
                {application.resumePreviewUrl ? (
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setShowPreview(prev => !prev)}
                      className="mb-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {showPreview ? 'Hide Resume Preview' : 'Show Resume Preview'}
                    </button>
                    {showPreview && (
                      <img
                        src={application.resumePreviewUrl}
                        alt="Resume Preview"
                        style={{ maxWidth: 400, border: '1px solid #ccc', borderRadius: 8, marginBottom: 12 }}
                      />
                    )}
                    <a
                      href={application.resumePreviewUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mt-2"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Resume Image
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-gray-400 mb-2">
                      <FileText className="w-8 h-8 mx-auto" />
                    </div>
                    <p className="text-sm text-gray-500">No resume uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                {application.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate('accepted')}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Application
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('on_hold')}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Put On Hold
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Application
                    </button>
                  </>
                )}
                
                {application.status === 'on_hold' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate('accepted')}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Application
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('pending')}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Mark as Pending
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Application
                    </button>
                  </>
                )}
                
                {(application.status === 'accepted' || application.status === 'rejected') && (
                  <button
                    onClick={() => handleStatusUpdate('pending')}
                    disabled={updatingStatus}
                    className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Reopen for Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
