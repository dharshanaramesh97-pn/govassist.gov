import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { dbAdapter } from './server/adapters/databaseAdapter';
import {
  extractStructuredProfileWithLLM,
  generatePlainLanguageExplanation,
} from './server/adapters/llmAdapter';
import { transcribeAudioMockAdapter } from './server/adapters/speechAndTranslationAdapter';
import { evaluateAllSchemes } from './src/engine/eligibilityEngine';
import { CitizenProfile, LanguageCode } from './src/types/govassist';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  // ==========================================================================
  // 1. GUEST SESSION & CLEAR EVERYTHING ENDPOINTS
  // ==========================================================================
  app.post('/api/session/clear', async (req, res) => {
    const { sessionId } = req.body || {};
    if (sessionId) {
      await dbAdapter.clearGuestSession(String(sessionId));
    }
    res.json({
      ok: true,
      clearedAt: new Date().toISOString(),
      message: 'Temporary guest session data completely erased from memory.',
    });
  });

  app.post('/api/session/save-guest', async (req, res) => {
    const { sessionId, profile } = req.body || {};
    if (!sessionId || !profile) {
      res.status(400).json({ error: 'Missing sessionId or profile' });
      return;
    }
    await dbAdapter.saveGuestSession(String(sessionId), profile as CitizenProfile);
    res.json({ ok: true });
  });

  // ==========================================================================
  // 2. SPEECH-TO-TEXT ADAPTER ENDPOINT
  // ==========================================================================
  app.post('/api/speech/transcribe', async (req, res) => {
    const { language = 'en', simulateLowConfidence = false, sampleScenarioIndex = 0 } =
      req.body || {};
    const result = await transcribeAudioMockAdapter({
      language: language as LanguageCode,
      simulateLowConfidence: Boolean(simulateLowConfidence),
      sampleScenarioIndex: Number(sampleScenarioIndex),
    });
    res.json(result);
  });

  // ==========================================================================
  // 3. AI-ASSISTED SMART PROFILE EXTRACTION (Server-Side LLM Adapter)
  // ==========================================================================
  app.post('/api/ai/extract-profile', async (req, res) => {
    const { text = '', language = 'en' } = req.body || {};
    const result = await extractStructuredProfileWithLLM(String(text), language as LanguageCode);
    res.json(result);
  });

  // ==========================================================================
  // 4. DETERMINISTIC ELIGIBILITY EVALUATION + AI PLAIN-LANGUAGE EXPLANATION
  // ==========================================================================
  app.post('/api/schemes/evaluate', async (req, res) => {
    const { profile, language = 'en' } = req.body || {};
    if (!profile) {
      res.status(400).json({ error: 'Profile is required for evaluation' });
      return;
    }
    const publishedSchemes = await dbAdapter.getPublishedSchemes();
    const evaluations = evaluateAllSchemes(
      profile as CitizenProfile,
      publishedSchemes,
      language as LanguageCode
    );
    const explanation = await generatePlainLanguageExplanation(
      profile as CitizenProfile,
      evaluations,
      language as LanguageCode
    );

    res.json({
      evaluations,
      explanation,
      evaluatedAt: new Date().toISOString(),
    });
  });

  app.get('/api/schemes/published', async (_req, res) => {
    const schemes = await dbAdapter.getPublishedSchemes();
    res.json({ schemes });
  });

  // ==========================================================================
  // 5. CITIZEN ANONYMISED PROBLEM REPORT / UNANSWERED QUESTION
  // ==========================================================================
  app.post('/api/feedback/report', async (req, res) => {
    const { schemeId, schemeCode, issueType, comment, language = 'en' } = req.body || {};
    if (!schemeId || !comment) {
      res.status(400).json({ error: 'schemeId and comment are required' });
      return;
    }
    const created = await dbAdapter.submitAnonymisedFeedback({
      schemeId: String(schemeId),
      schemeCode: String(schemeCode || 'SAMPLE'),
      issueType: issueType || 'other',
      comment: String(comment),
      language: language as LanguageCode,
    });
    res.json({ ok: true, report: created });
  });

  // ==========================================================================
  // 6. OPTIONAL GUEST-TO-ACCOUNT CONVERSION (Mock OTP + Consent Record + Guest Wipe)
  // ==========================================================================
  app.post('/api/account/convert-guest', async (req, res) => {
    const {
      sessionId,
      phone,
      otpCode,
      consentedItems,
      consentStatementText,
      policyVersion = 'v1.2-2026-11',
      language = 'en',
      savedSchemeIds = [],
      profile,
      preferences,
    } = req.body || {};

    // Verify placeholder OTP (123456)
    if (String(otpCode).trim() !== '123456') {
      res.status(400).json({
        ok: false,
        error: 'Invalid mock OTP. Please enter placeholder code 123456.',
      });
      return;
    }

    // Reject if user accidentally entered a 12-digit Aadhaar number in the phone field
    const digitsOnly = String(phone || '').replace(/\D/g, '');
    if (digitsOnly.length === 12) {
      res.status(400).json({
        ok: false,
        error: 'Safety Block: 12-digit numbers are not accepted. Never enter an Aadhaar number.',
      });
      return;
    }

    const account = await dbAdapter.convertGuestToAccount({
      sessionId: String(sessionId || 'guest'),
      phone: digitsOnly,
      consentedItems: consentedItems || {
        saveSchemes: true,
        saveBasicProfile: false,
        savePreferences: true,
        optInReminders: false,
      },
      consentStatementText: String(consentStatementText || 'Explicit citizen consent recorded.'),
      policyVersion: String(policyVersion),
      language: language as LanguageCode,
      savedSchemeIds: Array.isArray(savedSchemeIds) ? savedSchemeIds : [],
      profile: profile as CitizenProfile,
      preferences,
    });

    res.json({
      ok: true,
      account,
      guestSessionWiped: true,
    });
  });

  app.put('/api/account/:userId', async (req, res) => {
    const updated = await dbAdapter.updateUserAccount(req.params.userId, req.body || {});
    if (!updated) {
      res.status(404).json({ ok: false, error: 'Account not found' });
      return;
    }
    res.json({ ok: true, account: updated });
  });

  app.delete('/api/account/:userId', async (req, res) => {
    const deleted = await dbAdapter.deleteUserAccount(req.params.userId);
    res.json({ ok: deleted });
  });

  // ==========================================================================
  // 7. PROTECTED ADMIN ENDPOINTS (Maker-Checker & Anonymised Feedback Only)
  // ==========================================================================
  app.get('/api/admin/dashboard-data', async (_req, res) => {
    const [schemes, feedback] = await Promise.all([
      dbAdapter.getAdminSchemes(),
      dbAdapter.getAnonymisedFeedback(),
    ]);
    res.json({
      schemes,
      feedback,
      privacyEnforcementNotice:
        'STRICT PRIVACY ISOLATION: Admin endpoints have zero access to citizen profiles or household records.',
    });
  });

  app.post('/api/admin/schemes/save', async (req, res) => {
    const { scheme, staffId } = req.body || {};
    if (!scheme || !staffId) {
      res.status(400).json({ ok: false, error: 'scheme and staffId are required' });
      return;
    }
    const saved = await dbAdapter.upsertSchemeByMaker(scheme, String(staffId));
    res.json({ ok: true, scheme: saved });
  });

  app.post('/api/admin/schemes/workflow', async (req, res) => {
    const { schemeId, targetStatus, staffId } = req.body || {};
    const result = await dbAdapter.transitionSchemeWorkflow({
      schemeId: String(schemeId),
      targetStatus,
      staffId: String(staffId),
    });
    if (!result.ok) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  });

  app.post('/api/admin/feedback/status', async (req, res) => {
    const { reportId, status } = req.body || {};
    const updated = await dbAdapter.updateFeedbackStatus(String(reportId), status);
    res.json({ ok: Boolean(updated), report: updated });
  });

  // ==========================================================================
  // VITE DEV MIDDLEWARE / PRODUCTION STATIC ASSETS
  // ==========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GovAssist server listening on http://localhost:${PORT}`);
  });
}

startServer();
