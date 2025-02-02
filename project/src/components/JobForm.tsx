import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, MapPin, Calendar, Instagram, BriefcaseIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { WorkType, ScheduleType, ZoneType } from '../types/database';

interface JobFormData {
  agency: string;
  instagram: string;
  work_type: WorkType;
  brand: string;
  zone: ZoneType;
  schedule: ScheduleType[];
  expiry_date: string;
}

export default function JobForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<JobFormData>();

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { error: submitError } = await supabase
        .from('jobs')
        .insert([data]);

      if (submitError) throw submitError;

      setSuccess(true);
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Publicar Trabajo</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
            Trabajo publicado exitosamente
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Nombre de Agencia
              </span>
            </label>
            <input
              {...register('agency', { required: 'Este campo es requerido' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre de tu agencia"
            />
            {errors.agency && (
              <p className="mt-1 text-sm text-red-600">{errors.agency.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </span>
            </label>
            <input
              {...register('instagram', {
                required: 'Este campo es requerido',
                pattern: {
                  value: /^@/,
                  message: 'Debe comenzar con @'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="@tuagencia"
            />
            {errors.instagram && (
              <p className="mt-1 text-sm text-red-600">{errors.instagram.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-2">
                <BriefcaseIcon className="w-4 h-4" />
                Tipo de Trabajo
              </span>
            </label>
            <select
              {...register('work_type', { required: 'Este campo es requerido' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar tipo</option>
              <option value="photos">Fotos</option>
              <option value="modeling">Modelaje</option>
              <option value="advertising">Publicidad</option>
            </select>
            {errors.work_type && (
              <p className="mt-1 text-sm text-red-600">{errors.work_type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Marca
              </span>
            </label>
            <input
              {...register('brand', { required: 'Este campo es requerido' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre de la marca"
            />
            {errors.brand && (
              <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Zona
              </span>
            </label>
            <select
              {...register('zone', { required: 'Este campo es requerido' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar zona</option>
              <option value="Palermo">Palermo</option>
              <option value="Recoleta">Recoleta</option>
              <option value="Belgrano">Belgrano</option>
              <option value="San Telmo">San Telmo</option>
              <option value="Puerto Madero">Puerto Madero</option>
              <option value="Núñez">Núñez</option>
              <option value="Caballito">Caballito</option>
              <option value="Villa Crespo">Villa Crespo</option>
              <option value="Almagro">Almagro</option>
              <option value="Colegiales">Colegiales</option>
            </select>
            {errors.zone && (
              <p className="mt-1 text-sm text-red-600">{errors.zone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Horario
              </span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('schedule', { required: 'Selecciona al menos un horario' })}
                  value="morning"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Mañana</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('schedule')}
                  value="afternoon"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Tarde</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('schedule')}
                  value="night"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Noche</span>
              </label>
            </div>
            {errors.schedule && (
              <p className="mt-1 text-sm text-red-600">{errors.schedule.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de Expiración
              </span>
            </label>
            <input
              type="date"
              {...register('expiry_date', { required: 'Este campo es requerido' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.expiry_date && (
              <p className="mt-1 text-sm text-red-600">{errors.expiry_date.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                required
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                Acepto que mis datos sean procesados según la política de privacidad
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar Trabajo'}
          </button>
        </div>
      </div>
    </form>
  );
}