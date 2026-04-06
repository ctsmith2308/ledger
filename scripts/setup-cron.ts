/**
 * Registers QStash cron schedules for the target environment.
 *
 * Usage:
 *   npx tsx scripts/setup-cron.ts
 *
 * Required env vars:
 *   QSTASH_TOKEN  — QStash API token
 *   APP_URL       — Target environment URL (e.g. https://ledger-staging.up.railway.app)
 *   CRON_SECRET   — Bearer token the cron endpoint expects
 *
 * Run once per environment. Re-running is safe — it lists existing schedules
 * first so you can verify before creating duplicates.
 */

const QSTASH_API = 'https://qstash.upstash.io/v2';

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
};

const qstashToken = requiredEnv('QSTASH_TOKEN');
const appUrl = requiredEnv('APP_URL');
const cronSecret = requiredEnv('CRON_SECRET');

const headers = {
  Authorization: `Bearer ${qstashToken}`,
  'Content-Type': 'application/json',
};

const schedules = [
  {
    name: 'cleanup-trial-users',
    destination: `${appUrl}/api/cron/cleanup-trial-users`,
    cron: '0 3 * * *', // daily at 3am UTC
    forwardHeaders: {
      Authorization: `Bearer ${cronSecret}`,
    },
  },
];

const listSchedules = async () => {
  const res = await fetch(`${QSTASH_API}/schedules`, { headers });

  if (!res.ok) {
    console.error('Failed to list schedules:', await res.text());
    process.exit(1);
  }

  return res.json();
};

const createSchedule = async (schedule: (typeof schedules)[0]) => {
  const res = await fetch(
    `${QSTASH_API}/schedules/${encodeURIComponent(schedule.destination)}`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Upstash-Cron': schedule.cron,
        'Upstash-Forward-Authorization': schedule.forwardHeaders.Authorization,
      },
    },
  );

  if (!res.ok) {
    console.error(
      `Failed to create schedule "${schedule.name}":`,
      await res.text(),
    );
    process.exit(1);
  }

  const data = await res.json();
  console.log(`Created schedule "${schedule.name}": ${data.scheduleId}`);
};

const main = async () => {
  console.log(`Target: ${appUrl}\n`);

  const existing = await listSchedules();
  console.log(`Existing schedules: ${existing.length}`);

  for (const s of existing) {
    console.log(`  - ${s.scheduleId} → ${s.destination} (${s.cron})`);
  }

  console.log('');

  for (const schedule of schedules) {
    const duplicate = existing.find(
      (s: { destination: string }) => s.destination === schedule.destination,
    );

    if (duplicate) {
      console.log(
        `Skipping "${schedule.name}" — already exists (${duplicate.scheduleId})`,
      );
      continue;
    }

    await createSchedule(schedule);
  }

  console.log('\nDone.');
};

main();
