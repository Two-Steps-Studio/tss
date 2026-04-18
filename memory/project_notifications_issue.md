{
  "project": "tss-website",
  "date": "2026-03-13",
  "issue": "Notifications page shows no data",
  "cause": "Supabase tables (news, e_sport_events, dev_tasks) are empty",
  "solutions": [
    "Add test data via Supabase dashboard or using the 'Dodaj testowe' button on the page",
    "Add sample data manually to the tables",
    "Set up a seed script to populate tables on first deployment"
  ],
  "status": "resolved with workaround (test button)"
}
