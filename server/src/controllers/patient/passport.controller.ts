import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError } from '../../utils/errors.js';
import { requirePatient } from '../../utils/lookup.js';

/**
 * GET /api/patients/me/passport
 * Returns the patient's full health passport:
 *  - prescriptions (all, from all hospitals)
 *  - reports (all)
 *  - grants (enriched with doctor names, document details, grouped by doctor)
 *  - referrals (incoming referrals to this patient)
 */
export async function getPatientPassport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authenticated user not found', 401);

    const patient = await requirePatient(userId);

    // Run all queries in parallel
    const [prescriptionsResult, reportsResult, grantsResult, referralsResult] = await Promise.all([
      supabaseAdmin
        .from('prescriptions')
        .select(
          `id, appointment_id, doctor_id, patient_id, illness_description, issued_at, pdf_url,
           doctors ( full_name, specialisation, hospitals ( name, city ) ),
           prescription_items (
             id, medicine_id, dosage, frequency, duration, doctor_comment,
             medicines ( medicine_name, composition, therapeutic_class, uses )
           )`
        )
        .eq('patient_id', patient.id)
        .order('issued_at', { ascending: false }),
      supabaseAdmin
        .from('patient_reports')
        .select('*, hospitals ( name, city )')
        .eq('patient_id', patient.id)
        .order('uploaded_at', { ascending: false }),
      supabaseAdmin
        .from('record_access_grants')
        .select(
          `id, granted_to_hospital_id, granted_to_doctor_id, record_types, 
           document_type, document_id, source, valid_until, created_at`
        )
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false }),
      Promise.resolve(
        supabaseAdmin
          .from('referrals')
          .select(
            `id, referring_doctor_id, referred_to_doctor_id, reason, status, created_at, updated_at`
          )
          .eq('patient_id', patient.id)
          .order('created_at', { ascending: false })
      ).catch(() => ({ data: [], error: null })), // graceful: referrals table may not exist yet
    ]);

    if (prescriptionsResult.error) {
      console.error('[getPatientPassport] prescriptions query failed:', prescriptionsResult.error.message);
      throw new AppError('Failed to fetch prescriptions', 500);
    }

    // Enrich grants with doctor & document details
    const rawGrants = grantsResult.data ?? [];
    let enrichedGrants: any[] = [];

    if (rawGrants.length > 0) {
      const doctorIds = [...new Set(rawGrants.map(g => g.granted_to_doctor_id).filter(Boolean))];
      const prescriptionIds = rawGrants.filter(g => g.document_type === 'prescription').map(g => g.document_id).filter(Boolean);
      const reportIds = rawGrants.filter(g => g.document_type === 'report').map(g => g.document_id).filter(Boolean);

      const [doctorsRes, rxRes, rptRes] = await Promise.all([
        doctorIds.length > 0
          ? supabaseAdmin.from('doctors').select('id, full_name, specialisation, hospitals ( name, city )').in('id', doctorIds as string[])
          : Promise.resolve({ data: [] }),
        prescriptionIds.length > 0
          ? supabaseAdmin.from('prescriptions').select('id, illness_description, issued_at, doctors ( full_name )').in('id', prescriptionIds as string[])
          : Promise.resolve({ data: [] }),
        reportIds.length > 0
          ? supabaseAdmin.from('patient_reports').select('id, report_name, report_type, uploaded_at').in('id', reportIds as string[])
          : Promise.resolve({ data: [] }),
      ]);

      const doctorMap: Record<string, any> = {};
      for (const d of (doctorsRes.data ?? [])) doctorMap[d.id] = d;

      const rxMap: Record<string, any> = {};
      for (const p of (rxRes.data ?? [])) rxMap[p.id] = p;

      const rptMap: Record<string, any> = {};
      for (const r of (rptRes.data ?? [])) rptMap[r.id] = r;

      enrichedGrants = rawGrants.map(g => ({
        ...g,
        doctor: g.granted_to_doctor_id ? doctorMap[g.granted_to_doctor_id] ?? null : null,
        document: g.document_id
          ? (g.document_type === 'prescription' ? rxMap[g.document_id] : rptMap[g.document_id]) ?? null
          : null,
        is_active: new Date(g.valid_until) > new Date(),
      }));
    }

    // Enrich referrals with doctor names
    const rawReferrals = referralsResult.data ?? [];
    let enrichedReferrals: any[] = [];

    if (rawReferrals.length > 0) {
      const allDoctorIds = [
        ...new Set([
          ...rawReferrals.map(r => r.referring_doctor_id),
          ...rawReferrals.map(r => r.referred_to_doctor_id),
        ].filter(Boolean)),
      ];

      const { data: refDoctors } = await supabaseAdmin
        .from('doctors')
        .select('id, full_name, specialisation, hospitals ( name, city )')
        .in('id', allDoctorIds as string[]);

      const refDocMap: Record<string, any> = {};
      for (const d of (refDoctors ?? [])) refDocMap[d.id] = d;

      enrichedReferrals = rawReferrals.map(r => ({
        ...r,
        referring_doctor: refDocMap[r.referring_doctor_id] ?? null,
        referred_to_doctor: refDocMap[r.referred_to_doctor_id] ?? null,
      }));
    }

    sendSuccess(
      res,
      {
        profile: patient,
        prescriptions: prescriptionsResult.data ?? [],
        reports: reportsResult.data ?? [],
        grants: enrichedGrants,
        referrals: enrichedReferrals,
      },
      'Health passport retrieved'
    );
  } catch (err) {
    next(err);
  }
}
