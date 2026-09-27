const {test}=require('@playwright/test');
const {persistence,gates,recovery}=require('./helpers/checkin.cjs');
test('check-in completion is shared by Home, Detail and MY and survives reload',async({page})=>persistence(page));
test('check-in enforces participation, time boundaries, cancellation and legacy migration',async({page})=>gates(page));
test('check-in storage failure retries without leaking completion to another match',async({page})=>recovery(page));
