import fs from 'node:fs';
import {MATCHES,createState} from '../../src/v4/data.js';
import {rankRecommendations,recommendationFor} from '../../src/v5/domain/recommendation-engine.js';

function must(value,message){if(!value)throw new Error(message)}
const state=createState({region:'수원 · 영통',position:'MF',level:'중급'});
const ranked=rankRecommendations(MATCHES,state);
must(ranked.length===MATCHES.length,'domain engine must rank the complete catalog');
must(ranked.every(item=>Number.isFinite(item.score)&&item.match?.id),'ranked items must be domain values');
must(JSON.stringify(ranked.map(item=>item.match.id))===JSON.stringify(rankRecommendations(MATCHES,state).map(item=>item.match.id)),'ranking must be deterministic');
must(recommendationFor(MATCHES[0],state).reasons.length>=3,'recommendation reason contract must remain explainable');

const app=fs.readFileSync('app.html','utf8');
const decision=fs.readFileSync('src/v4/decision.js','utf8');
const css=fs.readFileSync('src/v4/design-system-v2.css','utf8');
must(!app.includes('fm-real-app-white-tone'),'white-first CSS must live in the design-system asset, not inline HTML');
must(!app.includes('fm-product-polish-compat'),'compat polish CSS must live in the design-system asset, not inline HTML');
must(!app.includes("const redundant=new Set(['나와 잘 맞는 이유'"),'Detail cleanup must not use an app.html MutationObserver patch');
must(decision.includes("screen.dataset.productDetail='prioritized'"),'Detail prioritization must be owned by decision runtime');
must(css.includes('Product hardening: migrated white-first runtime styles'),'design-system must own migrated white-first styles');
must(!app.includes('id="footmate-next" aria-live'),'whole application root must not be a live region');
must(app.includes('id="footmate-route-status"'),'dedicated route status live region is required');
must(app.includes('name="theme-color" content="#F7F8F7"'),'mobile browser theme color must match white-first canvas');
console.log('PASS v5.2 product hardening contracts');
