'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CompleteForm() {
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('pb_user');
    if (storedData) {
      setFormData(JSON.parse(storedData));
    }
  }, []);

  if (!formData) return <div>Loading...</div>;

  const { general, experience, skills } = formData;

  const formatDate = (dateStr: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  const renderBadges = (input: string[] | string) => {
    if (Array.isArray(input)) {
      return input.map((item, i) => (
        <Badge key={i}>{item}</Badge>
      ));
    } else if (typeof input === 'string') {
      return input.split(',').map((item, i) => (
        <Badge key={i}>{item.trim()}</Badge>
      ));
    }
    return <Badge>-</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* General Info */}
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div><strong>First Name:</strong> {general?.firstname || '-'}</div>
          <div><strong>Last Name:</strong> {general?.lastname || '-'}</div>
          <div><strong>Email:</strong> {general?.email || '-'}</div>
          <div><strong>Address:</strong> {general?.address || '-'}</div>
          <div><strong>City:</strong> {general?.city || '-'}</div>
          <div><strong>Country:</strong> {general?.country || '-'}</div>
          <div><strong>Location:</strong> {general?.location || '-'}</div>
          <div><strong>Major:</strong> {general?.major || '-'}</div>
          <div><strong>Work Preference:</strong> {general?.work_preference || '-'}</div>
          <div><strong>Preferred Work Style:</strong> {general?.preferred_work_setting || '-'}</div>
        </CardContent>
      </Card>

      {/* Experience Info */}
      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-4">
          <div><strong>Worked Before:</strong> {experience?.have_experience_before ? 'Yes' : 'No'}</div>

          {experience?.experience?.length > 0 ? (
            experience.experience.map((expItem: any, idx: number) => (
              <div key={idx} className="border p-3 rounded-md">
                <div><strong>Job Title:</strong> {expItem.job_title || '-'}</div>
                <div><strong>Company Name:</strong> {expItem.company_name || '-'}</div>
                <div><strong>Duration:</strong> {formatDate(expItem.from)} - {formatDate(expItem.to)}</div>
                <div><strong>Responsibilities:</strong> {expItem.responsibilities || '-'}</div>
              </div>
            ))
          ) : (
            <div>No experience available</div>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-4">
          <div>
            <strong>Soft Skills:</strong>
            <div className="flex flex-wrap gap-2 mt-1">
              {renderBadges(skills?.soft_skill)}
            </div>
          </div>
          <div>
            <strong>Hard Skills:</strong>
            <div className="flex flex-wrap gap-2 mt-1">
              {renderBadges(skills?.hard_skill)}
            </div>
          </div>
          <div>
            <strong>Language:</strong>
            <div className="flex flex-wrap gap-2 mt-1">
              {renderBadges(skills?.languages)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
