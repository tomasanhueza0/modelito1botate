import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Job } from '../types/database';

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setJobs(data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar trabajos');
      } finally {
        setIsLoading(false);
      }
    }

    fetchJobs();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Cargando trabajos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Trabajos Publicados</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">{job.brand}</h3>
                <p className="mt-1 text-sm text-gray-500">{job.agency}</p>
                <dl className="mt-4 space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tipo de Trabajo</dt>
                    <dd className="mt-1 text-sm text-gray-900">{job.work_type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Zona</dt>
                    <dd className="mt-1 text-sm text-gray-900">{job.zone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Horarios</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {job.schedule.join(', ')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contacto</dt>
                    <dd className="mt-1 text-sm text-gray-900">{job.instagram}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Expira</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(job.expiry_date).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}